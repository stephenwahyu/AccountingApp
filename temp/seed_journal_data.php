<?php

use App\Models\Account;
use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use App\Models\User;
use Carbon\Carbon;
use Faker\Factory as FakerFactory;

$faker = FakerFactory::create();

// 1. Retrieve all Fiscal Periods for 2025
$fiscalPeriods = FiscalPeriod::where('fiscal_year', 2025)->where('period_type', 'monthly')->get()->keyBy(function ($item) {
    return Carbon::parse($item->start_date)->format('Y-m');
});

if ($fiscalPeriods->isEmpty()) {
    echo 'No fiscal periods found for 2025. Please ensure they are created.'.PHP_EOL;

    return;
}

// 2. Retrieve all active Accounts
$accounts = Account::where('is_active', true)->get();

if ($accounts->isEmpty()) {
    echo 'No active accounts found. Please seed accounts first.'.PHP_EOL;

    return;
}

// 3. Retrieve a User to assign to user_id and posted_by fields
$user = User::first();
if (! $user) {
    // Create a dummy user if none exists
    $user = User::factory()->create([
        'name' => 'Seeder User',
        'email' => 'seeder@example.com',
        'password' => bcrypt('password'),
    ]);
    echo 'Created a dummy user for seeding: '.$user->email.PHP_EOL;
}

$startDate = Carbon::create(2025, 1, 1);
$endDate = Carbon::create(2025, 12, 31);
$currentDate = $startDate->copy();

echo 'Starting journal seeding for 2025...'.PHP_EOL;

while ($currentDate->lessThanOrEqualTo($endDate)) {
    $monthKey = $currentDate->format('Y-m');
    $fiscalPeriod = $fiscalPeriods->get($monthKey);

    if (! $fiscalPeriod) {
        echo 'Warning: No fiscal period found for '.$currentDate->format('Y-m-d').PHP_EOL;
        $currentDate->addDay();

        continue;
    }

    for ($i = 0; $i < 10; $i++) { // 10 journals per day
        $journalEntry = JournalEntry::factory()->create([
            'entry_date' => $currentDate->toDateString(),
            'fiscal_period_id' => $fiscalPeriod->id,
            'user_id' => $user->id,
            'posted_by' => $user->id,
            'status' => 'Posted',
        ]);

        $debitAccount = $accounts->random();
        // Ensure credit account is different from debit account for more realistic entries
        $creditAccount = $accounts->except($debitAccount->id)->random();

        $amount = round($faker->randomFloat(2, 50, 5000), 2); // Random amount for transaction

        // Debit detail
        JournalDetail::factory()->create([
            'journal_entry_id' => $journalEntry->id,
            'account_id' => $debitAccount->id,
            'debit' => $amount,
            'credit' => 0,
            'description' => $faker->sentence(),
        ]);

        // Credit detail
        JournalDetail::factory()->create([
            'journal_entry_id' => $journalEntry->id,
            'account_id' => $creditAccount->id,
            'debit' => 0,
            'credit' => $amount,
            'description' => $faker->sentence(),
        ]);
    }
    echo 'Seeded 10 journal entries for '.$currentDate->format('Y-m-d').PHP_EOL;
    $currentDate->addDay();
}

echo 'Journal seeding completed.'.PHP_EOL;
