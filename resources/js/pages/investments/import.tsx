import { ChangeEvent, useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FileSpreadsheet, Upload } from 'lucide-react';

type ImportResult = {
    filename: string;
    success: boolean;
    message: string;
    positions_count: number;
};

export default function Import() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { import_results } = usePage<{
        import_results?: ImportResult[];
    }>().props;

    const { setData, post, processing, errors } = useForm<{
        files: File[];
    }>({
        files: [],
    });

    useEffect(() => {
        if (import_results) {
            setSelectedFiles([]);
            setData('files', []);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [import_results, setData]);

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);

        setError(null);
        setSelectedFiles([]);
        setData('files', []);

        if (files.length === 0) {
            return;
        }

        const invalidFile = files.find((file) => {
            const isXlsx =
                file.name.toLowerCase().endsWith('.xlsx') ||
                file.type ===
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            return !isXlsx;
        });

        if (invalidFile) {
            setError(
                `O arquivo "${invalidFile.name}" não está no formato .xlsx.`,
            );

            return;
        }

        setSelectedFiles(files);
        setData('files', files);
    }

    function handleSubmit() {
        post('/investments/import', {
            forceFormData: true,
        });
    }

    return (
        <>
            <Head title="Importar relatório" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Importar relatório
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        Importe um relatório mensal da B3 para atualizar seu
                        histórico de investimentos.
                    </p>
                </div>

                {import_results && import_results.length > 0 && (
                    <div className="max-w-3xl space-y-3">
                        <h2 className="text-sm font-medium">
                            Resultado da importação
                        </h2>

                        {import_results.map((result) => (
                            <div
                                key={result.filename}
                                className={
                                    result.success
                                        ? 'rounded-lg border border-green-500/30 bg-green-500/10 p-4'
                                        : 'border-destructive/30 bg-destructive/10 rounded-lg border p-4'
                                }
                            >
                                <p
                                    className={
                                        result.success
                                            ? 'text-sm font-medium text-green-700 dark:text-green-400'
                                            : 'text-destructive text-sm font-medium'
                                    }
                                >
                                    {result.success ? '✓ ' : '✕ '}
                                    {result.filename}
                                </p>

                                <p
                                    className={
                                        result.success
                                            ? 'mt-1 text-sm text-green-700/80 dark:text-green-400/80'
                                            : 'text-destructive/80 mt-1 text-sm'
                                    }
                                >
                                    {result.message}
                                </p>

                                {result.success && (
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {result.positions_count}{' '}
                                        {result.positions_count === 1
                                            ? 'posição processada.'
                                            : 'posições processadas.'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-sidebar-border/70 dark:border-sidebar-border max-w-3xl rounded-xl border p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                            <FileSpreadsheet className="size-5" />
                        </div>

                        <div>
                            <h2 className="font-medium">
                                Selecionar relatório
                            </h2>

                            <p className="text-muted-foreground mt-1 text-sm">
                                Selecione um arquivo mensal disponibilizado pela
                                B3 no formato Excel.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label
                            htmlFor="report-file"
                            className="border-sidebar-border/70 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors"
                        >
                            <Upload className="text-muted-foreground mb-3 size-8" />

                            <span className="font-medium">
                                Clique para selecionar os arquivos
                            </span>

                            <span className="text-muted-foreground mt-1 text-sm">
                                Apenas arquivos .xlsx
                            </span>

                            <input
                                ref={fileInputRef}
                                id="report-file"
                                type="file"
                                multiple
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="bg-muted/50 mt-4 rounded-lg p-4">
                            <p className="text-sm font-medium">
                                Arquivos selecionados ({selectedFiles.length})
                            </p>

                            <div className="mt-3 space-y-2">
                                {selectedFiles.map((file) => (
                                    <div
                                        key={`${file.name}-${file.size}-${file.lastModified}`}
                                        className="border-border/60 bg-background flex items-center justify-between gap-4 rounded-md border px-3 py-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm break-all">
                                                {file.name}
                                            </p>

                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{' '}
                                                MB
                                            </p>
                                        </div>

                                        <FileSpreadsheet className="text-muted-foreground size-4 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="text-destructive mt-4 text-sm">{error}</p>
                    )}

                    {errors.files && (
                        <p className="text-destructive mt-4 text-sm">
                            {errors.files}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            disabled={selectedFiles.length === 0 || processing}
                            onClick={handleSubmit}
                            className="bg-primary text-primary-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Upload className="size-4" />
                            {processing
                                ? 'Importando...'
                                : 'Importar relatórios'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
