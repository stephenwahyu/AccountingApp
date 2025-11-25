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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_code', 20)->unique();
            $table->string('account_name');
            $table->foreignId('account_category_id')->constrained('account_categories');
            $table->foreignId('cash_flow_activity_id')->nullable()->constrained('cash_flow_activities');
            $table->boolean('is_cash_account')->default(false)->comment('Penanda akun kas atau bank');
            $table->boolean('is_active')->default(true);
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->onDelete('set null');
            $table->decimal('initial_balance', 15, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};