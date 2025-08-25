import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    FolderTree,
    FileSpreadsheet,
    FileText,
    BarChart3,
    Settings,
    UserCog,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role_id;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        ...(userRole === '36375465-ce30-4086-8203-05e757f02f9e' ? [{
            title: 'Manage User',
            href: 'manage-user',
            icon: UserCog,
        }] : []),
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
                {/* Gunakan array yang sudah difilter */}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}