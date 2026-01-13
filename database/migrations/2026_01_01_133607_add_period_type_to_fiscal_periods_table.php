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
        Schema::table('fiscal_periods', function (Blueprint $table) {
            $table->string('period_type')->default('monthly')->after('status');
            $table->index('period_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fiscal_periods', function (Blueprint $table) {
            $table->dropIndex(['period_type']);
            $table->dropColumn('period_type');
        });
    }
};
