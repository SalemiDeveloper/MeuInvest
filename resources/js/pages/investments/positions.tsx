import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type InvestmentOption = {
    id: number;
    product: string;
    institution: string | null;
    issuer: string | null;
    code: string | null;
    maturity_date: string | null;
};

type SelectedInvestment = {
    product: string;
    institution: string | null;
    issuer: string | null;
    code: string | null;
    indexer: string | null;
    issued_at: string | null;
    maturity_date: string | null;
} | null;

type HistoryItem = {
    reference_period: string;
    value: string;
    difference: string | null;
    percentage_change: string | null;
};

type Summary = {
    first_value: string | null;
    latest_value: string | null;
    total_difference: string | null;
    total_percentage_change: string | null;
    first_period: string | null;
    latest_period: string | null;
} | null;

type Props = {
    investments: InvestmentOption[];
    selectedInvestment: SelectedInvestment;
    history: HistoryItem[];
    selectedId: number | null;
    summary: Summary;
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'Não informado';
    }

    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return value;
    }

    return `${day}/${month}/${year}`;
}

function formatCurrency(value: string | number | null): string {
    if (value === null || value === undefined || value === '') {
        return 'Não informado';
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value));
}

function formatPercentage(value: string | null): string {
    if (value === null) {
        return '—';
    }

    const number = Number(value);

    return `${number >= 0 ? '+' : ''}${number.toFixed(2).replace('.', ',')}%`;
}

function formatDifference(value: string | null): string {
    if (value === null) {
        return '—';
    }

    const number = Number(value);

    return `${number >= 0 ? '+' : ''}${formatCurrency(number)}`;
}

function formatReferencePeriod(value: string | null): string {
    if (!value) {
        return 'Não informado';
    }

    const [year, month] = value.split('-');

    if (!year || !month) {
        return value;
    }

    const date = new Date(Number(year), Number(month) - 1, 1);

    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function getVariationClass(value: string | null): string {
    if (value === null) {
        return 'text-muted-foreground';
    }

    const number = Number(value);

    if (number > 0) {
        return 'text-green-600 dark:text-green-400';
    }

    if (number < 0) {
        return 'text-red-600 dark:text-red-400';
    }

    return 'text-muted-foreground';
}

type InvestmentComboboxProps = {
    investments: InvestmentOption[];
    selectedId: number | null;
    onSelect: (investmentId: number | null) => void;
};

function InvestmentCombobox({
    investments,
    selectedId,
    onSelect,
}: InvestmentComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedInvestment = investments.find(
        (investment) => investment.id === selectedId,
    );

    const filteredInvestments = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return investments;
        }

        return investments.filter((investment) => {
            const searchableText = [
                investment.product,
                investment.institution ?? '',
                investment.code ?? '',
                investment.issuer ?? '',
                investment.maturity_date ?? '',
            ]
                .join(' ')
                .toLowerCase();

            return searchableText.includes(normalizedSearch);
        });
    }, [investments, search]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function handleSelect(investmentId: number) {
        setOpen(false);
        setSearch('');
        onSelect(investmentId);
    }

    function handleClear() {
        setOpen(false);
        setSearch('');
        onSelect(null);
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="border-input bg-background hover:bg-accent flex min-h-14 w-full items-center justify-between rounded-md border px-3 py-2 text-left shadow-sm transition-colors"
            >
                {selectedInvestment ? (
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                            {selectedInvestment.product}
                        </span>

                        <span className="text-muted-foreground mt-1 block truncate text-xs">
                            {selectedInvestment.institution ??
                                'Instituição não informada'}
                        </span>
                    </span>
                ) : (
                    <span className="text-muted-foreground text-sm">
                        Selecione um investimento
                    </span>
                )}

                <span className="text-muted-foreground ml-3 text-xs">▼</span>
            </button>

            {open && (
                <div className="border-border bg-popover text-popover-foreground absolute z-50 mt-2 w-full overflow-hidden rounded-md border shadow-lg">
                    <div className="border-b p-2">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Pesquisar investimento..."
                            autoFocus
                            className="border-input bg-background focus:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2"
                        />
                    </div>

                    <div className="max-h-80 overflow-y-auto p-1">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-3 py-2 text-left text-sm"
                        >
                            Limpar seleção
                        </button>

                        {filteredInvestments.length === 0 ? (
                            <p className="text-muted-foreground px-3 py-4 text-center text-sm">
                                Nenhum investimento encontrado.
                            </p>
                        ) : (
                            filteredInvestments.map((investment) => {
                                return (
                                    <button
                                        key={investment.id}
                                        type="button"
                                        onClick={() =>
                                            handleSelect(investment.id)
                                        }
                                        className={`hover:bg-accent hover:text-accent-foreground w-full cursor-pointer rounded-sm px-3 py-2 text-left transition-colors ${
                                            investment.id === selectedId
                                                ? 'bg-accent'
                                                : ''
                                        }`}
                                    >
                                        <span className="block truncate text-sm font-medium">
                                            {investment.product}
                                        </span>

                                        <span className="text-muted-foreground mt-1 block truncate text-xs">
                                            {investment.institution ??
                                                'Instituição não informada'}
                                        </span>

                                        <span className="text-muted-foreground mt-1 block truncate text-xs">
                                            {investment.maturity_date
                                                ? `Vencimento: ${formatDate(investment.maturity_date)}`
                                                : 'Sem vencimento'}
                                            {investment.code
                                                ? ` · Código: ${investment.code}`
                                                : ''}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Positions({
    investments,
    selectedInvestment,
    history,
    selectedId,
    summary,
}: Props) {
    const chartData = history.map((item) => ({
        period: formatReferencePeriod(item.reference_period),
        periodShort: item.reference_period.slice(0, 7),
        value: Number(item.value),
    }));

    const tableData = [...history].reverse();

    return (
        <>
            <Head title="Histórico do investimento" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Histórico do investimento
                    </h1>

                    <p className="text-muted-foreground mt-1 text-sm">
                        Selecione um investimento para acompanhar seus valores
                        nos relatórios importados.
                    </p>
                </div>

                <div className="max-w-3xl space-y-2">
                    <label className="text-sm font-medium">Investimento</label>

                    <InvestmentCombobox
                        investments={investments}
                        selectedId={selectedId}
                        onSelect={(investmentId) => {
                            if (!investmentId) {
                                router.get('/investments/analysis/positions');
                                return;
                            }

                            router.get('/investments/analysis/positions', {
                                investment: investmentId,
                            });
                        }}
                    />

                    {investments.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                            Nenhum investimento foi encontrado. Importe um
                            relatório para começar.
                        </p>
                    )}
                </div>

                {!selectedInvestment && investments.length > 0 && (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <h2 className="font-medium">
                            Selecione um investimento
                        </h2>

                        <p className="text-muted-foreground mt-1 text-sm">
                            Escolha uma posição acima para visualizar seus
                            detalhes e histórico.
                        </p>
                    </div>
                )}

                {selectedInvestment && (
                    <>
                        <section className="bg-card text-card-foreground max-w-4xl rounded-xl border p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold">
                                    Informações do investimento
                                </h2>

                                <p className="text-muted-foreground mt-1 text-sm">
                                    Dados registrados no relatório mais recente.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Produto
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedInvestment.product}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Instituição
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedInvestment.institution ??
                                            'Não informado'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Emissor
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedInvestment.issuer ??
                                            'Não informado'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Código
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedInvestment.code ??
                                            'Não informado'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Indexador
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {selectedInvestment.indexer ??
                                            'Não informado'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Data de emissão
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {formatDate(
                                            selectedInvestment.issued_at,
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Vencimento
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {formatDate(
                                            selectedInvestment.maturity_date,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {summary && (
                            <section className="grid gap-4 md:grid-cols-3">
                                <div className="bg-card rounded-xl border p-5 shadow-sm">
                                    <p className="text-muted-foreground text-sm">
                                        Primeiro valor registrado
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold">
                                        {formatCurrency(summary.first_value)}
                                    </p>

                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {formatReferencePeriod(
                                            summary.first_period,
                                        )}
                                    </p>
                                </div>

                                <div className="bg-card rounded-xl border p-5 shadow-sm">
                                    <p className="text-muted-foreground text-sm">
                                        Valor mais recente
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold">
                                        {formatCurrency(summary.latest_value)}
                                    </p>

                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {formatReferencePeriod(
                                            summary.latest_period,
                                        )}
                                    </p>
                                </div>

                                <div className="bg-card rounded-xl border p-5 shadow-sm">
                                    <p className="text-m+uted-foreground text-sm">
                                        Variação desde o primeiro registro
                                    </p>

                                    <p
                                        className={`mt-2 text-2xl font-semibold ${getVariationClass(summary.total_difference)}`}
                                    >
                                        {formatDifference(
                                            summary.total_difference,
                                        )}
                                    </p>

                                    <p
                                        className={`mt-1 text-xs font-medium ${getVariationClass(summary.total_difference)}`}
                                    >
                                        {formatPercentage(
                                            summary.total_percentage_change,
                                        )}
                                    </p>
                                </div>
                            </section>
                        )}

                        {history.length > 0 && (
                            <>
                                <section className="bg-card rounded-xl border p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold">
                                            Evolução do valor
                                        </h2>

                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Histórico do Valor Atualizado CURVA
                                            nos relatórios encontrados.
                                        </p>
                                    </div>

                                    <div className="h-80 w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <LineChart
                                                data={chartData}
                                                margin={{
                                                    top: 10,
                                                    right: 20,
                                                    left: 10,
                                                    bottom: 10,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />

                                                <XAxis
                                                    dataKey="periodShort"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />

                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) =>
                                                        formatCurrency(value)
                                                    }
                                                />

                                                <Tooltip
                                                    content={({
                                                        active,
                                                        payload,
                                                    }) => {
                                                        if (
                                                            !active ||
                                                            !payload ||
                                                            payload.length === 0
                                                        ) {
                                                            return null;
                                                        }

                                                        const value = Number(
                                                            payload[0].value ??
                                                                0,
                                                        );
                                                        const data = payload[0]
                                                            .payload as {
                                                            period: string;
                                                            value: number;
                                                        };

                                                        return (
                                                            <div className="bg-background rounded-lg border px-4 py-3 shadow-md">
                                                                <p className="text-sm font-medium">
                                                                    {
                                                                        data.period
                                                                    }
                                                                </p>

                                                                <p className="text-muted-foreground mt-1 text-sm">
                                                                    Valor total:{' '}
                                                                    <span className="text-foreground font-semibold">
                                                                        {formatCurrency(
                                                                            value,
                                                                        )}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        );
                                                    }}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    name="Valor CURVA"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </section>

                                <section className="bg-card rounded-xl border shadow-sm">
                                    <div className="border-b p-6">
                                        <h2 className="text-lg font-semibold">
                                            Histórico de valores
                                        </h2>

                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Valores registrados em cada
                                            relatório importado.
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-muted-foreground border-b text-left">
                                                    <th className="px-6 py-4 font-medium">
                                                        Período
                                                    </th>

                                                    <th className="px-6 py-4 text-right font-medium">
                                                        Valor CURVA
                                                    </th>

                                                    <th className="px-6 py-4 text-right font-medium">
                                                        Variação
                                                    </th>

                                                    <th className="px-6 py-4 text-right font-medium">
                                                        Variação %
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {tableData.map((item) => (
                                                    <tr
                                                        key={
                                                            item.reference_period
                                                        }
                                                        className="border-b last:border-0"
                                                    >
                                                        <td className="px-6 py-4 font-medium">
                                                            {formatReferencePeriod(
                                                                item.reference_period,
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            {formatCurrency(
                                                                item.value,
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`px-6 py-4 text-right font-medium ${getVariationClass(item.difference)}`}
                                                        >
                                                            {formatDifference(
                                                                item.difference,
                                                            )}
                                                        </td>

                                                        <td
                                                            className={`px-6 py-4 text-right font-medium ${getVariationClass(item.percentage_change)}`}
                                                        >
                                                            {formatPercentage(
                                                                item.percentage_change,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <p className="text-muted-foreground text-xs">
                                    Os valores e as variações são baseados no
                                    campo Valor Atualizado CURVA dos relatórios
                                    importados. Eles não representam
                                    necessariamente a rentabilidade líquida do
                                    investimento.
                                </p>
                            </>
                        )}

                        {history.length === 0 && (
                            <div className="rounded-xl border border-dashed p-8 text-center">
                                <h2 className="font-medium">
                                    Histórico não encontrado
                                </h2>

                                <p className="text-muted-foreground mt-1 text-sm">
                                    Não foi possível localizar esse investimento
                                    nos relatórios disponíveis.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
