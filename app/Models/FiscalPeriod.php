<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FiscalPeriod extends Model
{
    /** @use HasFactory<\Database\Factories\FiscalPeriodFactory> */
    use HasFactory;

    protected $fillable = [
        'period_name',
        'start_date',
        'end_date',
        'fiscal_year',
        'status',
        'period_type',
        'closed_at',
        'closed_by',
    ];

    public function closedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function accountBalances(): HasMany
    {
        return $this->hasMany(AccountBalance::class);
    }

    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }
}
