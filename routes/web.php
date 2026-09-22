<?php

use App\Http\Controllers\InvestmentImportController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('instructions', 'instructions')->name('instructions');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)
    ->name('dashboard');

    Route::get('investments/import', [InvestmentImportController::class, 'create'])
    ->name('investments.import.create');

    Route::post('investments/import', [InvestmentImportController::class, 'store'])
    ->name('investments.import.store');

    Route::get('investments/reports', [InvestmentImportController::class, 'index'])
    ->name('investments.import.index');

    Route::delete('investments/reports/{id}', [InvestmentImportController::class,'destroy',])
    ->name('investments.reports.destroy');

    Route::get('investments/analysis/monthly', [InvestmentImportController::class, 'comparison',])
    ->name('investments.analysis.monthly');

    Route::get('investments/analysis/monthly/compare', [InvestmentImportController::class, 'compare',])
    ->name('investments.analysis.monthly.compare');

    Route::get('investments/analysis/evolution', [InvestmentImportController::class,'evolution',])
    ->name('investments.analysis.evolution');

    Route::get('investments/analysis/positions', [InvestmentImportController::class,'investmentHistory',])
    ->name('investments.analysis.positions');
});

require __DIR__.'/settings.php';