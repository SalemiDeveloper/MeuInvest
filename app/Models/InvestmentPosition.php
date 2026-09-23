<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $issued_at
 * @property Carbon|null $maturity_date
 */
#[Fillable([
    'investment_import_id',
    'product',
    'institution',
    'issuer',
    'code',
    'indexer',
    'issued_at',
    'maturity_date',
    'curve_value',
])]
class InvestmentPosition extends Model
{
    /**
     * Get the import that owns the investment position.
     *
     * @return BelongsTo<InvestmentImport, $this>
     */
    public function investmentImport(): BelongsTo
    {
        return $this->belongsTo(InvestmentImport::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'maturity_date' => 'date',
            'curve_value' => 'decimal:2',
        ];
    }
}
