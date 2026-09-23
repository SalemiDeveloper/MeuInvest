<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $reference_period
 */
#[Fillable([
    'user_id',
    'reference_period',
    'original_filename',
    'stored_path',
])]
class InvestmentImport extends Model
{
    /**
     * Get the user that owns the import.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the investment positions for the import.
     *
     * @return HasMany<InvestmentPosition, $this>
     */
    public function positions(): HasMany
    {
        return $this->hasMany(InvestmentPosition::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reference_period' => 'date',
        ];
    }
}
