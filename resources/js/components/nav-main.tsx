import { type NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.children ? (
              <>
                {/* Parent menu with children */}
                <SidebarMenuButton
                  onClick={() => toggleMenu(item.title)}
                  tooltip={item.title}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                  {openMenus.includes(item.title) ? (
                    <ChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </SidebarMenuButton>

                {/* Render children jika open */}
                {openMenus.includes(item.title) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.title}
                        href={child.href}
                        className={`flex items-center rounded-md px-2 py-1 text-sm hover:bg-gray-100 ${
                          page.url.startsWith(child.href)
                            ? "bg-gray-200 font-semibold"
                            : ""
                        }`}
                      >
                        {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Menu biasa tanpa children
              <SidebarMenuButton
                asChild
                isActive={page.url.startsWith(item.href)}
                tooltip={item.title}
              >
                <Link href={item.href} prefetch>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
