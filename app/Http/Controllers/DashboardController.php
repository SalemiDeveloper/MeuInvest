<?php

namespace App\Http\Controllers;

use App\Models\InvestmentImport;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $latestImport = InvestmentImport::query()
            ->where('user_id', Auth::id())
            ->with([
                'positions:id,investment_import_id,product,institution,issuer,code,maturity_date,curve_value',
            ])
            ->latest('reference_period')
            ->first();

        $totalValue = 0.0;
        $positionsCount = 0;
        $institutionsCount = 0;

        if ($latestImport) {
            $positions = $latestImport->positions;

            $totalValue = (float) $positions->sum('curve_value');
            $positionsCount = $positions->count();

            $institutionsCount = $positions
                ->pluck('institution')
                ->filter()
                ->unique()
                ->count();
        }

        return Inertia::render('dashboard', [
            'summary' => [
                'has_import' => $latestImport !== null,
                'reference_period' => $latestImport?->reference_period
                    ?->format('Y-m-d'),
                'total_value' => number_format(
                    $totalValue,
                    2,
                    '.',
                    '',
                ),
                'positions_count' => $positionsCount,
                'institutions_count' => $institutionsCount,
            ],

            'latest_import' => $latestImport
                ? [
                    'id' => $latestImport->id,
                    'reference_period' => $latestImport->reference_period
                        ->format('Y-m-d'),
                    'original_filename' => $latestImport->original_filename,
                    'positions' => $latestImport->positions,
                ]
                : null,
        ]);
    }
}