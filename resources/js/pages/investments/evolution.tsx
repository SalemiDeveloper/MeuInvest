import { Head } from '@inertiajs/react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type HistoryItem = {
    id: number;
    reference_period: string;
    total_value: string;
};

type ChartItem = {
    id: number;
    reference_period: string;
    period_label: string;
    total_value: number;
};

type TableItem = ChartItem & {
    difference: number | null;
    percentage_change: number | null;
};

type Props = {
    history: HistoryItem[];
};

type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{
        value?: number;
        payload?: ChartItem;
    }>;
    label?: string;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const item = payload[0];
    const value = Number(item.value ?? 0);
    const chartItem = item.payload;

    return (
        <div className="bg-background rounded-lg border px-4 py-3 shadow-md">
            <p className="text-sm font-medium">{chartItem?.period_label}</p>

            <p className="text-muted-foreground mt-1 text-sm">
                Valor total:{' '}
                <span className="text-foreground font-semibold">
                    {formatCurrency(value)}
                </span>
            </p>
        </div>
    );
}

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value));
}

function formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        maximumFractionDigits: 1,
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function formatPercentage(value: number | null): string {
    if (value === null) {
        return '—';
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatReferencePeriod(value: string): string {
    const [year, month] = value.slice(0, 7).split('-');

    const date = new Date(Number(year), Number(month) - 1, 1);

    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function formatShortPeriod(value: string): string {
    const [year, month] = value.slice(0, 7).split('-');

    const date = new Date(Number(year), Number(month) - 1, 1);

    return new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatDifference(value: number | null): string {
    if (value === null) {
        return '—';
    }

    const prefix = value > 0 ? '+' : '';

    return `${prefix}${formatCurrency(value)}`;
}

export default function Evolution({ history }: Props) {
    const chartData: ChartItem[] = history.map((item) => ({
        id: item.id,
        reference_period: item.reference_period,
        period_label: formatShortPeriod(item.reference_period),
        total_value: Number(item.total_value),
    }));

    const tableData: TableItem[] = chartData.map((item, index) => {
        if (index === 0) {
            return {
                ...item,
                difference: null,
                percentage_change: null,
            };
        }

        const previousItem = chartData[index - 1];
        const difference = item.total_value - previousItem.total_value;

        const percentageChange =
            previousItem.total_value > 0
                ? difference / previousItem.total_value
                : null;

        return {
            ...item,
            difference,
            percentage_change: percentageChange,
        };
    });

    const firstValue = chartData[0]?.total_value ?? 0;
    const latestValue = chartData[chartData.length - 1]?.total_value ?? 0;

    const absoluteGrowth = latestValue - firstValue;

    const percentageGrowth =
        firstValue > 0 ? absoluteGrowth / firstValue : null;

    const highestValue =
        chartData.length > 0
            ? Math.max(...chartData.map((item) => item.total_value))
            : 0;

    return (
        <>
            <Head title="Evolução da carteira" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Evolução da carteira
                    </h1>

                    <p className="text-muted-foreground mt-1 text-sm">
                        Acompanhe a evolução do valor total registrado nos seus
                        relatórios mensais.
                    </p>
                </div>

                {chartData.length === 0 ? (
                    <div className="rounded-xl border p-6">
                        <h2 className="font-semibold">
                            Nenhum dado disponível
                        </h2>

                        <p className="text-muted-foreground mt-2 text-sm">
                            Importe pelo menos um relatório para visualizar a
                            evolução da sua carteira.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border p-5">
                                <p className="text-muted-foreground text-sm">
                                    Patrimônio atual
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatCurrency(latestValue)}
                                </p>

                                <p className="text-muted-foreground mt-1 text-xs">
                                    {formatReferencePeriod(
                                        chartData[chartData.length - 1]
                                            .reference_period,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border p-5">
                                <p className="text-muted-foreground text-sm">
                                    Primeiro registro
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatCurrency(firstValue)}
                                </p>

                                <p className="text-muted-foreground mt-1 text-xs">
                                    {formatReferencePeriod(
                                        chartData[0].reference_period,
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border p-5">
                                <p className="text-muted-foreground text-sm">
                                    Crescimento no período
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatDifference(absoluteGrowth)}
                                </p>

                                <p className="text-muted-foreground mt-1 text-xs">
                                    Diferença entre o primeiro e o último
                                    registro
                                </p>
                            </div>

                            <div className="rounded-xl border p-5">
                                <p className="text-muted-foreground text-sm">
                                    Maior patrimônio registrado
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {formatCurrency(highestValue)}
                                </p>

                                <p className="text-muted-foreground mt-1 text-xs">
                                    Variação acumulada:{' '}
                                    {formatPercentage(percentageGrowth)}
                                </p>
                            </div>
                        </div>

                        <section className="rounded-xl border p-4 sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">
                                    Histórico do patrimônio
                                </h2>

                                <p className="text-muted-foreground mt-1 text-sm">
                                    Valor total CURVA registrado em cada
                                    relatório importado.
                                </p>
                            </div>

                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chartData}
                                        margin={{
                                            top: 8,
                                            right: 16,
                                            left: 8,
                                            bottom: 8,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis
                                            dataKey="period_label"
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={
                                                formatCompactCurrency
                                            }
                                            width={90}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Line
                                            type="monotone"
                                            dataKey="total_value"
                                            name="Valor total"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Histórico detalhado
                                </h2>

                                <p className="text-muted-foreground mt-1 text-sm">
                                    Consulte os valores registrados e sua
                                    diferença em relação ao relatório anterior.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-xl border">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">
                                                    Período
                                                </th>

                                                <th className="px-4 py-3 text-right font-medium">
                                                    Valor total CURVA
                                                </th>

                                                <th className="px-4 py-3 text-right font-medium">
                                                    Diferença
                                                </th>

                                                <th className="px-4 py-3 text-right font-medium">
                                                    Variação
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {tableData.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 capitalize">
                                                        {formatReferencePeriod(
                                                            item.reference_period,
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatCurrency(
                                                            item.total_value,
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`px-4 py-3 text-right ${
                                                            item.difference !==
                                                                null &&
                                                            item.difference < 0
                                                                ? 'text-destructive'
                                                                : ''
                                                        }`}
                                                    >
                                                        {formatDifference(
                                                            item.difference,
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`px-4 py-3 text-right ${
                                                            item.percentage_change !==
                                                                null &&
                                                            item.percentage_change <
                                                                0
                                                                ? 'text-destructive'
                                                                : ''
                                                        }`}
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
                            </div>
                        </section>

                        <p className="text-muted-foreground text-xs">
                            * Os valores apresentados representam o patrimônio
                            registrado nos relatórios importados. As variações
                            podem ser influenciadas por novas aplicações,
                            resgates, vencimentos e alterações no valor dos
                            investimentos.
                        </p>
                    </>
                )}
            </div>
        </>
    );
}
