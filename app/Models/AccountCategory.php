<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountCategory extends Model
{
    /** @use HasFactory<\Database\Factories\AccountCategoryFactory> */
    use HasFactory;

    public function accountType(): BelongsTo
    {
        return $this->belongsTo(AccountType::class);
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }
}
