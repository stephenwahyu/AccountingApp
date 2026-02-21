<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class JurnalController extends Controller
{
    private function getOpenSortedPeriods()
    {
        $periodsCollection = FiscalPeriod::where('status', 'Open')
            ->where('period_type', 'monthly')
            ->get();

        $getTypeWeight = function ($type) {
            switch ($type) {
                case 'monthly': return 1;
                case 'quarterly': return 2;
                case 'annually': return 3;
                default: return 4;
            }
        };

        return $periodsCollection->sortBy(function ($period) use ($getTypeWeight) {
            $endDateKey = Carbon::parse($period->end_date)->format('Ymd');
            $typeWeight = $getTypeWeight($period->period_type);

            return "{$endDateKey}{$typeWeight}";
        })->reverse()->values();
    }

    // Tampilkan semua jurnal
    public function index()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user'])
            ->orderBy('entry_date', 'desc')
            ->orderBy('entry_number', 'desc')
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'entry_number' => $journal->entry_number,
                    'entry_date' => $journal->entry_date->format('d F Y'),
                    'period' => $journal->fiscalPeriod->period_name,
                    'journal_type' => $journal->journal_type,
                    'status' => $journal->status,
                ];
            });

        return Inertia::render('jurnal/semua', [
            'journals' => $journals,
        ]);
    }

    // Tampilkan jurnal umum
    public function umum()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user'])
            ->where('journal_type', 'Umum')
            ->orderBy('entry_date', 'desc')
            ->orderBy('entry_number', 'desc')
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'entry_number' => $journal->entry_number,
                    'entry_date' => $journal->entry_date->format('d F Y'),
                    'period' => $journal->fiscalPeriod->period_name,
                    'journal_type' => $journal->journal_type,
                    'status' => $journal->status,
                ];
            });

        return Inertia::render('jurnal/jurnalumum', [
            'journals' => $journals,
        ]);
    }

    // Form tambah jurnal umum
    public function umumCreate()
    {
        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        return Inertia::render('jurnal/forms/jurnalumum', [
            'accounts' => $accounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Simpan jurnal umum
    public function umumStore(Request $request)
    {
        $validated = $request->validate([
            'entry_date' => 'required|date',
            'entry_number' => 'nullable|string|max:50',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'details' => 'required|array|min:2',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'details.*.credit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        // Validasi balance
        $totalDebit = collect($validated['details'])->sum('debit');
        $totalCredit = collect($validated['details'])->sum('credit');

        if ($totalDebit != $totalCredit) {
            return back()->withErrors(['details' => 'Total Debit dan Kredit harus seimbang']);
        }

        if ($totalDebit == 0 || $totalCredit == 0) {
            return back()->withErrors(['details' => 'Total Debit dan Kredit tidak boleh 0']);
        }

        DB::beginTransaction();
        try {
            // Generate entry number jika kosong
            $entry_number = $request->input('entry_number');
            if (empty($entry_number)) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $entry_number = $this->generateNextEntryNumber('JU', $date);
            }

            $status = $validated['status'];

            // Create journal entry
            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $entry_number,
                'penerima' => $validated['penerima'],
                'journal_type' => 'Umum',
                'status' => $status,
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => Auth::id() ?? 1,
                'posted_at' => $status === 'Posted' ? now() : null,
                'posted_by' => $status === 'Posted' ? Auth::id() ?? 1 : null,
            ]);

            // Create journal details
            foreach ($validated['details'] as $detail) {
                if ($detail['debit'] > 0 || $detail['credit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => $detail['debit'],
                        'credit' => $detail['credit'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('jurnal.umum')->with('success', 'Jurnal Umum berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: '.$e->getMessage()]);
        }
    }

    // Tampilkan jurnal kas
    public function kas()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user'])
            ->whereIn('journal_type', ['Kas Masuk', 'Kas Keluar'])
            ->orderBy('entry_date', 'desc')
            ->orderBy('entry_number', 'desc')
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'entry_number' => $journal->entry_number,
                    'entry_date' => $journal->entry_date->format('d F Y'),
                    'period' => $journal->fiscalPeriod->period_name,
                    'journal_type' => $journal->journal_type === 'Kas Masuk' ? 'Pemasukan Kas' : 'Pengeluaran Kas',
                    'status' => $journal->status,
                ];
            });

        return Inertia::render('jurnal/jurnalkas', [
            'journals' => $journals,
        ]);
    }

    // Form pemasukan kas
    public function kasPemasukanCreate()
    {
        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $cashAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Kas%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        return Inertia::render('jurnal/forms/jurnalkas/pemasukan', [
            'accounts' => $accounts,
            'cashAccounts' => $cashAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Simpan pemasukan kas
    public function kasPemasukanStore(Request $request)
    {
        $validated = $request->validate([
            'entry_date' => 'required|date',
            'entry_number' => 'nullable|string|max:50',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'cash_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.credit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $entry_number = $request->input('entry_number');
            if (empty($entry_number)) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $entry_number = $this->generateNextEntryNumber('KM', $date);
            }

            $status = $validated['status'];

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $entry_number,
                'penerima' => $validated['penerima'],
                'journal_type' => 'Kas Masuk',
                'status' => $status,
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => Auth::id() ?? 1,
                'posted_at' => $status === 'Posted' ? now() : null,
                'posted_by' => $status === 'Posted' ? Auth::id() ?? 1 : null,
            ]);

            $totalCredit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['credit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => 0,
                        'credit' => $detail['credit'],
                    ]);
                    $totalCredit += $detail['credit'];
                }
            }

            // Tambah debit untuk akun kas
            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['cash_account_id'],
                'description' => 'Penerimaan Kas',
                'debit' => $totalCredit,
                'credit' => 0,
            ]);

            DB::commit();

            return redirect()->route('jurnal.kas')->with('success', 'Pemasukan Kas berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: '.$e->getMessage()]);
        }
    }

    // Form pengeluaran kas
    public function kasPengeluaranCreate()
    {
        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $cashAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Kas%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        return Inertia::render('jurnal/forms/jurnalkas/pengeluaran', [
            'accounts' => $accounts,
            'cashAccounts' => $cashAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Simpan pengeluaran kas
    public function kasPengeluaranStore(Request $request)
    {
        $validated = $request->validate([
            'entry_date' => 'required|date',
            'entry_number' => 'nullable|string|max:50',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'cash_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $entry_number = $request->input('entry_number');
            if (empty($entry_number)) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $entry_number = $this->generateNextEntryNumber('KK', $date);
            }

            $status = $validated['status'];

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $entry_number,
                'penerima' => $validated['penerima'],
                'journal_type' => 'Kas Keluar',
                'status' => $status,
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => Auth::id() ?? 1,
                'posted_at' => $status === 'Posted' ? now() : null,
                'posted_by' => $status === 'Posted' ? Auth::id() ?? 1 : null,
            ]);

            $totalDebit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['debit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => $detail['debit'],
                        'credit' => 0,
                    ]);
                    $totalDebit += $detail['debit'];
                }
            }

            // Tambah kredit untuk akun kas
            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['cash_account_id'],
                'description' => 'Pengeluaran Kas',
                'debit' => 0,
                'credit' => $totalDebit,
            ]);

            DB::commit();

            return redirect()->route('jurnal.kas')->with('success', 'Pengeluaran Kas berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: '.$e->getMessage()]);
        }
    }

    // Tampilkan jurnal bank
    public function bank()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user'])
            ->whereIn('journal_type', ['Bank Masuk', 'Bank Keluar'])
            ->orderBy('entry_date', 'desc')
            ->orderBy('entry_number', 'desc')
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'entry_number' => $journal->entry_number,
                    'entry_date' => $journal->entry_date->format('d F Y'),
                    'period' => $journal->fiscalPeriod->period_name,
                    'journal_type' => $journal->journal_type === 'Bank Masuk' ? 'Pemasukan Bank' : 'Pengeluaran Bank',
                    'status' => $journal->status,
                ];
            });

        return Inertia::render('jurnal/jurnalbank', [
            'journals' => $journals,
        ]);
    }

    // Form pemasukan bank
    public function bankPemasukanCreate()
    {
        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $bankAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Bank%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        return Inertia::render('jurnal/forms/jurnalbank/pemasukan', [
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Simpan pemasukan bank
    public function bankPemasukanStore(Request $request)
    {
        $validated = $request->validate([
            'entry_date' => 'required|date',
            'entry_number' => 'nullable|string|max:50',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'bank_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.credit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $entry_number = $request->input('entry_number');
            if (empty($entry_number)) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $entry_number = $this->generateNextEntryNumber('BM', $date);
            }

            $status = $validated['status'];

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $entry_number,
                'penerima' => $validated['penerima'],
                'journal_type' => 'Bank Masuk',
                'status' => $status,
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => Auth::id() ?? 1,
                'posted_at' => $status === 'Posted' ? now() : null,
                'posted_by' => $status === 'Posted' ? Auth::id() ?? 1 : null,
            ]);

            $totalCredit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['credit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => 0,
                        'credit' => $detail['credit'],
                    ]);
                    $totalCredit += $detail['credit'];
                }
            }

            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['bank_account_id'],
                'description' => 'Penerimaan Bank',
                'debit' => $totalCredit,
                'credit' => 0,
            ]);

            DB::commit();

            return redirect()->route('jurnal.bank')->with('success', 'Pemasukan Bank berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: '.$e->getMessage()]);
        }
    }

    // Form pengeluaran bank
    public function bankPengeluaranCreate()
    {
        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $bankAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Bank%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        return Inertia::render('jurnal/forms/jurnalbank/pengeluaran', [
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Simpan pengeluaran bank
    public function bankPengeluaranStore(Request $request)
    {
        $validated = $request->validate([
            'entry_date' => 'required|date',
            'entry_number' => 'nullable|string|max:50',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'bank_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $entry_number = $request->input('entry_number');
            if (empty($entry_number)) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $entry_number = $this->generateNextEntryNumber('BK', $date);
            }

            $status = $validated['status'];

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $entry_number,
                'penerima' => $validated['penerima'],
                'journal_type' => 'Bank Keluar',
                'status' => $status,
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => Auth::id() ?? 1,
                'posted_at' => $status === 'Posted' ? now() : null,
                'posted_by' => $status === 'Posted' ? Auth::id() ?? 1 : null,
            ]);

            $totalDebit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['debit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => $detail['debit'],
                        'credit' => 0,
                    ]);
                    $totalDebit += $detail['debit'];
                }
            }

            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['bank_account_id'],
                'description' => 'Pengeluaran Bank',
                'debit' => 0,
                'credit' => $totalDebit,
            ]);

            DB::commit();

            return redirect()->route('jurnal.bank')->with('success', 'Pengeluaran Bank berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: '.$e->getMessage()]);
        }
    }

    // Lihat detail jurnal
    public function show(JournalEntry $journal)
    {
        try {
            $journal->load([
                'fiscalPeriod',
                'user',
                'postedByUser',
                'journalDetails' => function ($query) {
                    $query->orderBy('id', 'asc');
                },
                'journalDetails.account',
            ]);

            $journalData = [
                'id' => $journal->id,
                'entry_number' => $journal->entry_number,
                'entry_date' => $journal->entry_date->format('Y-m-d'),
                'penerima' => $journal->penerima,
                'journal_type' => $journal->journal_type,
                'status' => $journal->status,
                'posted_at' => $journal->posted_at ? $journal->posted_at->format('Y-m-d H:i:s') : null,
                'created_at' => $journal->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $journal->updated_at->format('Y-m-d H:i:s'),
                'fiscal_period' => $journal->fiscalPeriod ? [
                    'id' => $journal->fiscalPeriod->id,
                    'period_name' => $journal->fiscalPeriod->period_name,
                    'start_date' => $journal->fiscalPeriod->start_date,
                    'end_date' => $journal->fiscalPeriod->end_date,
                ] : null,
                'user' => $journal->user ? [
                    'id' => $journal->user->id,
                    'name' => $journal->user->name,
                    'email' => $journal->user->email,
                ] : null,
                'posted_by_user' => $journal->postedByUser ? [
                    'id' => $journal->postedByUser->id,
                    'name' => $journal->postedByUser->name,
                    'email' => $journal->postedByUser->email,
                ] : null,
                'journal_details' => $journal->journalDetails->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'account_id' => $detail->account_id,
                        'description' => $detail->description,
                        'debit' => (float) $detail->debit,
                        'credit' => (float) $detail->credit,
                        'account' => [
                            'id' => $detail->account->id,
                            'account_code' => $detail->account->account_code,
                            'account_name' => $detail->account->account_name,
                        ],
                    ];
                })->toArray(),
            ];

            return Inertia::render('jurnal/view/jurnaldetail', [
                'journal' => $journalData,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('jurnal.index')
                ->with('error', 'Jurnal tidak ditemukan.');
        }
    }

    // Edit Jurnal Umum
    public function umumEdit(JournalEntry $journal)
    {
        // if ($journal->status === 'Posted') {
        //     return redirect()->route('jurnal.umum')->with('error', 'Jurnal yang sudah di-posting tidak dapat diubah.');
        // }

        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $journal->load('journalDetails.account');

        $journalData = [
            'id' => $journal->id,
            'entry_date' => $journal->entry_date->format('Y-m-d'),
            'entry_number' => $journal->entry_number,
            'fiscal_period_id' => $journal->fiscal_period_id,
            'penerima' => $journal->penerima,
            'status' => $journal->status,
            'details' => $journal->journalDetails->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'account_id' => $detail->account_id,
                    'description' => $detail->description,
                    'debit' => (float) $detail->debit,
                    'credit' => (float) $detail->credit,
                ];
            })->toArray(),
        ];

        return Inertia::render('jurnal/forms/jurnalumum', [
            'journal' => $journalData,
            'accounts' => $accounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Update Jurnal Umum
    public function umumUpdate(Request $request, JournalEntry $journal)
    {
        $journal->load('fiscalPeriod');
        if ($journal->fiscalPeriod && $journal->fiscalPeriod->status === 'Closed') {
            return back()->withErrors(['error' => 'Jurnal tidak dapat diubah karena periode fiskal terkait sudah ditutup.']);
        }

        $validated = $request->validate([
            'entry_date' => 'required|date',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'details' => 'required|array|min:2',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'details.*.credit' => 'required|numeric|min:0',
            'status' => 'required|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        $totalDebit = collect($validated['details'])->sum('debit');
        $totalCredit = collect($validated['details'])->sum('credit');

        if ($totalDebit != $totalCredit) {
            return back()->withErrors(['details' => 'Total Debit dan Kredit harus seimbang']);
        }

        if ($totalDebit == 0 || $totalCredit == 0) {
            return back()->withErrors(['details' => 'Total Debit dan Kredit tidak boleh 0']);
        }

        DB::beginTransaction();
        try {
            // Check if status is changing from Draft to Posted
            $isPosting = $journal->status !== 'Posted' && $validated['status'] === 'Posted';

            $journal->update([
                'entry_date' => $validated['entry_date'],
                'penerima' => $validated['penerima'],
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'status' => $validated['status'],
                'posted_at' => $isPosting ? now() : $journal->posted_at,
                'posted_by' => $isPosting ? (Auth::id() ?? 1) : $journal->posted_by,
            ]);

            // Delete old details and create new ones
            $journal->journalDetails()->delete();

            foreach ($validated['details'] as $detail) {
                if ($detail['debit'] > 0 || $detail['credit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => $detail['debit'],
                        'credit' => $detail['credit'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('jurnal.umum')->with('success', 'Jurnal Umum berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal memperbarui jurnal: '.$e->getMessage()]);
        }
    }

    // Edit Pemasukan Kas
    public function kasPemasukanEdit(JournalEntry $journal)
    {
        // if ($journal->status === 'Posted') {
        //     return redirect()->route('jurnal.kas')->with('error', 'Jurnal yang sudah di-posting tidak dapat diubah.');
        // }

        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $cashAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Kas%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $journal->load('journalDetails.account');

        // Cari akun kas (yang debit)
        $cashDetail = $journal->journalDetails->firstWhere('debit', '>', 0);
        $cashAccountId = $cashDetail ? $cashDetail->account_id : null;

        // Ambil detail kredit (bukan kas)
        $creditDetails = $journal->journalDetails->where('credit', '>', 0);

        return Inertia::render('jurnal/forms/jurnalkas/pemasukan', [
            'journal' => $this->getJournalDataForEdit($journal, $cashAccountId, $creditDetails, 'credit'),
            'accounts' => $accounts,
            'cashAccounts' => $cashAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Update Pemasukan Kas
    public function kasPemasukanUpdate(Request $request, JournalEntry $journal)
    {
        $journal->load('fiscalPeriod');
        if ($journal->fiscalPeriod && $journal->fiscalPeriod->status === 'Closed') {
            return back()->withErrors(['error' => 'Jurnal tidak dapat diubah karena periode fiskal terkait sudah ditutup.']);
        }

        $validated = $request->validate([
            'entry_date' => 'required|date',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'cash_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.credit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $journal->update([
                'entry_date' => $validated['entry_date'],
                'penerima' => $validated['penerima'],
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'status' => $validated['status'],
                'posted_at' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? now() : $journal->posted_at,
                'posted_by' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? Auth::id() ?? 1 : $journal->posted_by,
            ]);

            $journal->journalDetails()->delete();

            $totalCredit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['credit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => 0,
                        'credit' => $detail['credit'],
                    ]);
                    $totalCredit += $detail['credit'];
                }
            }

            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['cash_account_id'],
                'description' => 'Penerimaan Kas',
                'debit' => $totalCredit,
                'credit' => 0,
            ]);

            DB::commit();

            return redirect()->route('jurnal.kas')->with('success', 'Pemasukan Kas berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal memperbarui jurnal: '.$e->getMessage()]);
        }
    }

    // Edit Pengeluaran Kas
    public function kasPengeluaranEdit(JournalEntry $journal)
    {
        // if ($journal->status === 'Posted') {
        //     return redirect()->route('jurnal.kas')->with('error', 'Jurnal yang sudah di-posting tidak dapat diubah.');
        // }

        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $cashAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Kas%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $journal->load('journalDetails.account');

        // Cari akun kas (yang kredit)
        $cashDetail = $journal->journalDetails->firstWhere('credit', '>', 0);
        $cashAccountId = $cashDetail ? $cashDetail->account_id : null;

        // Ambil detail debit (bukan kas)
        $debitDetails = $journal->journalDetails->where('debit', '>', 0);

        return Inertia::render('jurnal/forms/jurnalkas/pengeluaran', [
            'journal' => $this->getJournalDataForEdit($journal, $cashAccountId, $debitDetails, 'debit'),
            'accounts' => $accounts,
            'cashAccounts' => $cashAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Update Pengeluaran Kas
    public function kasPengeluaranUpdate(Request $request, JournalEntry $journal)
    {
        $journal->load('fiscalPeriod');
        if ($journal->fiscalPeriod && $journal->fiscalPeriod->status === 'Closed') {
            return back()->withErrors(['error' => 'Jurnal tidak dapat diubah karena periode fiskal terkait sudah ditutup.']);
        }

        $validated = $request->validate([
            'entry_date' => 'required|date',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'cash_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $journal->update([
                'entry_date' => $validated['entry_date'],
                'penerima' => $validated['penerima'],
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'status' => $validated['status'],
                'posted_at' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? now() : $journal->posted_at,
                'posted_by' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? Auth::id() ?? 1 : $journal->posted_by,
            ]);

            $journal->journalDetails()->delete();

            $totalDebit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['debit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => $detail['debit'],
                        'credit' => 0,
                    ]);
                    $totalDebit += $detail['debit'];
                }
            }

            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['cash_account_id'],
                'description' => 'Pengeluaran Kas',
                'debit' => 0,
                'credit' => $totalDebit,
            ]);

            DB::commit();

            return redirect()->route('jurnal.kas')->with('success', 'Pengeluaran Kas berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal memperbarui jurnal: '.$e->getMessage()]);
        }
    }

    // Edit Pemasukan Bank
    public function bankPemasukanEdit(JournalEntry $journal)
    {
        // if ($journal->status === 'Posted') {
        //     return redirect()->route('jurnal.bank')->with('error', 'Jurnal yang sudah di-posting tidak dapat diubah.');
        // }

        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $bankAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Bank%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $journal->load('journalDetails.account');

        // Cari akun bank (yang debit)
        $bankDetail = $journal->journalDetails->firstWhere('debit', '>', 0);
        $bankAccountId = $bankDetail ? $bankDetail->account_id : null;

        // Ambil detail kredit (bukan bank)
        $creditDetails = $journal->journalDetails->where('credit', '>', 0);

        return Inertia::render('jurnal/forms/jurnalbank/pemasukan', [
            'journal' => $this->getJournalDataForEdit($journal, $bankAccountId, $creditDetails, 'credit'),
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Update Pemasukan Bank
    public function bankPemasukanUpdate(Request $request, JournalEntry $journal)
    {
        $journal->load('fiscalPeriod');
        if ($journal->fiscalPeriod && $journal->fiscalPeriod->status === 'Closed') {
            return back()->withErrors(['error' => 'Jurnal tidak dapat diubah karena periode fiskal terkait sudah ditutup.']);
        }

        $validated = $request->validate([
            'entry_date' => 'required|date',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'bank_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.credit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $journal->update([
                'entry_date' => $validated['entry_date'],
                'penerima' => $validated['penerima'],
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'status' => $validated['status'],
                'posted_at' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? now() : $journal->posted_at,
                'posted_by' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? Auth::id() ?? 1 : $journal->posted_by,
            ]);

            $journal->journalDetails()->delete();

            $totalCredit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['credit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => 0,
                        'credit' => $detail['credit'],
                    ]);
                    $totalCredit += $detail['credit'];
                }
            }

            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['bank_account_id'],
                'description' => 'Penerimaan Bank',
                'debit' => $totalCredit,
                'credit' => 0,
            ]);

            DB::commit();

            return redirect()->route('jurnal.bank')->with('success', 'Pemasukan Bank berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: '.$e->getMessage()]);
        }
    }

    // Edit Pengeluaran Bank
    public function bankPengeluaranEdit(JournalEntry $journal)
    {
        // if ($journal->status === 'Posted') {
        //     return redirect()->route('jurnal.bank')->with('error', 'Jurnal yang sudah di-posting tidak dapat diubah.');
        // }

        $accounts = Account::withCount('children')
            ->where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'parent_id', 'is_cash_account', 'children_count']);

        $bankAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Bank%')
            ->whereDoesntHave('children')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $journal->load('journalDetails.account');

        // Cari akun bank (yang kredit)
        $bankDetail = $journal->journalDetails->firstWhere('credit', '>', 0);
        $bankAccountId = $bankDetail ? $bankDetail->account_id : null;

        // Ambil detail debit (bukan bank)
        $debitDetails = $journal->journalDetails->where('debit', '>', 0);

        return Inertia::render('jurnal/forms/jurnalbank/pengeluaran', [
            'journal' => $this->getJournalDataForEdit($journal, $bankAccountId, $debitDetails, 'debit'),
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'periods' => $this->getOpenSortedPeriods(),
        ]);
    }

    // Update Pengeluaran Bank
    public function bankPengeluaranUpdate(Request $request, JournalEntry $journal)
    {
        $journal->load('fiscalPeriod');
        if ($journal->fiscalPeriod && $journal->fiscalPeriod->status === 'Closed') {
            return back()->withErrors(['error' => 'Jurnal tidak dapat diubah karena periode fiskal terkait sudah ditutup.']);
        }

        $validated = $request->validate([
            'entry_date' => 'required|date',
            'fiscal_period_id' => 'required|exists:fiscal_periods,id',
            'penerima' => 'nullable|string',
            'bank_account_id' => 'required|exists:accounts,id',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'status' => 'required|string|in:Draft,Posted',
        ]);

        $this->validateEntryDate($validated['entry_date'], $validated['fiscal_period_id']);

        DB::beginTransaction();
        try {
            $journal->update([
                'entry_date' => $validated['entry_date'],
                'penerima' => $validated['penerima'],
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'status' => $validated['status'],
                'posted_at' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? now() : $journal->posted_at,
                'posted_by' => $validated['status'] === 'Posted' && $journal->status !== 'Posted' ? Auth::id() ?? 1 : $journal->posted_by,
            ]);

            $journal->journalDetails()->delete();

            $totalDebit = 0;
            foreach ($validated['details'] as $detail) {
                if ($detail['debit'] > 0) {
                    JournalDetail::create([
                        'journal_entry_id' => $journal->id,
                        'account_id' => $detail['account_id'],
                        'description' => $detail['description'],
                        'debit' => $detail['debit'],
                        'credit' => 0,
                    ]);
                    $totalDebit += $detail['debit'];
                }
            }

            JournalDetail::create([
                'journal_entry_id' => $journal->id,
                'account_id' => $validated['bank_account_id'],
                'description' => 'Pengeluaran Bank',
                'debit' => 0,
                'credit' => $totalDebit,
            ]);

            DB::commit();

            return redirect()->route('jurnal.bank')->with('success', 'Pengeluaran Bank berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal memperbarui jurnal: '.$e->getMessage()]);
        }
    }

    // Hapus jurnal
    public function destroy(JournalEntry $journal)
    {
        $journal->load('fiscalPeriod');

        if ($journal->fiscalPeriod && $journal->fiscalPeriod->status === 'Closed') {
            return back()->withErrors(['error' => 'Jurnal tidak dapat dihapus karena periode fiskal terkait sudah ditutup.']);
        }

        // if ($journal->status === 'Posted') {
        //     return back()->withErrors(['error' => 'Jurnal yang sudah di-posting tidak dapat dihapus.']);
        // }

        DB::beginTransaction();
        try {
            $journal->journalDetails()->delete();
            $journal->delete();
            DB::commit();

            return redirect()->back()->with('success', 'Jurnal draft berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menghapus jurnal: '.$e->getMessage()]);
        }
    }

    // Post a draft journal
    public function postJournal(JournalEntry $journal)
    {
        if ($journal->status === 'Posted') {
            return back()->withErrors(['error' => 'Jurnal sudah di-posting.']);
        }

        $journal->update([
            'status' => 'Posted',
            'posted_at' => now(),
            'posted_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Jurnal berhasil di-posting.');
    }

    private function generateNextEntryNumber($prefix, $date)
    {
        $prefixedDate = $prefix ? $prefix.'-'.$date : $date;
        $lastEntry = JournalEntry::where('entry_number', 'like', $prefixedDate.'%')
            ->orderBy('entry_number', 'desc')
            ->first();

        $nextNumber = 1;
        if ($lastEntry) {
            $parts = explode('-', $lastEntry->entry_number);
            $lastNumber = intval(end($parts));
            $nextNumber = $lastNumber + 1;
        }

        return $prefixedDate.'-'.$nextNumber;
    }

    private function validateEntryDate(string $entryDate, int $fiscalPeriodId)
    {
        $period = FiscalPeriod::find($fiscalPeriodId);
        $entryDate = Carbon::parse($entryDate);

        // The 'period' should always exist due to 'exists' validation rule, but a check is safer.
        if ($period) {
            $startDate = Carbon::parse($period->start_date);
            $endDate = Carbon::parse($period->end_date);

            if (! ($entryDate->gte($startDate) && $entryDate->lte($endDate))) {
                $formattedStartDate = $startDate->format('d-m-Y');
                $formattedEndDate = $endDate->format('d-m-Y');
                throw ValidationException::withMessages([
                    'entry_date' => "Tanggal jurnal harus berada dalam rentang periode fiskal yang dipilih ({$formattedStartDate} - {$formattedEndDate}).",
                ]);
            }
        }
    }

    private function getJournalDataForEdit(JournalEntry $journal, $mainAccountId, $details, $amountField)
    {
        return [
            'id' => $journal->id,
            'entry_date' => $journal->entry_date->format('Y-m-d'),
            'entry_number' => $journal->entry_number,
            'fiscal_period_id' => $journal->fiscal_period_id,
            'penerima' => $journal->penerima,
            'status' => $journal->status,
            'cash_account_id' => $mainAccountId, // Disesuaikan untuk kas/bank
            'bank_account_id' => $mainAccountId, // Disesuaikan untuk kas/bank
            'details' => $details->map(function ($detail) use ($amountField) {
                return [
                    'id' => $detail->id,
                    'account_id' => $detail->account_id,
                    'description' => $detail->description,
                    $amountField => (float) $detail->{$amountField},
                ];
            })->values()->toArray(),
        ];
    }
}
