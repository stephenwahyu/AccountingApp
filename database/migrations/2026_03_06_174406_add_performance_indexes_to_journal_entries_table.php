<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Composite index for common dashboard queries
            $table->index(['status', 'entry_date']);
        });

        Schema::table('accounts', function (Blueprint $table) {
            // Index for cash account filtering
            $table->index('is_cash_account');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropIndex(['status', 'entry_date']);
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->dropIndex(['is_cash_account']);
        });
    }
};
