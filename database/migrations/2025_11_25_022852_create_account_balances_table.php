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
        Schema::create('account_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->onDelete('cascade');
            $table->foreignId('fiscal_period_id')->constrained('fiscal_periods')->onDelete('cascade');
            $table->decimal('beginning_balance', 15, 2);
            $table->decimal('debit_total', 15, 2)->default(0.00);
            $table->decimal('credit_total', 15, 2)->default(0.00);
            $table->decimal('ending_balance', 15, 2)->storedAs('(beginning_balance + debit_total) - credit_total');
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['account_id', 'fiscal_period_id'], 'unique_account_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_balances');
    }
};