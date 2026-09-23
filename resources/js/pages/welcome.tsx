import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    FileSpreadsheet,
    LineChart,
} from 'lucide-react';

import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="MeuInvest" />

            <div className="bg-background text-foreground min-h-screen">
                {/* Header */}
                <header className="border-border/60 border-b">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
                        >
                            <img
                                src="/meuinvest-logo.png"
                                alt="MeuInvest"
                                className="size-8 object-contain"
                            />
                            <span>MeuInvest</span>
                        </Link>

                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="border-border hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                    >
                                        Entrar
                                    </Link>

                                    <Link
                                        href={register()}
                                        className="bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                                    >
                                        Criar conta
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <main>
                    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-6 py-20 lg:px-8">
                        <div className="max-w-3xl">
                            <p className="text-muted-foreground mb-5 text-sm font-medium">
                                Controle seus investimentos
                            </p>

                            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Seus investimentos,
                                <br />
                                <span className="text-muted-foreground">
                                    organizados em um só lugar.
                                </span>
                            </h1>

                            <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-7 sm:text-lg">
                                O MeuInvest permite importar seus relatórios
                                mensais da B3 e acompanhar, de forma simples, a
                                evolução dos seus investimentos de renda fixa.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={auth.user ? dashboard() : login()}
                                    className="bg-foreground text-background inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                                >
                                    {auth.user
                                        ? 'Acessar dashboard'
                                        : 'Começar agora'}
                                    <ArrowRight className="size-4" />
                                </Link>

                                {!auth.user && (
                                    <Link
                                        href={register()}
                                        className="border-border hover:bg-muted inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
                                    >
                                        Criar conta
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="border-border/60 mt-24 border-t pt-10">
                            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight">
                                        Como funciona
                                    </h2>

                                    <p className="text-muted-foreground mt-2 text-sm">
                                        Um fluxo simples para acompanhar seus
                                        investimentos ao longo do tempo.
                                    </p>
                                </div>

                                <Link
                                    href="/instructions"
                                    className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
                                >
                                    Ver guia completo
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>

                            <div className="grid gap-8 md:grid-cols-3">
                                <div className="flex gap-4">
                                    <div className="border-border bg-muted/40 flex size-10 shrink-0 items-center justify-center rounded-lg border">
                                        <FileSpreadsheet className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            Importe
                                        </p>

                                        <p className="text-muted-foreground mt-1 text-sm leading-6">
                                            Importe seus relatórios mensais da
                                            B3 para registrar suas posições.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="border-border bg-muted/40 flex size-10 shrink-0 items-center justify-center rounded-lg border">
                                        <BarChart3 className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            Analise
                                        </p>

                                        <p className="text-muted-foreground mt-1 text-sm leading-6">
                                            Consulte seus investimentos e
                                            acompanhe seus valores mês a mês.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="border-border bg-muted/40 flex size-10 shrink-0 items-center justify-center rounded-lg border">
                                        <LineChart className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            Acompanhe
                                        </p>

                                        <p className="text-muted-foreground mt-1 text-sm leading-6">
                                            Visualize a evolução do seu
                                            patrimônio ao longo do tempo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
