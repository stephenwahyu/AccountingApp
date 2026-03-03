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

        // Can manage users (Manajer/Admin/Akuntan)
        \Illuminate\Support\Facades\Gate::define('manage-users', function ($user) {
            return in_array($user->role?->name, ['Admin', 'Akuntan']);
        });

        // Can manage accounting transactions (Akuntan)
        \Illuminate\Support\Facades\Gate::define('manage-accounting', function ($user) {
            return $user->role?->name === 'Akuntan';
        });

        // Can view reports and dashboard (All)
        \Illuminate\Support\Facades\Gate::define('view-reports', function ($user) {
            return in_array($user->role?->name, ['Pemimpin', 'Admin', 'Akuntan']);
        });
    }
}
