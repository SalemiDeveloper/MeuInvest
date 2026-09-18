import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

type InvestmentImport = {
    id: number;
    reference_period: string;
    original_filename: string;
    created_at: string;
    positions_count: number;
};

type ComparedPosition = {
    code: string;
    product: string;
    institution: string | null;
    issuer: string | null;
    previous_value: string;
    current_value: string;
    variation: string;
    percentage: string | null;
    status: 'maintained';
};

type UnmatchedPosition = {
    code: string | null;
    product: string;
    institution: string | null;
    issuer: string | null;
    value: string;
    status: 'new' | 'missing';
};

type Comparison = {
    previous_period: string;
    current_period: string;
    total_previous_value: string;
    total_current_value: string;
    total_variation: string;
    total_percentage: string | null;
    compared_previous_value: string;
    compared_current_value: string;
    compared_variation: string;
    compared_percentage: string | null;
    positions: ComparedPosition[];
    new_positions: UnmatchedPosition[];
    missing_positions: UnmatchedPosition[];
};

type Errors = {
    comparison?: string;
};

type Props = {
    imports: InvestmentImport[];
    comparison?: Comparison;
    selected?: {
        previous_import_id: number;
        current_import_id: number;
    };
    errors?: {
        comparison?: string;
    };
};

function formatReferencePeriod(period: string): string {
    const [year, month] = period.slice(0, 7).split('-');

    const date = new Date(Number(year), Number(month) - 1, 1);

    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function formatCurrency(value: string | number): string {
    const numericValue =
        typeof value === 'number' ? value : Number(value);

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numericValue);
}

function formatPercentage(value: string | null): string {
    if (value === null) {
        return '—';
    }

    return `${Number(value).toFixed(2).replace('.', ',')}%`;
}

function formatVariation(value: string): string {
    const numericValue = Number(value);

    const formatted = formatCurrency(Math.abs(numericValue));

    if (numericValue > 0) {
        return `+${formatted}`;
    }

    if (numericValue < 0) {
        return `-${formatted}`;
    }

    return formatted;
}

function variationClass(value: string): string {
    const numericValue = Number(value);

    if (numericValue > 0) {
        return 'text-emerald-600 dark:text-emerald-400';
    }

    if (numericValue < 0) {
        return 'text-red-600 dark:text-red-400';
    }

    return 'text-muted-foreground';
}

function displayValue(value: string | null): string {
    return value && value.trim() !== '' ? value : '—';
}

export default function MonthlyComparison({
    imports,
    comparison,
    selected,
    errors,
}: Props) {

    const [previousImportId, setPreviousImportId] = useState(selected?.previous_import_id?.toString() ?? '',);
    const [currentImportId, setCurrentImportId] = useState(selected?.current_import_id?.toString() ?? '',);
    const [showComparison, setShowComparison] = useState(Boolean(comparison),);

    function isPreviousOption(investmentImport: InvestmentImport): boolean {
        if (!currentImportId) {
            return true;
        }

        const currentImport = imports.find((item) => item.id.toString() === currentImportId,);

        if (!currentImport) {
            return true;
        }

        return investmentImport.reference_period < currentImport.reference_period;
    }

    function isCurrentOption(investmentImport: InvestmentImport): boolean {
        if (!previousImportId) {
            return true;
        }

        const previousImport = imports.find((item) => item.id.toString() === previousImportId,);

        if (!previousImport) {
            return true;
        }

        return investmentImport.reference_period > previousImport.reference_period;
    }

    function handleCompare() {
        if (!previousImportId || !currentImportId) {
            return;
        }

        // Remove imediatamente o resultado anterior da tela.
        setShowComparison(false);

        router.get(
            '/investments/analysis/monthly/compare',
            {
                previous_import_id: previousImportId,
                current_import_id: currentImportId,
            },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setShowComparison(true);
                },
            },
        );
    }

    return (
        <>
            <Head title="Análise mensal" />

            <div className="space-y-8 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Análise mensal
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Compare a evolução dos seus investimentos entre dois
                        relatórios mensais <strong>**consecutivos**</strong>.
                    </p>
                </div>

                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="previous-import"
                                className="text-sm font-medium"
                            >
                                Relatório anterior
                            </label>

                            <select
                                id="previous-import"
                                value={previousImportId}
                                onChange={(event) =>
                                    setPreviousImportId(event.target.value)
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">
                                    Selecione o relatório anterior
                                </option>

                                {imports
                                    .filter(isPreviousOption)
                                    .map((investmentImport) => (
                                        <option
                                            key={investmentImport.id}
                                            value={investmentImport.id}
                                        >
                                            {formatReferencePeriod(
                                                investmentImport.reference_period,
                                            )}{' '}
                                            — {investmentImport.positions_count} posições
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="current-import"
                                className="text-sm font-medium"
                            >
                                Relatório atual
                            </label>

                            <select
                                id="current-import"
                                value={currentImportId}
                                onChange={(event) =>
                                    setCurrentImportId(event.target.value)
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">
                                    Selecione o relatório atual
                                </option>

                                {imports
                                    .filter(isCurrentOption)
                                    .map((investmentImport) => (
                                        <option
                                            key={investmentImport.id}
                                            value={investmentImport.id}
                                        >
                                            {formatReferencePeriod(
                                                investmentImport.reference_period,
                                            )}{' '}
                                            — {investmentImport.positions_count} posições
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCompare}
                        disabled={!previousImportId || !currentImportId}
                        className="cursor-pointer mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Comparar relatórios
                    </button>

                    {errors?.comparison && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                            {errors.comparison}
                        </p>
                    )}
                </section>

                {!showComparison && (
                    <section className="rounded-xl border border-dashed p-8 text-center">
                        <h2 className="font-medium">
                            Nenhuma comparação realizada
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Selecione dois relatórios consecutivos para visualizar a
                            evolução dos investimentos.
                        </p>
                    </section>
                )}

                {showComparison && comparison && (
                    <>
                        <section className="space-y-6">
                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Resumo patrimonial
                                </h2>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Período anterior
                                        </p>

                                        <p className="mt-2 text-xl font-semibold">
                                            {formatCurrency(comparison.total_previous_value)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Período atual
                                        </p>

                                        <p className="mt-2 text-xl font-semibold">
                                            {formatCurrency(comparison.total_current_value)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Variação
                                        </p>

                                        <p
                                            className={`mt-2 text-xl font-semibold ${variationClass(
                                                comparison.total_variation,
                                            )}`}
                                        >
                                            {formatVariation(comparison.total_variation)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Variação percentual
                                        </p>

                                        <p
                                            className={`mt-2 text-xl font-semibold ${variationClass(
                                                comparison.total_variation,
                                            )}`}
                                        >
                                            {formatPercentage(comparison.total_percentage)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Investimentos acompanhados
                                </h2>

                                <p className="mb-4 text-sm text-muted-foreground">
                                    Considera apenas os investimentos identificados nos dois
                                    relatórios, desconsiderando novas posições e posições ausentes.
                                </p>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Acompanhados no período anterior
                                        </p>

                                        <p className="mt-2 text-xl font-semibold">
                                            {formatCurrency(comparison.compared_previous_value)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Acompanhados no período atual
                                        </p>

                                        <p className="mt-2 text-xl font-semibold">
                                            {formatCurrency(comparison.compared_current_value)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Variação acompanhada
                                        </p>

                                        <p
                                            className={`mt-2 text-xl font-semibold ${variationClass(
                                                comparison.compared_variation,
                                            )}`}
                                        >
                                            {formatVariation(comparison.compared_variation)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-sm text-muted-foreground">
                                            Variação percentual acompanhada
                                        </p>

                                        <p
                                            className={`mt-2 text-xl font-semibold ${variationClass(
                                                comparison.compared_variation,
                                            )}`}
                                        >
                                            {formatPercentage(comparison.compared_percentage)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Posições mantidas
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Investimentos identificados nos dois
                                    relatórios pelo código do produto.
                                </p>
                            </div>

                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Produto
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Código
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Instituição
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Anterior
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Atual
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Variação
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                %
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {comparison.positions.map(
                                            (position) => (
                                                <tr key={position.code}>
                                                    <td className="px-4 py-3">
                                                        {position.product}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {displayValue(
                                                            position.code,
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {displayValue(
                                                            position.institution,
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        {formatCurrency(
                                                            position.previous_value,
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        {formatCurrency(
                                                            position.current_value,
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`px-4 py-3 text-right font-medium ${variationClass(
                                                            position.variation,
                                                        )}`}
                                                    >
                                                        {formatVariation(
                                                            position.variation,
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`px-4 py-3 text-right font-medium ${variationClass(
                                                            position.variation,
                                                        )}`}
                                                    >
                                                        {formatPercentage(
                                                            position.percentage,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>

                                {comparison.positions.length === 0 && (
                                    <p className="p-6 text-center text-sm text-muted-foreground">
                                        Nenhuma posição foi mantida entre os
                                        relatórios selecionados.
                                    </p>
                                )}
                            </div>
                        </section>

                        <div className="grid gap-8 xl:grid-cols-2">
                            <section className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Novas posições
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Investimentos presentes apenas no
                                        relatório atual.
                                    </p>
                                </div>

                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full min-w-[600px] text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Produto
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Código
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Instituição
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Valor
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {comparison.new_positions.map(
                                                (position, index) => (
                                                    <tr
                                                        key={`${position.code}-${index}`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            {position.product}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {displayValue(
                                                                position.code,
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {displayValue(
                                                                position.institution,
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 text-right">
                                                            {formatCurrency(
                                                                position.value,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>

                                    {comparison.new_positions.length === 0 && (
                                        <p className="p-6 text-center text-sm text-muted-foreground">
                                            Nenhuma posição nova identificada.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Posições ausentes
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Investimentos presentes no relatório
                                        anterior, mas não no atual.
                                    </p>
                                </div>

                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full min-w-[600px] text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Produto
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Código
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Instituição
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Valor
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {comparison.missing_positions.map(
                                                (position, index) => (
                                                    <tr
                                                        key={`${position.code}-${index}`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            {position.product}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {displayValue(
                                                                position.code,
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {displayValue(
                                                                position.institution,
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 text-right">
                                                            {formatCurrency(
                                                                position.value,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>

                                    {comparison.missing_positions.length ===
                                        0 && (
                                        <p className="p-6 text-center text-sm text-muted-foreground">
                                            Nenhuma posição ausente
                                            identificada.
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}