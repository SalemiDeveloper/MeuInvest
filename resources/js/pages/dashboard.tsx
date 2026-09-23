import { Head, Link } from '@inertiajs/react';

type InvestmentPosition = {
    id: number;
    product: string;
    institution: string | null;
    issuer: string | null;
    code: string | null;
    maturity_date: string | null;
    curve_value: string;
};

type LatestImport = {
    id: number;
    reference_period: string;
    original_filename: string;
    positions: InvestmentPosition[];
} | null;

type Summary = {
    has_import: boolean;
    reference_period: string | null;
    total_value: string;
    positions_count: number;
    institutions_count: number;
};

type Props = {
    summary: Summary;
    latest_import: LatestImport;
};

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value));
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const [year, month, day] = value.slice(0, 10).split('-');

    return `${day}/${month}/${year}`;
}

function formatReferencePeriod(value: string | null): string {
    if (!value) {
        return '—';
    }

    const [year, month] = value.slice(0, 7).split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);

    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export default function Dashboard({ summary, latest_import }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-8 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>

                    <p className="text-muted-foreground mt-2 text-sm">
                        Acompanhe um resumo dos seus investimentos a partir do
                        último relatório importado.
                    </p>
                </div>

                {!summary.has_import ? (
                    <section className="rounded-xl border border-dashed p-8 text-center">
                        <h2 className="font-medium">
                            Nenhum relatório importado
                        </h2>

                        <p className="text-muted-foreground mt-2 text-sm">
                            Importe seu primeiro relatório da B3 para visualizar
                            seus investimentos aqui.
                        </p>

                        <Link
                            href="/investments/import"
                            className="bg-primary text-primary-foreground mt-5 inline-flex rounded-md px-4 py-2 text-sm font-medium"
                        >
                            Importar relatório
                        </Link>
                    </section>
                ) : (
                    <>
                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">
                                    Visão geral
                                </h2>

                                <p className="text-muted-foreground mt-1 text-sm">
                                    Dados referentes ao relatório de{' '}
                                    {formatReferencePeriod(
                                        summary.reference_period,
                                    )}
                                    .
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="bg-card rounded-xl border p-5">
                                    <p className="text-muted-foreground text-sm">
                                        Patrimônio atualizado
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold">
                                        {formatCurrency(summary.total_value)}
                                    </p>
                                </div>

                                <div className="bg-card rounded-xl border p-5">
                                    <p className="text-muted-foreground text-sm">
                                        Investimentos
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold">
                                        {summary.positions_count}
                                    </p>
                                </div>

                                <div className="bg-card rounded-xl border p-5">
                                    <p className="text-muted-foreground text-sm">
                                        Instituições
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold">
                                        {summary.institutions_count}
                                    </p>
                                </div>

                                <div className="bg-card rounded-xl border p-5">
                                    <p className="text-muted-foreground text-sm">
                                        Último relatório
                                    </p>

                                    <p className="mt-2 text-lg font-semibold capitalize">
                                        {formatReferencePeriod(
                                            summary.reference_period,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-card rounded-xl border p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="font-semibold">
                                        Continue acompanhando seus investimentos
                                    </h2>

                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Importe um novo relatório mensal ou
                                        compare períodos anteriores.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/investments/import"
                                        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
                                    >
                                        Importar relatório
                                    </Link>

                                    <Link
                                        href="/investments/analysis/monthly"
                                        className="rounded-md border px-4 py-2 text-sm font-medium"
                                    >
                                        Análise mensal
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Investimentos do último relatório
                                </h2>

                                {latest_import && (
                                    <p className="text-muted-foreground text-sm">
                                        Relatório de{' '}
                                        {formatReferencePeriod(
                                            latest_import.reference_period,
                                        )}
                                    </p>
                                )}
                            </div>

                            {!latest_import ? (
                                <div className="text-muted-foreground rounded-xl border p-6 text-sm">
                                    Nenhum relatório foi importado ainda.
                                </div>
                            ) : latest_import.positions.length === 0 ? (
                                <div className="text-muted-foreground rounded-xl border p-6 text-sm">
                                    O último relatório não possui investimentos
                                    registrados.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-xl border">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium">
                                                        Investimento
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium">
                                                        Instituição
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium">
                                                        Vencimento
                                                    </th>
                                                    <th className="px-4 py-3 text-right font-medium">
                                                        Valor CURVA
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y">
                                                {latest_import.positions.map(
                                                    (position) => (
                                                        <tr key={position.id}>
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">
                                                                    {
                                                                        position.product
                                                                    }
                                                                </div>

                                                                {position.code && (
                                                                    <div className="text-muted-foreground text-xs">
                                                                        Código:{' '}
                                                                        {
                                                                            position.code
                                                                        }
                                                                    </div>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {position.institution ??
                                                                    '—'}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                {formatDate(
                                                                    position.maturity_date,
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-right font-medium">
                                                                {formatCurrency(
                                                                    position.curve_value,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </>
    );
}
