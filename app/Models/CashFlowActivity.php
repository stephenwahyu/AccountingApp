<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashFlowActivity extends Model
{
    /** @use HasFactory<\Database\Factories\CashFlowActivityFactory> */
    use HasFactory;

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }
}
