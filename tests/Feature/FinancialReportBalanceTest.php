<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\AccountCategory;
use App\Models\AccountType;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use App\Models\Role;
use App\Models\User;
use App\Services\LaporanKeuanganService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class FinancialReportBalanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_financial_reports_remain_balanced_after_closing_periods(): void
    {
        // 1. Setup Data
        $role = Role::forceCreate(['name' => 'Admin']);
        $user = User::factory()->create(['role_id' => $role->id]);
        Auth::login($user);

        $assetType = AccountType::forceCreate(['name' => 'Aset', 'normal_balance' => 'Debit']);
        $liabilityType = AccountType::forceCreate(['name' => 'Liabilitas', 'normal_balance' => 'Kredit']);
        $equityType = AccountType::forceCreate(['name' => 'Ekuitas', 'normal_balance' => 'Kredit']);

        $assetCat = AccountCategory::forceCreate(['name' => 'Kas', 'account_type_id' => $assetType->id]);
        $liabCat = AccountCategory::forceCreate(['name' => 'Hutang', 'account_type_id' => $liabilityType->id]);
        $equityCat = AccountCategory::forceCreate(['name' => 'Modal', 'account_type_id' => $equityType->id]);

        $cashAccount = Account::forceCreate([
            'account_code' => '1-1001', 'account_name' => 'Cash', 'account_category_id' => $assetCat->id, 'initial_balance' => 10000, 'is_active' => true,
        ]);
        $loanAccount = Account::forceCreate([
            'account_code' => '2-1001', 'account_name' => 'Loan', 'account_category_id' => $liabCat->id, 'initial_balance' => 0, 'is_active' => true,
        ]);
        $capitalAccount = Account::forceCreate([
            'account_code' => '3-1001', 'account_name' => 'Owner Capital', 'account_category_id' => $equityCat->id, 'initial_balance' => 10000, 'is_active' => true,
        ]);

        $period1 = FiscalPeriod::forceCreate([
            'period_name' => 'Jan 2024', 'start_date' => '2024-01-01', 'end_date' => '2024-01-31', 'period_type' => 'monthly', 'status' => 'Open', 'fiscal_year' => 2024,
        ]);
        $period2 = FiscalPeriod::forceCreate([
            'period_name' => 'Feb 2024', 'start_date' => '2024-02-01', 'end_date' => '2024-02-28', 'period_type' => 'monthly', 'status' => 'Open', 'fiscal_year' => 2024,
        ]);

        // Period 1: Increase Cash by 1000 (Debit Cash, Credit Loan)
        $entry1 = JournalEntry::forceCreate(['entry_number' => 'JV-001', 'entry_date' => '2024-01-15', 'fiscal_period_id' => $period1->id, 'status' => 'Posted', 'user_id' => $user->id]);
        JournalDetail::create(['journal_entry_id' => $entry1->id, 'account_id' => $cashAccount->id, 'debit' => 1000, 'credit' => 0]);
        JournalDetail::create(['journal_entry_id' => $entry1->id, 'account_id' => $loanAccount->id, 'debit' => 0, 'credit' => 1000]);

        // Manually trigger the close logic to avoid redirect/middleware issues in test
        $controller = new \App\Http\Controllers\PeriodeController;
        $controller->close(request(), $period1);

        $this->assertEquals('Closed', $period1->fresh()->status);

        // Verify P1 Report
        $service = new LaporanKeuanganService;
        $report1 = $service->getPosisiKeuangan($period1);
        $this->assertEquals(11000, $report1['assets']['total']);
        $this->assertEquals(1000, $report1['liabilities']['total']);
        $this->assertEquals(10000, $report1['equity']['total']);
        $this->assertEquals(11000, $report1['liabilities']['total'] + $report1['equity']['total']);

        // Period 2: Another 500 movement
        $entry2 = JournalEntry::forceCreate(['entry_number' => 'JV-002', 'entry_date' => '2024-02-10', 'fiscal_period_id' => $period2->id, 'status' => 'Posted', 'user_id' => $user->id]);
        JournalDetail::create(['journal_entry_id' => $entry2->id, 'account_id' => $cashAccount->id, 'debit' => 500, 'credit' => 0]);
        JournalDetail::create(['journal_entry_id' => $entry2->id, 'account_id' => $loanAccount->id, 'debit' => 0, 'credit' => 500]);

        $controller->close(request(), $period2);
        $this->assertEquals('Closed', $period2->fresh()->status);

        // Verify P2 Report
        $report2 = $service->getPosisiKeuangan($period2);
        $this->assertEquals(11500, $report2['assets']['total']);
        $this->assertEquals(1500, $report2['liabilities']['total']);
        $this->assertEquals(10000, $report2['equity']['total']);
        $this->assertEquals(11500, $report2['liabilities']['total'] + $report2['equity']['total']);
    }
}
