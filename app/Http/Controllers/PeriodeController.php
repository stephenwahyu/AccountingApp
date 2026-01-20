<?php

namespace App\Http\Controllers;

use App\Events\FiscalPeriodClosed;
use App\Events\FiscalPeriodOpened;
use App\Models\FiscalPeriod;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PeriodeController extends Controller
{
    public function index()
    {
        $periodsCollection = FiscalPeriod::with('closedByUser')->get();

        $getTypeWeight = function ($type) {
            switch ($type) {
                case 'monthly': return 1;
                case 'quarterly': return 2;
                case 'annually': return 3;
                default: return 4;
            }
        };

        $sortedPeriods = $periodsCollection->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period->end_date)->format('Ymd');
            $typeWeight = $getTypeWeight($period->period_type);

            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();

        $periods = $periodsCollection->map(function ($period) use ($periodsCollection, $getTypeWeight) {
            $canBeClosedParent = true;

            if ($period->period_type === 'quarterly' || $period->period_type === 'annually') {
                $childPeriods = $periodsCollection->filter(function ($child) use ($period) {
                    return $child->period_type === 'monthly' &&
                           Carbon::parse($child->start_date)->between(Carbon::parse($period->start_date), Carbon::parse($period->end_date)) &&
                           Carbon::parse($child->end_date)->between(Carbon::parse($period->start_date), Carbon::parse($period->end_date));
                });

                $canBeClosedParent = $childPeriods->every(fn ($child) => $child->status === 'Closed');
            }

            return [
                'id' => $period->id,
                'period_name' => $period->period_name,
                'start_date' => Carbon::parse($period->start_date)->format('d M Y'),
                'end_date' => Carbon::parse($period->end_date)->format('d M Y'),
                'status' => $period->status,
                'period_type' => $period->period_type,
                'closed_at' => $period->closed_at ? Carbon::parse($period->closed_at)->format('d M Y, H:i') : '-',
                'closed_by' => $period->closedByUser?->name,
                'can_reopen' => $period->status === 'Closed',
                'can_be_closed' => $period->status === 'Open' &&
                                   !JournalEntry::where('fiscal_period_id', $period->id)
                                                 ->where('status', 'Draft')
                                                 ->exists() &&
                                   $canBeClosedParent,
                'can_be_closed_parent' => $canBeClosedParent,
            ];
        })->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period['end_date'])->format('Ymd');
            $typeWeight = $getTypeWeight($period['period_type']);
            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();

        return Inertia::render('periode/periode', [
            'periods' => $periods,
            'can_create_new' => true,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'period_type' => 'required|in:monthly,quarterly,annually',
        ]);

        $periodType = $request->input('period_type');
        $latestPeriod = FiscalPeriod::orderBy('start_date', 'desc')->first();
        $newStartDate = $latestPeriod ? Carbon::parse($latestPeriod->end_date)->addDay() : Carbon::now()->startOfMonth();

        Carbon::setLocale('id');
        $endDate = $newStartDate->copy();
        $periodName = '';

        switch ($periodType) {
            case 'quarterly':
                $endDate->addMonths(2)->endOfMonth(); // Add 2 months to get a 3-month period, then end of month
                $quarter = $newStartDate->quarter;
                $periodName = "Triwulan {$quarter} ".$newStartDate->year;
                break;
            case 'annually':
                $endDate->endOfYear();
                $periodName = 'Tahunan '.$newStartDate->year;
                break;
            case 'monthly':
            default:
                $endDate->endOfMonth();
                $periodName = $newStartDate->translatedFormat('F Y');
                break;
        }

        // Check if a period with the same start date already exists
        if (FiscalPeriod::where('start_date', $newStartDate->copy()->startOfMonth())->exists()) {
            return Redirect::route('periode.index')->with('error', 'Periode yang dimulai pada tanggal tersebut sudah ada.');
        }

        FiscalPeriod::create([
            'period_name' => $periodName,
            'start_date' => $newStartDate->copy()->startOfMonth(),
            'end_date' => $endDate,
            'fiscal_year' => $newStartDate->year,
            'status' => 'Open',
            'period_type' => $periodType,
        ]);

        return Redirect::route('periode.index')->with('success', 'Periode baru berhasil dibuat.');
    }

    public function close(Request $request, FiscalPeriod $period)
    {
        if ($period->status === 'Closed') {
            return Redirect::back()->with('error', 'Periode sudah ditutup.');
        }

        // Additional validation for quarterly and annually periods
        if ($period->period_type === 'quarterly' || $period->period_type === 'annually') {
            $childPeriods = FiscalPeriod::where('period_type', 'monthly')
                ->whereBetween('start_date', [Carbon::parse($period->start_date), Carbon::parse($period->end_date)])
                ->get();

            $openChildCount = $childPeriods->where('status', 'Open')->count();
            if ($openChildCount > 0) {
                return Redirect::back()->with('error', "Tidak dapat menutup periode {$period->period_name}. Masih ada {$openChildCount} periode bulanan yang terbuka di dalamnya.");
            }
            $draftChildJournals = JournalEntry::whereIn('fiscal_period_id', $childPeriods->pluck('id'))
                ->where('status', 'Draft')
                ->count();

            if ($draftChildJournals > 0) {
                return Redirect::back()->with('error', "Tidak dapat menutup periode {$period->period_name}. Masih ada {$draftChildJournals} jurnal berstatus draft di periode bulanan di dalamnya.");
            }
        }

        // Cek apakah ada jurnal draft di periode ini
        $draftJournals = JournalEntry::where('fiscal_period_id', $period->id)
            ->where('status', 'Draft')
            ->count();

        if ($draftJournals > 0) {
            return Redirect::back()->with('error', "Tidak dapat menutup periode. Masih ada {$draftJournals} jurnal berstatus draft.");
        }

        $period->update([
            'status' => 'Closed',
            'closed_at' => now(),
            'closed_by' => Auth::id(),
        ]);

        FiscalPeriodClosed::dispatch($period);

        return Redirect::route('periode.index')->with('success', 'Periode berhasil ditutup.');
    }

    public function open(Request $request, FiscalPeriod $period)
    {
        if ($period->status === 'Open') {
            return Redirect::back()->with('error', 'Periode sudah terbuka.');
        }

        // Validation for quarterly and annually periods: Cannot open if any child is open
        if ($period->period_type === 'quarterly' || $period->period_type === 'annually') {
            $openChildCount = FiscalPeriod::where('period_type', 'monthly')
                ->whereBetween('start_date', [Carbon::parse($period->start_date), Carbon::parse($period->end_date)])
                ->where('status', 'Open')
                ->count();

            if ($openChildCount > 0) {
                return Redirect::back()->with('error', "Tidak dapat membuka periode {$period->period_name}. Masih ada {$openChildCount} periode bulanan yang terbuka di dalamnya.");
            }
        }

        $period->update([
            'status' => 'Open',
            'closed_at' => null,
            'closed_by' => null,
        ]);

        FiscalPeriodOpened::dispatch($period);

        return Redirect::route('periode.index')->with('success', 'Periode berhasil dibuka kembali.');
    }
}