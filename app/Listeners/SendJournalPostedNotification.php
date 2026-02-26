<?php

namespace App\Listeners;

use App\Events\JournalPosted;
use App\Mail\JournalPostedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendJournalPostedNotification implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(JournalPosted $event): void
    {
        // Send to the user who posted it
        $recipient = $event->journal->postedByUser->email ?? $event->journal->user->email;

        if ($recipient) {
            Mail::to($recipient)->send(new JournalPostedMail($event->journal));
        }
    }
}
