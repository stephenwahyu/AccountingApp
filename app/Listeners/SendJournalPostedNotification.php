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
        // Fetch all users with role 'Pemimpin', 'Admin', and 'Akuntan'
        $recipients = \App\Models\User::whereHas('role', function ($query) {
            $query->whereIn('name', ['Pemimpin', 'Admin', 'Akuntan']);
        })->get();

        foreach ($recipients as $recipient) {
            if ($recipient->email) {
                Mail::to($recipient->email)->send(new JournalPostedMail($event->journal));
            }
        }
    }
}
