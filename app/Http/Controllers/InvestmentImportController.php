<?php

namespace App\Http\Controllers;

use App\Models\InvestmentImport;
use App\Services\InvestmentReportImporter;
use App\Services\InvestmentHistoryService;
use App\Services\InvestmentReportComparisonService;
use Carbon\CarbonImmutable;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

class InvestmentImportController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('investments/import');
    }

    public function index(): Response
    {
        $imports = InvestmentImport::query()
            ->where('user_id', Auth::id())
            ->withCount('positions')
            ->latest('reference_period')
            ->get([
                'id',
                'reference_period',
                'original_filename',
                'created_at',
            ]);

        return Inertia::render('investments/reports', [
            'imports' => $imports,
        ]);
    }

    public function store(
        Request $request,
        InvestmentReportImporter $importer
    ): RedirectResponse {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:xlsx',
                'max:10240',
            ],
        ]);

        $file = $validated['file'];

        try {
            /*
             * 1. Extrai o período de referência a partir
             * do nome original do arquivo.
             */
            $period = $importer->extractReferencePeriod(
                $file->getClientOriginalName()
            );

            $referencePeriod = CarbonImmutable::create(
                $period['year'],
                $period['month'],
                1
            )->startOfMonth();

            /*
             * 2. Salva temporariamente o arquivo para que
             * o PhpSpreadsheet possa abri-lo.
             */
            $temporaryPath = $file->store(
                'investment-reports/tmp'
            );

            $absolutePath = Storage::path($temporaryPath);

            /*
             * 3. Lê a aba e extrai as posições.
             */
            $worksheet = $importer->loadWorksheet($absolutePath);
            $positions = $importer->extractPositions($worksheet);

            if ($positions === []) {
                Storage::delete($temporaryPath);

                return back()->withErrors([
                    'file' => 'O relatório não contém posições de renda fixa.',
                ]);
            }

            /*
             * 4. Diretório definitivo do relatório.
             */
            $directory = sprintf(
                'investment-reports/%d/%s',
                $request->user()->id,
                $referencePeriod->format('Y-m')
            );

            $storedPath = $file->store($directory);

            /*
             * 5. Substitui a importação do mesmo período,
             * caso ela já exista.
             */
            DB::transaction(function () use (
                $request,
                $referencePeriod,
                $file,
                $storedPath,
                $positions
            ): void {
                $existingImport = InvestmentImport::query()
                    ->where('user_id', $request->user()->id)
                    ->whereDate('reference_period', $referencePeriod)
                    ->first();

                if ($existingImport) {
                    $oldStoredPath = $existingImport->stored_path;

                    $existingImport->delete();

                    if (
                        $oldStoredPath !== $storedPath &&
                        Storage::exists($oldStoredPath)
                    ) {
                        Storage::delete($oldStoredPath);
                    }
                }

                $investmentImport = InvestmentImport::create([
                    'user_id' => $request->user()->id,
                    'reference_period' => $referencePeriod,
                    'original_filename' => $file->getClientOriginalName(),
                    'stored_path' => $storedPath,
                ]);

                $investmentImport->positions()->createMany($positions);
            });

            /*
             * 6. Remove o arquivo temporário.
             */
            Storage::delete($temporaryPath);

            return to_route('investments.import.create')
                ->with(
                    'success',
                    sprintf(
                        'Relatório de %s importado com sucesso. %d posições foram processadas.',
                        $referencePeriod->translatedFormat('F \d\e Y'),
                        count($positions)
                    )
                );
        } catch (InvalidArgumentException|RuntimeException $exception) {
            return back()->withErrors([
                'file' => $exception->getMessage(),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'file' => 'Não foi possível processar o relatório. Verifique o arquivo e tente novamente.',
            ]);
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        $investmentImport = InvestmentImport::query()
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        Storage::delete($investmentImport->stored_path);

        $investmentImport->delete();

        return to_route('investments.import.index')
            ->with('success', 'Relatório excluído com sucesso.');
    }

    /**
     * Exibe os relatórios disponíveis para análise mensal.
     */
    public function comparison(): Response
    {
        $imports = InvestmentImport::query()
            ->where('user_id', Auth::id())
            ->withCount('positions')
            ->orderBy('reference_period')
            ->get([
                'id',
                'reference_period',
                'original_filename',
                'created_at',
            ]);

        return Inertia::render('investments/monthly-comparison', [
            'imports' => $imports,
        ]);
    }

    /**
     * Executa a comparação mensal entre dois relatórios.
     */
    public function compare(
        Request $request,
        InvestmentReportComparisonService $comparisonService
    ): Response {
        $validated = $request->validate([
            'previous_import_id' => [
                'required',
                'integer',
                'different:current_import_id',
            ],
            'current_import_id' => [
                'required',
                'integer',
            ],
        ]);

        $previousImport = InvestmentImport::query()
            ->where('user_id', Auth::id())
            ->findOrFail($validated['previous_import_id']);

        $currentImport = InvestmentImport::query()
            ->where('user_id', Auth::id())
            ->findOrFail($validated['current_import_id']);

        try {
            $comparison = $comparisonService->compare(
                $previousImport,
                $currentImport
            );
        } catch (InvalidArgumentException $exception) {
            return Inertia::render('investments/monthly-comparison', [
                'imports' => InvestmentImport::query()
                    ->where('user_id', Auth::id())
                    ->withCount('positions')
                    ->orderBy('reference_period')
                    ->get([
                        'id',
                        'reference_period',
                        'original_filename',
                        'created_at',
                    ]),
                'errors' => [
                    'comparison' => $exception->getMessage(),
                ],
            ]);
        }

        return Inertia::render('investments/monthly-comparison', [
            'imports' => InvestmentImport::query()
                ->where('user_id', Auth::id())
                ->withCount('positions')
                ->orderBy('reference_period')
                ->get([
                    'id',
                    'reference_period',
                    'original_filename',
                    'created_at',
                ]),

            'comparison' => $comparison,

            'selected' => [
                'previous_import_id' => (int) $validated['previous_import_id'],
                'current_import_id' => (int) $validated['current_import_id'],
            ],
        ]);
    }

    public function evolution(): Response
    {
        $imports = InvestmentImport::query()
            ->where('user_id', Auth::id())
            ->with('positions')
            ->orderBy('reference_period')
            ->get();

        $history = $imports->map(function (InvestmentImport $investmentImport) {
            $totalValue = $investmentImport->positions->sum(
                fn ($position) => (float) $position->curve_value
            );

            return [
                'id' => $investmentImport->id,
                'reference_period' => $investmentImport->reference_period
                    ->format('Y-m-d'),
                'total_value' => number_format(
                    $totalValue,
                    2,
                    '.',
                    '',
                ),
            ];
        })->values();

        return Inertia::render('investments/evolution', [
            'history' => $history,
        ]);
    }

    public function investmentHistory(
        InvestmentHistoryService $historyService,
    ): Response {
        $userId = Auth::id();

        $imports = InvestmentImport::query()
            ->where('user_id', $userId)
            ->with('positions')
            ->orderBy('reference_period')
            ->get();

        $latestImport = $imports->last();

        if (!$latestImport) {
            return Inertia::render('investments/positions', [
                'investments' => [],
                'selectedInvestment' => null,
                'history' => [],
                'selectedId' => null,
                'summary' => null,
            ]);
        }

        $investments = $latestImport->positions
            ->sortBy([
                ['product', 'asc'],
                ['institution', 'asc'],
            ])
            ->values()
            ->map(function ($position) {
                return [
                    'id' => $position->id,
                    'product' => $position->product,
                    'institution' => $position->institution,
                    'issuer' => $position->issuer,
                    'code' => $position->code,
                    'maturity_date' => $position->maturity_date?->format('Y-m-d'),
                ];
            })
            ->values();

        $selectedId = request()->integer('investment');

        $selectedPosition = null;
        $selectedInvestment = null;
        $history = [];
        $summary = null;

        if ($selectedId > 0) {
            $selectedPosition = $latestImport->positions
                ->firstWhere('id', $selectedId);

            if ($selectedPosition) {
                $selectedInvestment = [
                    'product' => $selectedPosition->product,
                    'institution' => $selectedPosition->institution,
                    'issuer' => $selectedPosition->issuer,
                    'code' => $selectedPosition->code,
                    'indexer' => $selectedPosition->indexer,
                    'issued_at' => $selectedPosition->issued_at?->format('Y-m-d'),
                    'maturity_date' => $selectedPosition->maturity_date?->format('Y-m-d'),
                ];

                $result = $historyService->buildHistory(
                    $selectedPosition,
                    $imports,
                );

                $history = $result['history'];

                $summary = [
                    'first_value' => $result['first_value'],
                    'latest_value' => $result['latest_value'],
                    'total_difference' => $result['total_difference'],
                    'total_percentage_change' => $result['total_percentage_change'],
                    'first_period' => $history[0]['reference_period']
                        ?? null,
                    'latest_period' => $history[count($history) - 1]['reference_period']
                        ?? null,
                ];
            }
        }

        return Inertia::render('investments/positions', [
            'investments' => $investments,
            'selectedInvestment' => $selectedInvestment,
            'history' => $history,
            'selectedId' => $selectedId > 0 ? $selectedId : null,
            'summary' => $summary,
        ]);
    }
}