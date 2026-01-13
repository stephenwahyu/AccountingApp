<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class JournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            $this->command->error('Please seed Users first.');

            return;
        }

        $startDate = Carbon::create(2025, 1, 1);
        $endDate = Carbon::create(2025, 12, 31);

        $this->command->info("Seeding journal entries from {$startDate->toDateString()} to {$endDate->toDateString()}...");

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $this->seedDay($date, $user);
        }

        $this->command->info('Finished seeding journal entries.');
    }

    /**
     * Seed 10 journal entries for a specific day.
     *
     * @param Carbon $date
     * @param User $user
     */
    private function seedDay(Carbon $date, User $user): void
    {
        $period = FiscalPeriod::where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first();

        if (!$period) {
            $this->command->warn("Fiscal period for {$date->toDateString()} not found. Skipping.");

            return;
        }

        // Fetch accounts to be used in seeding
        $debitAccounts = Account::whereIn('id', [122, 127, 94, 89, 9, 14])->get();
        $creditAccounts = Account::whereIn('id', [3, 5, 49, 75])->get();

        if ($debitAccounts->isEmpty() || $creditAccounts->isEmpty()) {
            $this->command->error('Please seed Accounts first.');
            return;
        }


        for ($i = 1; $i <= 10; $i++) {
            $entry_number = 'JU-' . $date->format('Ymd') . '-' . str_pad($i, 3, '0', STR_PAD_LEFT);
            $amount = rand(100000, 5000000);
            $debitAccount = $debitAccounts->random();
            $creditAccount = $creditAccounts->random();

            $entry = JournalEntry::create([
                'entry_date' => $date,
                'penerima' => 'Penerima ' . $i,
                'status' => 'Posted',
                'journal_type' => 'Umum',
                'fiscal_period_id' => $period->id,
                'user_id' => $user->id,
                'entry_number' => $entry_number,
            ]);

            $entry->journalDetails()->createMany([
                [
                    'account_id' => $debitAccount->id,
                    'debit' => $amount,
                    'credit' => 0,
                    'description' => 'Seeded debit for ' . $debitAccount->account_name,
                ],
                [
                    'account_id' => $creditAccount->id,
                    'debit' => 0,
                    'credit' => $amount,
                    'description' => 'Seeded credit for ' . $creditAccount->account_name,
                ],
            ]);
        }
    }
}