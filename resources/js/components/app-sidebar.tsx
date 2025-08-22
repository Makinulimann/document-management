import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    FolderTree,
    FileSpreadsheet,
    FileText,
    BarChart3,
    Settings,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'System Owner',
        icon: FolderTree,
        href: '#',
        children: [
            {
                title: 'DPP',
                href: '/system-owner/dpp',
                icon: FileSpreadsheet,
            },
            {
                title: 'RM',
                href: '/system-owner/rm',
                icon: FileText,
            },
            {
                title: 'LCCM',
                href: '/system-owner/lccm',
                icon: BarChart3,
            },
            {
                title: 'PSM',
                href: '/system-owner/psm',
                icon: FileText,
            },
        ],

    },
    {
        title: 'CBM',
        href: '/system-owner/cbm',
        icon: Settings,
    },
    {
        title: 'MMRK',
        href: '/system-owner/mmrk',
        icon: FileSpreadsheet,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
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
                {/* <NavFooter items={} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
