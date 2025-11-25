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
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->date('entry_date');
            $table->string('entry_number', 50)->unique();
            $table->text('penerima')->nullable();
            $table->enum('journal_type', ['Umum', 'Bank Masuk', 'Bank Keluar', 'Kas Masuk', 'Kas Keluar', 'Penyesuaian'])->default('Umum');
            $table->enum('status', ['Draft', 'Posted'])->default('Draft');
            $table->foreignId('fiscal_period_id')->constrained('fiscal_periods');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('posted_at')->nullable();
            $table->foreignId('posted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('entry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};