<?php

namespace App\Services;

use App\Models\InvestmentImport;
use App\Models\InvestmentPosition;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class InvestmentReportComparisonService
{
    /**
     * Compara dois relatórios mensais consecutivos.
     *
     * @return array<string, mixed>
     */
    public function compare(
        InvestmentImport $previousImport,
        InvestmentImport $currentImport
    ): array {
        $this->validateImports(
            $previousImport,
            $currentImport
        );

        $previousPositions = $previousImport
            ->positions()
            ->get();

        $currentPositions = $currentImport
            ->positions()
            ->get();

        $previousByCode = $this->indexByCode($previousPositions);
        $currentByCode = $this->indexByCode($currentPositions);

        $comparedPositions = [];
        $newPositions = [];
        $missingPositions = [];

        /*
         * Percorre as posições do relatório atual.
         */
        foreach ($currentByCode as $code => $currentPosition) {
            if ($previousByCode->has($code)) {
                $previousPosition = $previousByCode->get($code);

                $comparedPositions[] = $this->comparePosition(
                    $previousPosition,
                    $currentPosition
                );

                continue;
            }

            $newPositions[] = $this->formatUnmatchedPosition(
                $currentPosition,
                'new'
            );
        }

        /*
         * Procura posições que existiam no relatório anterior,
         * mas não aparecem no relatório atual.
         */
        foreach ($previousByCode as $code => $previousPosition) {
            if (! $currentByCode->has($code)) {
                $missingPositions[] = $this->formatUnmatchedPosition(
                    $previousPosition,
                    'missing'
                );
            }
        }

        /*
         * Totais gerais dos dois relatórios.
         */
        $totalPreviousValue = $this->sumValues($previousPositions);
        $totalCurrentValue = $this->sumValues($currentPositions);
        $totalVariation = $totalCurrentValue - $totalPreviousValue;

        /*
         * Totais apenas das posições presentes nos dois meses.
         * Esses valores representam melhor a evolução dos investimentos
         * que puderam ser efetivamente comparados.
         */
        $comparedPreviousValue = 0.0;
        $comparedCurrentValue = 0.0;
        $comparedVariation = 0.0;

        foreach ($comparedPositions as $position) {
            $comparedPreviousValue += (float) $position['previous_value'];
            $comparedCurrentValue += (float) $position['current_value'];
            $comparedVariation += (float) $position['variation'];
        }

        return [
            'previous_period' => $previousImport->reference_period
                ->format('Y-m-d'),

            'current_period' => $currentImport->reference_period
                ->format('Y-m-d'),

            /*
             * Patrimônio total.
             */
            'total_previous_value' => $this->formatDecimal(
                $totalPreviousValue
            ),

            'total_current_value' => $this->formatDecimal(
                $totalCurrentValue
            ),

            'total_variation' => $this->formatDecimal(
                $totalVariation
            ),

            'total_percentage' => $this->calculatePercentage(
                $totalPreviousValue,
                $totalVariation
            ),

            /*
             * Evolução apenas das posições comparáveis.
             */
            'compared_previous_value' => $this->formatDecimal(
                $comparedPreviousValue
            ),

            'compared_current_value' => $this->formatDecimal(
                $comparedCurrentValue
            ),

            'compared_variation' => $this->formatDecimal(
                $comparedVariation
            ),

            'compared_percentage' => $this->calculatePercentage(
                $comparedPreviousValue,
                $comparedVariation
            ),

            /*
             * Detalhamento.
             */
            'positions' => $comparedPositions,
            'new_positions' => $newPositions,
            'missing_positions' => $missingPositions,
        ];
    }

    /**
     * Valida os relatórios recebidos.
     */
    private function validateImports(
        InvestmentImport $previousImport,
        InvestmentImport $currentImport
    ): void {
        if ($previousImport->user_id !== $currentImport->user_id) {
            throw new InvalidArgumentException(
                'Os relatórios pertencem a usuários diferentes.'
            );
        }

        if ($previousImport->id === $currentImport->id) {
            throw new InvalidArgumentException(
                'Os relatórios anterior e atual devem ser diferentes.'
            );
        }

        if (
            $previousImport->reference_period >=
            $currentImport->reference_period
        ) {
            throw new InvalidArgumentException(
                'O relatório anterior deve possuir um período menor que o relatório atual.'
            );
        }

        $expectedCurrentPeriod = $previousImport
            ->reference_period
            ->addMonth();

        if (
            ! $expectedCurrentPeriod->isSameMonth(
                $currentImport->reference_period
            )
        ) {
            throw new InvalidArgumentException(
                'A comparação mensal deve utilizar dois meses consecutivos.'
            );
        }
    }

    /**
     * Indexa as posições pelo código.
     *
     * Códigos vazios são ignorados nesta primeira versão,
     * conforme a regra definida para o MVP.
     *
     * @param  Collection<int, InvestmentPosition>  $positions
     * @return Collection<string, InvestmentPosition>
     */
    private function indexByCode(Collection $positions): Collection
    {
        return $positions
            ->filter(function (InvestmentPosition $position) {
                return $position->code !== null
                    && trim($position->code) !== '';
            })
            ->keyBy(function (InvestmentPosition $position) {
                return trim($position->code);
            });
    }

    /**
     * Compara uma posição presente nos dois relatórios.
     *
     * @return array<string, mixed>
     */
    private function comparePosition(
        InvestmentPosition $previousPosition,
        InvestmentPosition $currentPosition
    ): array {
        $previousValue = (float) $previousPosition->curve_value;
        $currentValue = (float) $currentPosition->curve_value;
        $variation = $currentValue - $previousValue;

        return [
            'code' => $currentPosition->code,
            'product' => $currentPosition->product,
            'institution' => $currentPosition->institution,
            'issuer' => $currentPosition->issuer,

            'previous_value' => $this->formatDecimal(
                $previousValue
            ),

            'current_value' => $this->formatDecimal(
                $currentValue
            ),

            'variation' => $this->formatDecimal(
                $variation
            ),

            'percentage' => $this->calculatePercentage(
                $previousValue,
                $variation
            ),

            'status' => 'maintained',
        ];
    }

    /**
     * Formata uma posição que não foi encontrada no outro relatório.
     *
     * @return array<string, mixed>
     */
    private function formatUnmatchedPosition(
        InvestmentPosition $position,
        string $status
    ): array {
        return [
            'code' => $position->code,
            'product' => $position->product,
            'institution' => $position->institution,
            'issuer' => $position->issuer,

            'value' => $this->formatDecimal(
                (float) $position->curve_value
            ),

            'status' => $status,
        ];
    }

    /**
     * Soma os valores CURVA das posições.
     *
     * @param  Collection<int, InvestmentPosition>  $positions
     */
    private function sumValues(Collection $positions): float
    {
        return (float) $positions->sum(function (
            InvestmentPosition $position
        ) {
            return (float) $position->curve_value;
        });
    }

    /**
     * Calcula o percentual de variação.
     */
    private function calculatePercentage(
        float $previousValue,
        float $variation
    ): ?string {
        if ($previousValue <= 0) {
            return null;
        }

        return $this->formatDecimal(
            ($variation / $previousValue) * 100
        );
    }

    /**
     * Formata um número com duas casas decimais.
     */
    private function formatDecimal(float $value): string
    {
        return number_format($value, 2, '.', '');
    }
}
