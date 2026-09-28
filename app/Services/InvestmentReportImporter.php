<?php

namespace App\Services;

use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use RuntimeException;

class InvestmentReportImporter
{
    /**
     * Extrai o período de referência do nome do arquivo.
     *
     * Exemplos aceitos:
     * relatorio-consolidado-mensal-2026-agosto.xlsx
     * relatorio-consolidado-mensal-2026-agosto(1).xlsx
     * relatorio-consolidado-mensal-2026-agosto(2).xlsx
     *
     * @return array{year: int, month: int}
     */
    public function extractReferencePeriod(string $filename): array
    {
        $pattern = '/^relatorio-consolidado-mensal-(\d{4})-([a-zç]+)(?:\s*\(\d+\))?\.xlsx$/iu';

        if (! preg_match($pattern, $filename, $matches)) {
            throw new InvalidArgumentException(
                'O nome do arquivo não corresponde ao formato esperado.'
            );
        }

        $year = (int) $matches[1];
        $monthName = mb_strtolower($matches[2]);

        $months = [
            'janeiro' => 1,
            'fevereiro' => 2,
            'marco' => 3,
            'abril' => 4,
            'maio' => 5,
            'junho' => 6,
            'julho' => 7,
            'agosto' => 8,
            'setembro' => 9,
            'outubro' => 10,
            'novembro' => 11,
            'dezembro' => 12,
        ];

        if (! array_key_exists($monthName, $months)) {
            throw new InvalidArgumentException(
                'O mês informado no nome do arquivo não é válido.'
            );
        }

        return [
            'year' => $year,
            'month' => $months[$monthName],
        ];
    }

    /**
     * Abre o arquivo e retorna a aba esperada do relatório.
     */
    public function loadWorksheet(string $filePath): Worksheet
    {
        $spreadsheet = IOFactory::load($filePath);

        $worksheet = $spreadsheet->getSheetByName('Posição - Renda Fixa');

        if (! $worksheet) {
            throw new RuntimeException(
                'A aba "Posição - Renda Fixa" não foi encontrada no relatório.'
            );
        }

        return $worksheet;
    }

    /**
     * Lê as posições de renda fixa da planilha.
     *
     * @return array<int, array<string, mixed>>
     */
    public function extractPositions(Worksheet $worksheet): array
    {
        $headers = $this->extractHeaders($worksheet);

        $requiredHeaders = [
            'produto',
            'instituição',
            'emissor',
            'código',
            'indexador',
            'data de emissão',
            'vencimento',
            'valor atualizado curva',
        ];

        foreach ($requiredHeaders as $header) {
            if (! array_key_exists($header, $headers)) {
                throw new RuntimeException(
                    sprintf(
                        'A coluna obrigatória "%s" não foi encontrada no relatório.',
                        $header
                    )
                );
            }
        }

        $positions = [];

        foreach ($worksheet->getRowIterator(2) as $row) {
            $rowIndex = $row->getRowIndex();

            $product = $this->getCellValue(
                $worksheet,
                $headers['produto'],
                $rowIndex
            );

            if ($this->isEmptyValue($product)) {
                continue;
            }

            if (mb_strtolower(trim((string) $product)) === 'total') {
                continue;
            }

            $positions[] = [
                'product' => $this->normalizeString($product),
                'institution' => $this->normalizeNullableString(
                    $this->getCellValue(
                        $worksheet,
                        $headers['instituição'],
                        $rowIndex
                    )
                ),
                'issuer' => $this->normalizeNullableString(
                    $this->getCellValue(
                        $worksheet,
                        $headers['emissor'],
                        $rowIndex
                    )
                ),
                'code' => $this->normalizeNullableString(
                    $this->getCellValue(
                        $worksheet,
                        $headers['código'],
                        $rowIndex
                    )
                ),
                'indexer' => $this->normalizeNullableString(
                    $this->getCellValue(
                        $worksheet,
                        $headers['indexador'],
                        $rowIndex
                    )
                ),
                'issued_at' => $this->normalizeDate(
                    $this->getCellValue(
                        $worksheet,
                        $headers['data de emissão'],
                        $rowIndex
                    )
                ),
                'maturity_date' => $this->normalizeDate(
                    $this->getCellValue(
                        $worksheet,
                        $headers['vencimento'],
                        $rowIndex
                    )
                ),
                'curve_value' => $this->normalizeMoney(
                    $this->getCellValue(
                        $worksheet,
                        $headers['valor atualizado curva'],
                        $rowIndex
                    )
                ),
            ];
        }

        return $positions;
    }

    /**
     * Mapeia os cabeçalhos da primeira linha para suas colunas.
     *
     * @return array<string, string>
     */
    private function extractHeaders(Worksheet $worksheet): array
    {
        $headers = [];

        foreach ($worksheet->getColumnIterator() as $column) {
            $columnLetter = $column->getColumnIndex();
            $value = $worksheet
                ->getCell($columnLetter.'1')
                ->getValue();

            if ($this->isEmptyValue($value)) {
                continue;
            }

            $normalizedHeader = $this->normalizeHeader((string) $value);

            $headers[$normalizedHeader] = $columnLetter;
        }

        return $headers;
    }

    private function getCellValue(
        Worksheet $worksheet,
        string $column,
        int $rowIndex
    ): mixed {
        return $worksheet
            ->getCell($column.$rowIndex)
            ->getCalculatedValue();
    }

    private function normalizeHeader(string $header): string
    {
        $header = trim($header);
        $header = mb_strtolower($header);

        return preg_replace('/\s+/', ' ', $header);
    }

    private function normalizeString(mixed $value): string
    {
        return trim((string) $value);
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }

    private function isEmptyValue(mixed $value): bool
    {
        return $value === null || trim((string) $value) === '';
    }

    private function normalizeDate(mixed $value): ?string
    {
        if ($this->isEmptyValue($value)) {
            return null;
        }

        if (is_numeric($value)) {
            $date = Date::excelToDateTimeObject(
                (float) $value
            );

            return $date->format('Y-m-d');
        }

        $value = trim((string) $value);

        $formats = [
            'd/m/Y',
            'd-m-Y',
            'Y-m-d',
        ];

        foreach ($formats as $format) {
            $date = \DateTimeImmutable::createFromFormat($format, $value);

            if ($date !== false) {
                return $date->format('Y-m-d');
            }
        }

        throw new RuntimeException(
            sprintf('Não foi possível interpretar a data "%s".', $value)
        );
    }

    private function normalizeMoney(mixed $value): string
    {
        if ($this->isEmptyValue($value)) {
            throw new RuntimeException(
                'O campo "Valor Atualizado CURVA" não pode estar vazio.'
            );
        }

        if (is_numeric($value)) {
            return number_format((float) $value, 2, '.', '');
        }

        $value = trim((string) $value);
        $value = str_replace('R$', '', $value);
        $value = str_replace(' ', '', $value);

        /*
         * Trata formatos como:
         * 1.234,56
         * 1234,56
         * 1234.56
         */
        if (str_contains($value, ',')) {
            $value = str_replace('.', '', $value);
            $value = str_replace(',', '.', $value);
        }

        if (! is_numeric($value)) {
            throw new RuntimeException(
                sprintf(
                    'Não foi possível interpretar o valor monetário "%s".',
                    $value
                )
            );
        }

        return number_format((float) $value, 2, '.', '');
    }
}
