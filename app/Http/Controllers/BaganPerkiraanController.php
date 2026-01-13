<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AccountCategory;
use App\Models\AccountType;
use App\Models\CashFlowActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BaganPerkiraanController extends Controller
{
    // Index/List methods
    public function index()
    {
        $accounts = Account::with('descendants', 'accountCategory.accountType')
            ->whereNull('parent_id')
            ->get();

        return Inertia::render('akun/semua', [
            'accounts' => $accounts,
        ]);
    }

    public function akun()
    {

        $accounts = Account::with(['accountCategory.accountType'])
            ->orderBy('account_code', 'asc')
            ->get()->map(function ($account) {

                return [

                    'id' => $account->id,

                    'account_code' => $account->account_code,

                    'account_name' => $account->account_name,

                    'category_name' => $account->accountCategory->name,

                    'type_name' => $account->accountCategory->accountType->name,

                ];

            });

        return Inertia::render('akun/akun', [

            'accounts' => $accounts,

        ]);

    }

    public function kategoriAkun()
    {

        $categories = AccountCategory::with('accountType')->get()->map(function ($category) {

            return [

                'id' => $category->id,

                'name' => $category->name,

                'type_name' => $category->accountType->name,

            ];

        });

        return Inertia::render('akun/kategoriakun', [

            'categories' => $categories,

        ]);

    }

    public function tipeAkun()
    {
        $types = AccountType::all();

        return Inertia::render('akun/tipeakun', [
            'types' => $types,
        ]);
    }

    // Account (Akun) CRUD
    public function createAkun()
    {
        return Inertia::render('akun/forms/akun', [
            'categories' => AccountCategory::all(),
            'accounts' => Account::all(),
            'cashFlowActivities' => CashFlowActivity::all(),
        ]);
    }

    public function storeAkun(Request $request)
    {
        $data = $request->all();
        if (isset($data['parent_id']) && $data['parent_id'] === 'null') {
            $data['parent_id'] = null;
        }

        $request->validate([
            'account_code' => 'required|unique:accounts',
            'account_name' => 'required|string|max:255',
            'account_category_id' => 'required|exists:account_categories,id',
            'initial_balance' => 'nullable|numeric',
            'parent_id' => 'nullable|exists:accounts,id',
            'is_cash_account' => 'required|boolean',
            'cash_flow_activity_id' => 'nullable|required_if:is_cash_account,true|exists:cash_flow_activities,id',
            'is_active' => 'required|boolean',
        ]);

        Account::create($data);

        return redirect()->route('bagan-perkiraan.akun')->with('message', 'Akun berhasil dibuat.');
    }

    public function editAkun(Account $account)
    {
        return Inertia::render('akun/forms/akun', [
            'account' => $account,
            'categories' => AccountCategory::all(),
            'accounts' => Account::where('id', '!=', $account->id)->get(), // Exclude self
            'cashFlowActivities' => CashFlowActivity::all(),
        ]);
    }

    public function updateAkun(Request $request, Account $account)
    {
        $data = $request->all();
        if (isset($data['parent_id']) && $data['parent_id'] === 'null') {
            $data['parent_id'] = null;
        }

        $request->validate([
            'account_code' => 'required|unique:accounts,account_code,'.$account->id,
            'account_name' => 'required|string|max:255',
            'account_category_id' => 'required|exists:account_categories,id',
            'initial_balance' => 'nullable|numeric',
            'parent_id' => 'nullable|exists:accounts,id',
            'is_cash_account' => 'required|boolean',
            'cash_flow_activity_id' => 'nullable|required_if:is_cash_account,true|exists:cash_flow_activities,id',
            'is_active' => 'required|boolean',
        ]);

        $account->update($data);

        return redirect()->route('bagan-perkiraan.akun')->with('message', 'Akun berhasil diperbarui.');
    }

    public function generateAccountCode(?Account $parent = null)
    {

        $newCode = '';

        if ($parent) {

            // Case 1: Has a parent. Find siblings and determine the next code.

            $parentCodePrefix = explode('-', $parent->account_code)[0];

            $lastSibling = Account::where('parent_id', $parent->id)
                ->orderBy('account_code', 'desc')
                ->first();

            if ($lastSibling) {

                $parts = explode('-', $lastSibling->account_code);

                $lastNumber = (int) $parts[1];

                $nextNumber = $lastNumber + 100;

                $newCode = $parentCodePrefix.'-'.$nextNumber;

            } else {

                // This is the first child.

                $parentSecondSegment = (int) explode('-', $parent->account_code)[1];

                $nextNumber = $parentSecondSegment + 100; // Start a new block

                $newCode = $parentCodePrefix.'-'.$nextNumber;

            }

        } else {

            // Case 2: No parent (top-level account).

            $lastRootAccount = Account::whereNull('parent_id')

                ->orderBy('account_code', 'desc')

                ->first();

            if ($lastRootAccount) {

                $parts = explode('-', $lastRootAccount->account_code);

                $lastPrefix = (int) $parts[0];

                $nextPrefix = $lastPrefix + 1;

                $newCode = $nextPrefix.'-1000';

            } else {

                // First account in the system.

                $newCode = '1-1000';

            }

        }

        return response()->json(['account_code' => $newCode]);

    }

    public function destroyAkun(Account $account)
    {
        $account->delete();

        return redirect()->route('bagan-perkiraan.akun')->with('message', 'Akun berhasil dihapus.');
    }

    // Account Category (Kategori Akun) CRUD
    public function createKategoriAkun()
    {
        return Inertia::render('akun/forms/kategoriakun', [
            'types' => AccountType::all(),
        ]);
    }

    public function storeKategoriAkun(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:account_categories',
            'account_type_id' => 'required|exists:account_types,id',
        ]);

        AccountCategory::create($request->all());

        return redirect()->route('bagan-perkiraan.kategori-akun')->with('message', 'Kategori Akun berhasil dibuat.');
    }

    public function editKategoriAkun(AccountCategory $kategori_akun)
    {
        return Inertia::render('akun/forms/kategoriakun', [
            'category' => $kategori_akun,
            'types' => AccountType::all(),
        ]);
    }

    public function updateKategoriAkun(Request $request, AccountCategory $kategori_akun)
    {
        $request->validate([
            'name' => 'required|unique:account_categories,name,'.$kategori_akun->id,
            'account_type_id' => 'required|exists:account_types,id',
        ]);

        $kategori_akun->update($request->all());

        return redirect()->route('bagan-perkiraan.kategori-akun')->with('message', 'Kategori Akun berhasil diperbarui.');
    }

    public function destroyKategoriAkun(AccountCategory $kategori_akun)
    {
        $kategori_akun->delete();

        return redirect()->route('bagan-perkiraan.kategori-akun')->with('message', 'Kategori Akun berhasil dihapus.');
    }

    // Account Type (Tipe Akun) CRUD
    public function createTipeAkun()
    {
        return Inertia::render('akun/forms/tipeakun');
    }

    public function storeTipeAkun(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:account_types',
        ]);

        AccountType::create($request->all());

        return redirect()->route('bagan-perkiraan.tipe-akun')->with('message', 'Tipe Akun berhasil dibuat.');
    }

    public function editTipeAkun(AccountType $tipe_akun)
    {
        return Inertia::render('akun/forms/tipeakun', [
            'type' => $tipe_akun,
        ]);
    }

    public function updateTipeAkun(Request $request, AccountType $tipe_akun)
    {
        $request->validate([
            'name' => 'required|unique:account_types,name,'.$tipe_akun->id,
        ]);

        $tipe_akun->update($request->all());

        return redirect()->route('bagan-perkiraan.tipe-akun')->with('message', 'Tipe Akun berhasil diperbarui.');
    }

    public function destroyTipeAkun(AccountType $tipe_akun)
    {
        $tipe_akun->delete();

        return redirect()->route('bagan-perkiraan.tipe-akun')->with('message', 'Tipe Akun berhasil dihapus.');
    }
}
