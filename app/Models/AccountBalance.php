<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountBalance extends Model
{
    /** @use HasFactory<\Database\Factories\AccountBalanceFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'account_id',
        'fiscal_period_id',
        'beginning_balance',
        'debit_total',
        'credit_total',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function fiscalPeriod(): BelongsTo
    {
        return $this->belongsTo(FiscalPeriod::class);
    }
}
