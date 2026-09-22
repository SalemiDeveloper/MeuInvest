import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { 
    FileUp, 
    FileText, 
    LayoutGrid, 
    ChartNoAxesCombined,
    ChartLine, 
    CircleDollarSign,
    CircleHelp,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Importar relatório',
        href: '/investments/import',
        icon: FileUp,
    },
    {
        title: 'Relatórios',
        href: '/investments/reports',
        icon: FileText,
    },
    {
        title: 'Análise mensal',
        href: '/investments/analysis/monthly',
        icon: ChartNoAxesCombined,
    },
    {
        title: 'Evolução',
        href: '/investments/analysis/evolution',
        icon: ChartLine,
    },

    {
        title: 'Análise Individual',
        href: '/investments/analysis/positions',
        icon: CircleDollarSign,
    },
    {
        title: 'Como funciona',
        href: '/instructions',
        icon: CircleHelp,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}