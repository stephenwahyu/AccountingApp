<?php

namespace App\Observers;

use App\Events\JournalPosted;
use App\Models\JournalEntry;

class JournalEntryObserver
{
    /**
     * Handle the JournalEntry "created" event.
     */
    public function created(JournalEntry $journalEntry): void
    {
        if ($journalEntry->status === 'Posted') {
            JournalPosted::dispatch($journalEntry);
        }
    }

    /**
     * Handle the JournalEntry "updated" event.
     */
    public function updated(JournalEntry $journalEntry): void
    {
        if ($journalEntry->isDirty('status') && $journalEntry->status === 'Posted') {
            JournalPosted::dispatch($journalEntry);
        }
    }
}
