import { Head } from '@inertiajs/react';
import {
    Download,
    Files,
    FileSpreadsheet,
    FileText,
    Landmark,
    LineChart,
    Upload,
    Globe,
    UserRound,
    LogIn,
    FileUp,
} from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Acesse o site da B3',
        description:
            'O primeiro passo é entrar no site da B3 e procurar a Área do Investidor.',
        icon: Globe,
        image: '/images/instructions/01.png',
        imageAlt: 'Tela inicial da B3.',
    },
    {
        number: '02',
        title: 'Acesse a Área do Investidor',
        description:
            'Segundo passo é acessar a tela para fazer Login na Área do Investidor.',
        icon: UserRound,
        image: '/images/instructions/02.png',
        imageAlt: 'Acessando Área do Investidor na B3.',
    },
    {
        number: '03',
        title: 'Preencha seus dados.',
        description:
            'Se for primeiro acesso, clique em "Primeiro acesso" e siga as etapas. Caso não seja, prossiga com o Login.',
        icon: LogIn,
        image: '/images/instructions/03.png',
        imageAlt: 'Entrando na conta da B3.',
    },
    {
        number: '04',
        title: 'Acessando "Relatórios".',
        description:
            'No menu lateral (PC) ou no Menu (mobile) escolha a opção "Relatórios".',
        icon: FileText,
        image: '/images/instructions/04.png',
        imageAlt: 'Acessando a parte de relatórios no site da B3.',
    },
    {
        number: '05',
        title: 'Exportando corretamente.',
        description:
            'Para exportar o relatório de forma correta, selecione "Mensal" e "Arquivo em Excel".',
        icon: FileSpreadsheet,
        image: '/images/instructions/05.png',
        imageAlt:
            'Selecionando a forma correta para exportar os relatórios para que a aplicação MeuInvest consiga trabalhar em cima dos relatórios.',
    },
    {
        number: '06',
        title: 'Importação.',
        description:
            'Selecione o mês e ano desejado e clique em "Baixar relatório". É recomendado, para uma boa experiência, exportar os últimos 6 meses.',
        icon: Download,
        image: '/images/instructions/06.png',
        imageAlt: 'Exportando os relatórios no site da B3.',
    },
    {
        number: '07',
        title: 'Acesse o MeuInvest.',
        description: 'Entre na sua conta no MeuInvest.',
        icon: Landmark,
        image: '/images/instructions/07.png',
        imageAlt: 'Entrando na conta no MeuInvest.',
    },
    {
        number: '08',
        title: 'Acesse a página de importação.',
        description: 'Selecione a opção "Importar relatórios.',
        icon: Upload,
        image: '/images/instructions/08.png',
        imageAlt: 'Selecionando a opção de importar relatórios.',
    },
    {
        number: '09',
        title: 'Selecione os arquivos.',
        description:
            'Selecione os arquivos que deseja importar. Podendo ser mais de um por vez.',
        icon: Files,
        image: '/images/instructions/09.png',
        imageAlt: 'Selecionando os arquivos que exportamos da B3.',
    },
    {
        number: '10',
        title: 'Importe os arquivos.',
        description:
            'Clique em "Importar relatório", espere concluir e após esta etapa pode visualizar as análises dos mesmos.',
        icon: FileUp,
        image: '/images/instructions/10.png',
        imageAlt: 'Importando os relatórios que baixamos no site da B3.',
    },
    {
        number: '11',
        title: 'Acompanhe seus investimentos',
        description:
            'Após a importação, os dados ficam disponíveis para consulta e passam a fazer parte do seu histórico de investimentos.',
        icon: LineChart,
        image: '/images/instructions/11.png',
        imageAlt:
            'Opções para visualizar após a importação dos relatórios da B3.',
    },
];

export default function Instructions() {
    return (
        <>
            <Head title="Como funciona" />

            <div className="bg-background text-foreground min-h-screen">
                <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
                    {/* Cabeçalho */}
                    <div className="max-w-2xl">
                        <p className="text-muted-foreground text-sm font-medium">
                            Guia do MeuInvest
                        </p>

                        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Como funciona
                        </h1>

                        <p className="text-muted-foreground mt-4 text-base leading-7">
                            Aprenda passo a passo como baixar seus relatórios da
                            B3 e importá-los no MeuInvest para acompanhar seus
                            investimentos.
                        </p>
                    </div>

                    {/* Conteúdo */}
                    <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
                        {/* Navegação */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-8">
                                <p className="text-sm font-medium">
                                    Neste guia
                                </p>

                                <nav className="mt-4 space-y-1">
                                    {steps.map((step) => (
                                        <a
                                            key={step.number}
                                            href={`#step-${step.number}`}
                                            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                                        >
                                            <span className="font-mono text-xs">
                                                {step.number}
                                            </span>

                                            <span>{step.title}</span>
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Passos */}
                        <main className="max-w-3xl">
                            <div className="space-y-16">
                                {steps.map((step) => {
                                    const Icon = step.icon;

                                    return (
                                        <section
                                            key={step.number}
                                            id={`step-${step.number}`}
                                            className="scroll-mt-8"
                                        >
                                            <div className="flex gap-5">
                                                {/* Número / ícone */}
                                                <div className="flex shrink-0 flex-col items-center">
                                                    <div className="border-border bg-muted/40 flex size-10 items-center justify-center rounded-lg border">
                                                        <Icon className="size-5" />
                                                    </div>

                                                    {step.number !==
                                                        steps[steps.length - 1]
                                                            .number && (
                                                        <div className="bg-border mt-3 h-full w-px" />
                                                    )}
                                                </div>

                                                {/* Conteúdo */}
                                                <div className="min-w-0 flex-1 pb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-muted-foreground font-mono text-xs">
                                                            {step.number}
                                                        </span>

                                                        <h2 className="text-xl font-semibold tracking-tight">
                                                            {step.title}
                                                        </h2>
                                                    </div>

                                                    <p className="text-muted-foreground mt-3 text-sm leading-7">
                                                        {step.description}
                                                    </p>

                                                    {/* Área reservada para screenshot */}
                                                    <div className="border-border bg-muted/20 mt-6 flex aspect-video items-center justify-center rounded-xl border border-dashed">
                                                        <span className="text-muted-foreground text-sm">
                                                            {/* Screenshot do passo */}
                                                            <img
                                                                src={step.image}
                                                                alt={
                                                                    step.imageAlt
                                                                }
                                                                className="w-full"
                                                            />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    );
                                })}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
