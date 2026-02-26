<?php

namespace App\Providers;

use App\Models\JournalEntry;
use App\Observers\JournalEntryObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JournalEntry::observe(JournalEntryObserver::class);

        \Illuminate\Support\Facades\Gate::define('manage-all', function ($user) {
            return in_array($user->role?->name, ['Akuntan', 'Admin']);
        });

        \Illuminate\Support\Facades\Gate::define('view-reports', function ($user) {
            return in_array($user->role?->name, ['Direktur', 'Akuntan', 'Admin']);
        });
    }
}
