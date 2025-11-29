<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalEntry;
use App\Models\JournalDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JurnalController extends Controller
{
    // Tampilkan semua jurnal
    public function index()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user', 'journalDetails.account'])
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
            'journals' => $journals
        ]);
    }

    // Tampilkan jurnal umum
    public function umum()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user', 'journalDetails.account'])
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
            'journals' => $journals
        ]);
    }

    // Form tambah jurnal umum
    public function umumCreate()
    {
        $accounts = Account::where('is_active', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $periods = FiscalPeriod::where('status', 'Open')
            ->orderBy('start_date', 'desc')
            ->get(['id', 'period_name']);

        return Inertia::render('jurnal/forms/jurnalumum', [
            'accounts' => $accounts,
            'periods' => $periods
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
        ]);

        // Validasi balance
        $totalDebit = collect($validated['details'])->sum('debit');
        $totalCredit = collect($validated['details'])->sum('credit');

        if ($totalDebit != $totalCredit) {
            return back()->withErrors(['details' => 'Total Debit dan Kredit harus seimbang']);
        }

        DB::beginTransaction();
        try {
            // Generate entry number jika kosong
            if (empty($validated['entry_number'])) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $lastEntry = JournalEntry::where('entry_number', 'like', $date . '%')
                    ->orderBy('entry_number', 'desc')
                    ->first();
                
                $nextNumber = $lastEntry ? intval(substr($lastEntry->entry_number, -1)) + 1 : 1;
                $validated['entry_number'] = $date . '-' . $nextNumber;
            }

            // Create journal entry
            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $validated['entry_number'],
                'penerima' => $validated['penerima'],
                'journal_type' => 'Umum',
                'status' => 'Posted',
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => 1, // Default user
                'posted_at' => now(),
                'posted_by' => 1,
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
            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: ' . $e->getMessage()]);
        }
    }

    // Tampilkan jurnal kas
    public function kas()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user', 'journalDetails.account'])
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
            'journals' => $journals
        ]);
    }

    // Form pemasukan kas
    public function kasPemasukanCreate()
    {
        $accounts = Account::where('is_active', true)
            ->where('is_cash_account', false)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $cashAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Kas%')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $periods = FiscalPeriod::where('status', 'Open')
            ->orderBy('start_date', 'desc')
            ->get(['id', 'period_name']);

        return Inertia::render('jurnal/forms/jurnalkas/pemasukan', [
            'accounts' => $accounts,
            'cashAccounts' => $cashAccounts,
            'periods' => $periods
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
        ]);

        DB::beginTransaction();
        try {
            if (empty($validated['entry_number'])) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $lastEntry = JournalEntry::where('entry_number', 'like', 'KM-' . $date . '%')
                    ->orderBy('entry_number', 'desc')
                    ->first();
                
                $nextNumber = $lastEntry ? intval(substr($lastEntry->entry_number, -1)) + 1 : 1;
                $validated['entry_number'] = 'KM-' . $date . '-' . $nextNumber;
            }

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $validated['entry_number'],
                'penerima' => $validated['penerima'],
                'journal_type' => 'Kas Masuk',
                'status' => 'Posted',
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => 1,
                'posted_at' => now(),
                'posted_by' => 1,
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
            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: ' . $e->getMessage()]);
        }
    }

    // Form pengeluaran kas
    public function kasPengeluaranCreate()
    {
        $accounts = Account::where('is_active', true)
            ->where('is_cash_account', false)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $cashAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Kas%')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $periods = FiscalPeriod::where('status', 'Open')
            ->orderBy('start_date', 'desc')
            ->get(['id', 'period_name']);

        return Inertia::render('jurnal/forms/jurnalkas/pengeluaran', [
            'accounts' => $accounts,
            'cashAccounts' => $cashAccounts,
            'periods' => $periods
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
        ]);

        DB::beginTransaction();
        try {
            if (empty($validated['entry_number'])) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $lastEntry = JournalEntry::where('entry_number', 'like', 'KK-' . $date . '%')
                    ->orderBy('entry_number', 'desc')
                    ->first();
                
                $nextNumber = $lastEntry ? intval(substr($lastEntry->entry_number, -1)) + 1 : 1;
                $validated['entry_number'] = 'KK-' . $date . '-' . $nextNumber;
            }

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $validated['entry_number'],
                'penerima' => $validated['penerima'],
                'journal_type' => 'Kas Keluar',
                'status' => 'Posted',
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => 1,
                'posted_at' => now(),
                'posted_by' => 1,
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

            return redirect()->route('jurnal.kas')->with('success', 'Pengeluaran Kas berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: ' . $e->getMessage()]);
        }
    }

    // Tampilkan jurnal bank
    public function bank()
    {
        $journals = JournalEntry::with(['fiscalPeriod', 'user', 'journalDetails.account'])
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
            'journals' => $journals
        ]);
    }

    // Form pemasukan bank
    public function bankPemasukanCreate()
    {
        $accounts = Account::where('is_active', true)
            ->where('is_cash_account', false)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $bankAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Bank%')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $periods = FiscalPeriod::where('status', 'Open')
            ->orderBy('start_date', 'desc')
            ->get(['id', 'period_name']);

        return Inertia::render('jurnal/forms/jurnalbank/pemasukan', [
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'periods' => $periods
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
        ]);

        DB::beginTransaction();
        try {
            if (empty($validated['entry_number'])) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $lastEntry = JournalEntry::where('entry_number', 'like', 'BM-' . $date . '%')
                    ->orderBy('entry_number', 'desc')
                    ->first();
                
                $nextNumber = $lastEntry ? intval(substr($lastEntry->entry_number, -1)) + 1 : 1;
                $validated['entry_number'] = 'BM-' . $date . '-' . $nextNumber;
            }

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $validated['entry_number'],
                'penerima' => $validated['penerima'],
                'journal_type' => 'Bank Masuk',
                'status' => 'Posted',
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => 1,
                'posted_at' => now(),
                'posted_by' => 1,
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
            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: ' . $e->getMessage()]);
        }
    }

    // Form pengeluaran bank
    public function bankPengeluaranCreate()
    {
        $accounts = Account::where('is_active', true)
            ->where('is_cash_account', false)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $bankAccounts = Account::where('is_active', true)
            ->where('is_cash_account', true)
            ->where('account_name', 'like', '%Bank%')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name']);

        $periods = FiscalPeriod::where('status', 'Open')
            ->orderBy('start_date', 'desc')
            ->get(['id', 'period_name']);

        return Inertia::render('jurnal/forms/jurnalbank/pengeluaran', [
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'periods' => $periods
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
        ]);

        DB::beginTransaction();
        try {
            if (empty($validated['entry_number'])) {
                $date = date('dmy', strtotime($validated['entry_date']));
                $lastEntry = JournalEntry::where('entry_number', 'like', 'BK-' . $date . '%')
                    ->orderBy('entry_number', 'desc')
                    ->first();
                
                $nextNumber = $lastEntry ? intval(substr($lastEntry->entry_number, -1)) + 1 : 1;
                $validated['entry_number'] = 'BK-' . $date . '-' . $nextNumber;
            }

            $journal = JournalEntry::create([
                'entry_date' => $validated['entry_date'],
                'entry_number' => $validated['entry_number'],
                'penerima' => $validated['penerima'],
                'journal_type' => 'Bank Keluar',
                'status' => 'Posted',
                'fiscal_period_id' => $validated['fiscal_period_id'],
                'user_id' => 1,
                'posted_at' => now(),
                'posted_by' => 1,
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

            return redirect()->route('jurnal.bank')->with('success', 'Pengeluaran Bank berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan jurnal: ' . $e->getMessage()]);
        }
    }

        public function show(JournalEntry $journal)

        {

            $journal->load([

                'fiscalPeriod',

                'user',

                'postedByUser',

                'journalDetails.account'

            ]);

    

            return Inertia::render('jurnal/view/jurnaldetail', [

                'journal' => $journal

            ]);

        }

    

        // Edit Jurnal Umum

        public function umumEdit(JournalEntry $journal)

        {

            $accounts = Account::where('is_active', true)

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $periods = FiscalPeriod::where('status', 'Open')

                ->orderBy('start_date', 'desc')

                ->get(['id', 'period_name']);

    

            return Inertia::render('jurnal/forms/jurnalumum', [

                'journal' => $journal->load('journalDetails'),

                'accounts' => $accounts,

                'periods' => $periods

            ]);

        }

    

        // Update Jurnal Umum

        public function umumUpdate(Request $request, JournalEntry $journal)

        {

            $validated = $request->validate([

                'entry_date' => 'required|date',

                'fiscal_period_id' => 'required|exists:fiscal_periods,id',

                'penerima' => 'nullable|string',

                'details' => 'required|array|min:2',

                'details.*.account_id' => 'required|exists:accounts,id',

                'details.*.description' => 'nullable|string',

                'details.*.debit' => 'required|numeric|min:0',

                'details.*.credit' => 'required|numeric|min:0',

            ]);

    

            $totalDebit = collect($validated['details'])->sum('debit');

            $totalCredit = collect($validated['details'])->sum('credit');

    

            if ($totalDebit != $totalCredit) {

                return back()->withErrors(['details' => 'Total Debit dan Kredit harus seimbang']);

            }

    

            DB::beginTransaction();

            try {

                $journal->update([

                    'entry_date' => $validated['entry_date'],

                    'penerima' => $validated['penerima'],

                    'fiscal_period_id' => $validated['fiscal_period_id'],

                ]);

    

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

                return back()->withErrors(['error' => 'Gagal memperbarui jurnal: ' . $e->getMessage()]);

            }

        }

    

        // Edit Pemasukan Kas

        public function kasPemasukanEdit(JournalEntry $journal)

        {

            $accounts = Account::where('is_active', true)

                ->where('is_cash_account', false)

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $cashAccounts = Account::where('is_active', true)

                ->where('is_cash_account', true)

                ->where('account_name', 'like', '%Kas%')

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $periods = FiscalPeriod::where('status', 'Open')

                ->orderBy('start_date', 'desc')

                ->get(['id', 'period_name']);

    

            return Inertia::render('jurnal/forms/jurnalkas/pemasukan', [

                'journal' => $journal->load('journalDetails'),

                'accounts' => $accounts,

                'cashAccounts' => $cashAccounts,

                'periods' => $periods

            ]);

        }

    

        // Update Pemasukan Kas

        public function kasPemasukanUpdate(Request $request, JournalEntry $journal)

        {

            $validated = $request->validate([

                'entry_date' => 'required|date',

                'fiscal_period_id' => 'required|exists:fiscal_periods,id',

                'penerima' => 'nullable|string',

                'cash_account_id' => 'required|exists:accounts,id',

                'details' => 'required|array|min:1',

                'details.*.account_id' => 'required|exists:accounts,id',

                'details.*.description' => 'nullable|string',

                'details.*.credit' => 'required|numeric|min:0',

            ]);

    

            DB::beginTransaction();

            try {

                $journal->update([

                    'entry_date' => $validated['entry_date'],

                    'penerima' => $validated['penerima'],

                    'fiscal_period_id' => $validated['fiscal_period_id'],

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

                return back()->withErrors(['error' => 'Gagal memperbarui jurnal: ' . $e->getMessage()]);

            }

        }

    

        // Edit Pengeluaran Kas

        public function kasPengeluaranEdit(JournalEntry $journal)

        {

            $accounts = Account::where('is_active', true)

                ->where('is_cash_account', false)

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $cashAccounts = Account::where('is_active', true)

                ->where('is_cash_account', true)

                ->where('account_name', 'like', '%Kas%')

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $periods = FiscalPeriod::where('status', 'Open')

                ->orderBy('start_date', 'desc')

                ->get(['id', 'period_name']);

    

            return Inertia::render('jurnal/forms/jurnalkas/pengeluaran', [

                'journal' => $journal->load('journalDetails'),

                'accounts' => $accounts,

                'cashAccounts' => $cashAccounts,

                'periods' => $periods

            ]);

        }

    

        // Update Pengeluaran Kas

        public function kasPengeluaranUpdate(Request $request, JournalEntry $journal)

        {

            $validated = $request->validate([

                'entry_date' => 'required|date',

                'fiscal_period_id' => 'required|exists:fiscal_periods,id',

                'penerima' => 'nullable|string',

                'cash_account_id' => 'required|exists:accounts,id',

                'details' => 'required|array|min:1',

                'details.*.account_id' => 'required|exists:accounts,id',

                'details.*.description' => 'nullable|string',

                'details.*.debit' => 'required|numeric|min:0',

            ]);

    

            DB::beginTransaction();

            try {

                $journal->update([

                    'entry_date' => $validated['entry_date'],

                    'penerima' => $validated['penerima'],

                    'fiscal_period_id' => $validated['fiscal_period_id'],

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

                return back()->withErrors(['error' => 'Gagal memperbarui jurnal: ' . $e->getMessage()]);

            }

        }

    

        // Edit Pemasukan Bank

        public function bankPemasukanEdit(JournalEntry $journal)

        {

            $accounts = Account::where('is_active', true)

                ->where('is_cash_account', false)

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $bankAccounts = Account::where('is_active', true)

                ->where('is_cash_account', true)

                ->where('account_name', 'like', '%Bank%')

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $periods = FiscalPeriod::where('status', 'Open')

                ->orderBy('start_date', 'desc')

                ->get(['id', 'period_name']);

    

            return Inertia::render('jurnal/forms/jurnalbank/pemasukan', [

                'journal' => $journal->load('journalDetails'),

                'accounts' => $accounts,

                'bankAccounts' => $bankAccounts,

                'periods' => $periods

            ]);

        }

    

        // Update Pemasukan Bank

        public function bankPemasukanUpdate(Request $request, JournalEntry $journal)

        {

            $validated = $request->validate([

                'entry_date' => 'required|date',

                'fiscal_period_id' => 'required|exists:fiscal_periods,id',

                'penerima' => 'nullable|string',

                'bank_account_id' => 'required|exists:accounts,id',

                'details' => 'required|array|min:1',

                'details.*.account_id' => 'required|exists:accounts,id',

                'details.*.description' => 'nullable|string',

                'details.*.credit' => 'required|numeric|min:0',

            ]);

    

            DB::beginTransaction();

            try {

                $journal->update([

                    'entry_date' => $validated['entry_date'],

                    'penerima' => $validated['penerima'],

                    'fiscal_period_id' => $validated['fiscal_period_id'],

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

                return back()->withErrors(['error' => 'Gagal memperbarui jurnal: ' . $e->getMessage()]);

            }

        }

    

        // Edit Pengeluaran Bank

        public function bankPengeluaranEdit(JournalEntry $journal)

        {

            $accounts = Account::where('is_active', true)

                ->where('is_cash_account', false)

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $bankAccounts = Account::where('is_active', true)

                ->where('is_cash_account', true)

                ->where('account_name', 'like', '%Bank%')

                ->orderBy('account_code')

                ->get(['id', 'account_code', 'account_name']);

    

            $periods = FiscalPeriod::where('status', 'Open')

                ->orderBy('start_date', 'desc')

                ->get(['id', 'period_name']);

    

            return Inertia::render('jurnal/forms/jurnalbank/pengeluaran', [

                'journal' => $journal->load('journalDetails'),

                'accounts' => $accounts,

                'bankAccounts' => $bankAccounts,

                'periods' => $periods

            ]);

        }

    

        // Update Pengeluaran Bank

        public function bankPengeluaranUpdate(Request $request, JournalEntry $journal)

        {

            $validated = $request->validate([

                'entry_date' => 'required|date',

                'fiscal_period_id' => 'required|exists:fiscal_periods,id',

                'penerima' => 'nullable|string',

                'bank_account_id' => 'required|exists:accounts,id',

                'details' => 'required|array|min:1',

                'details.*.account_id' => 'required|exists:accounts,id',

                'details.*.description' => 'nullable|string',

                'details.*.debit' => 'required|numeric|min:0',

            ]);

    

            DB::beginTransaction();

            try {

                $journal->update([

                    'entry_date' => $validated['entry_date'],

                    'penerima' => $validated['penerima'],

                    'fiscal_period_id' => $validated['fiscal_period_id'],

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

                return back()->withErrors(['error' => 'Gagal memperbarui jurnal: ' . $e->getMessage()]);

            }

        }

        

        // Hapus jurnal

        public function destroy($id)

        {

            DB::beginTransaction();

            try {

                $journal = JournalEntry::findOrFail($id);

                

                if ($journal->status === 'Posted') {

                    return back()->withErrors(['error' => 'Tidak dapat menghapus jurnal yang sudah diposting']);

                }

    

                $journal->journalDetails()->delete();

                $journal->delete();

    

                DB::commit();

    

                return back()->with('success', 'Jurnal berhasil dihapus');

            } catch (\Exception $e) {

                DB::rollBack();

                return back()->withErrors(['error' => 'Gagal menghapus jurnal: ' . $e->getMessage()]);

            }

        }

    }

    