import { Head, router } from '@inertiajs/react';
import { FileText, Trash2 } from 'lucide-react';

type InvestmentImport = {
    id: number;
    reference_period: string;
    original_filename: string;
    created_at: string;
    positions_count: number;
};

type Props = {
    imports: InvestmentImport[];
};

function formatReferencePeriod(value: string): string {
    const [year, month] = value.slice(0, 7).split('-');

    const date = new Date(Number(year), Number(month) - 1, 1);

    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export default function Reports({ imports }: Props) {

    function handleDelete(investmentImport: InvestmentImport) {
        const confirmed = window.confirm(
            `Deseja realmente excluir o relatório de ${formatReferencePeriod(
                investmentImport.reference_period,
            )}? Esta ação não pode ser desfeita.`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(`/investments/reports/${investmentImport.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Relatórios" />

            <div className="flex min-w-0 w-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Relatórios
                    </h1>

                    <p className="text-muted-foreground">
                        Consulte os relatórios mensais importados.
                    </p>
                </div>

                {imports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
                        <FileText className="mb-4 size-10 text-muted-foreground" />

                        <h2 className="text-lg font-medium">
                            Nenhum relatório importado
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Importe seu primeiro relatório mensal para começar.
                        </p>
                    </div>
                ) : (
                    <div className="min-w-0 w-full overflow-hidden rounded-xl border">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Período
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Arquivo
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Posições
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Importado em
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {imports.map((investmentImport) => (
                                        <tr
                                            key={investmentImport.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                {formatReferencePeriod(
                                                    investmentImport.reference_period,
                                                )}
                                            </td>

                                            <td className="max-w-[320px] px-4 py-3">
                                                <span className="block truncate">
                                                    {investmentImport.original_filename}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                {investmentImport.positions_count}
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatDate(
                                                    investmentImport.created_at,
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(investmentImport)}
                                                    className="cursor-pointer inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                                                >
                                                    <Trash2 className="size-4" />
                                                    <span>Excluir</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}