import { ChangeEvent, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FileSpreadsheet, Upload } from 'lucide-react';

export default function Import() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { flash } = usePage<{
        flash: {
            success?: string;
        };
    }>().props;

    const { setData, post, processing, errors } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        setError(null);
        setSelectedFile(null);

        if (!file) {
            return;
        }

        const isXlsx =
            file.name.toLowerCase().endsWith('.xlsx') ||
            file.type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        if (!isXlsx) {
            setError('Selecione um arquivo no formato .xlsx.');
            return;
        }

        setSelectedFile(file);
        setData('file', file);
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

                    <p className="mt-2 text-muted-foreground">
                        Importe um relatório mensal da B3 para atualizar seu
                        histórico de investimentos.
                    </p>
                </div>

                {flash.success && (
                    <div className="max-w-3xl rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <div className="max-w-3xl rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <FileSpreadsheet className="size-5" />
                        </div>

                        <div>
                            <h2 className="font-medium">
                                Selecionar relatório
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Selecione um arquivo mensal disponibilizado
                                pela B3 no formato Excel.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label
                            htmlFor="report-file"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-sidebar-border/70 px-6 py-10 text-center transition-colors hover:bg-muted/50"
                        >
                            <Upload className="mb-3 size-8 text-muted-foreground" />

                            <span className="font-medium">
                                Clique para selecionar um arquivo
                            </span>

                            <span className="mt-1 text-sm text-muted-foreground">
                                Apenas arquivos .xlsx
                            </span>

                            <input
                                id="report-file"
                                type="file"
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {selectedFile && (
                        <div className="mt-4 rounded-lg bg-muted/50 p-4">
                            <p className="text-sm font-medium">
                                Arquivo selecionado
                            </p>

                            <p className="mt-1 break-all text-sm text-muted-foreground">
                                {selectedFile.name}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
                                MB
                            </p>
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    {errors.file && (
                        <p className="mt-4 text-sm text-destructive">
                            {errors.file}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            disabled={!selectedFile || processing}
                            onClick={handleSubmit}
                            className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Upload className="size-4" />
                            {processing ? 'Enviando...' : 'Importar relatório'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}