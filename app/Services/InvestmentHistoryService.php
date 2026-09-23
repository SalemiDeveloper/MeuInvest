<?php

namespace App\Services;

use App\Models\InvestmentImport;
use App\Models\InvestmentPosition;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class InvestmentHistoryService
{
    /**
     * Encontra o histórico de uma posição em todos os relatórios
     * em que ela estiver presente.
     *
     * @param  Collection<int, InvestmentImport>  $imports
     * @return array{
     *     history: array<int, array{
     *         reference_period: string,
     *         value: string,
     *         difference: string|null,
     *         percentage_change: string|null
     *     }>,
     *     first_value: string|null,
     *     latest_value: string|null,
     *     total_difference: string|null,
     *     total_percentage_change: string|null
     * }
     */
    public function buildHistory(
        InvestmentPosition $selectedPosition,
        Collection $imports,
    ): array {
        $history = [];

        foreach ($imports as $import) {
            $position = $import->positions
                ->first(
                    fn (InvestmentPosition $candidate) => $this->matches(
                        $selectedPosition,
                        $candidate,
                    ),
                );

            if (! $position) {
                continue;
            }

            $value = (float) $position->curve_value;

            $history[] = [
                'reference_period' => $import->reference_period
                    ->format('Y-m-d'),
                'value' => number_format(
                    $value,
                    2,
                    '.',
                    '',
                ),
            ];
        }

        $history = collect($history)
            ->sortBy('reference_period')
            ->values()
            ->map(function (array $item, int $index) use ($history) {
                $currentValue = (float) $item['value'];

                if ($index === 0) {
                    return [
                        ...$item,
                        'difference' => null,
                        'percentage_change' => null,
                    ];
                }

                // ------------------------------------------------------
                // $previousValue = (float) $history[$index - 1]['value'];
                $previousItem = $history[$index - 1] ?? null;

                if ($previousItem === null) {
                    return [
                        ...$item,
                        'difference' => null,
                        'percentage_change' => null,
                    ];
                }

                $previousValue = (float) $previousItem['value'];
                // ------------------------------------------------------

                $difference = $currentValue - $previousValue;

                $percentageChange = $previousValue != 0
                    ? ($difference / $previousValue) * 100
                    : null;

                return [
                    ...$item,
                    'difference' => number_format(
                        $difference,
                        2,
                        '.',
                        '',
                    ),
                    'percentage_change' => $percentageChange !== null
                        ? number_format(
                            $percentageChange,
                            2,
                            '.',
                            '',
                        )
                        : null,
                ];
            })
            ->values()
            ->all();

        /** @var float|null $firstValue */
        $firstValue = count($history) > 0
            ? (float) $history[0]['value']
            : null;

        /** @var float|null $latestValue */
        $latestValue = count($history) > 0
            ? (float) $history[count($history) - 1]['value']
            : null;

        $totalDifference = $firstValue !== null && $latestValue !== null
            ? $latestValue - $firstValue
            : null;

        $totalPercentageChange = $firstValue !== null
            && $firstValue != 0
            && $totalDifference !== null
            ? ($totalDifference / $firstValue) * 100
            : null;

        return [
            'history' => $history,
            'first_value' => $firstValue !== null
                ? number_format($firstValue, 2, '.', '')
                : null,
            'latest_value' => $latestValue !== null
                ? number_format($latestValue, 2, '.', '')
                : null,
            'total_difference' => $totalDifference !== null
                ? number_format($totalDifference, 2, '.', '')
                : null,
            'total_percentage_change' => $totalPercentageChange !== null
                ? number_format($totalPercentageChange, 2, '.', '')
                : null,
        ];
    }

    private function matches(
        InvestmentPosition $selectedPosition,
        InvestmentPosition $candidate,
    ): bool {
        $selectedCode = $this->normalize($selectedPosition->code);
        $candidateCode = $this->normalize($candidate->code);

        /*
         * Quando existe código, ele é o principal identificador
         * da posição entre os relatórios.
         */
        if ($selectedCode !== '' && $candidateCode !== '') {
            return $selectedCode === $candidateCode;
        }

        /*
         * Para posições sem código, utilizamos uma identificação
         * composta por campos disponíveis no relatório.
         */
        return $this->normalize($selectedPosition->product)
                === $this->normalize($candidate->product)
            && $this->normalize($selectedPosition->institution)
                === $this->normalize($candidate->institution)
            && $this->normalize($selectedPosition->issuer)
                === $this->normalize($candidate->issuer)
            && $this->formatDate($selectedPosition->issued_at)
                === $this->formatDate($candidate->issued_at)
            && $this->formatDate($selectedPosition->maturity_date)
                === $this->formatDate($candidate->maturity_date);
    }

    private function normalize(?string $value): string
    {
        return mb_strtolower(trim($value ?? ''));
    }

    private function formatDate(?CarbonInterface $date): ?string
    {
        return $date?->format('Y-m-d');
    }
}
