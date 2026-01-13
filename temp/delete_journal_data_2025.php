<?php

use App\Models\FiscalPeriod;
use App\Models\JournalDetail;
use App\Models\JournalEntry;

// Get all FiscalPeriod IDs for the year 2025
$fiscalPeriodIds = FiscalPeriod::where('fiscal_year', 2025)->pluck('id');

if ($fiscalPeriodIds->isEmpty()) {
    echo 'No fiscal periods found for 2025 to delete associated journal data.'.PHP_EOL;

    return;
}

// Get all JournalEntry IDs associated with these fiscal periods
$journalEntryIds = JournalEntry::whereIn('fiscal_period_id', $fiscalPeriodIds)->pluck('id');

if ($journalEntryIds->isEmpty()) {
    echo 'No journal entries found for 2025 fiscal periods to delete.'.PHP_EOL;
    // We can proceed to delete fiscal periods if no journal entries are found
} else {
    // Delete JournalDetail records first
    $deletedDetailsCount = JournalDetail::whereIn('journal_entry_id', $journalEntryIds)->delete();
    echo 'Deleted '.$deletedDetailsCount.' journal details associated with 2025 fiscal periods.'.PHP_EOL;

    // Delete JournalEntry records
    $deletedEntriesCount = JournalEntry::whereIn('id', $journalEntryIds)->delete();
    echo 'Deleted '.$deletedEntriesCount.' journal entries associated with 2025 fiscal periods.'.PHP_EOL;
}

echo 'Finished deleting journal data for 2025 fiscal periods.'.PHP_EOL;
