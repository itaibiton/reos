"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BlackHoleIcon } from "@hugeicons/core-free-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  getNavigationForRole,
  isActivePath,
  type UserRole,
} from "@/lib/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { effectiveRole, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const t = useTranslations();

  // Get navigation for current role, cast to extended UserRole type
  // Default to investor for loading state
  const role = (effectiveRole as UserRole) ?? "investor";
  const navigation = getNavigationForRole(role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <HugeiconsIcon
                    icon={BlackHoleIcon}
                    className="size-4"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">REOS</span>
                  <span className="truncate text-xs">Real Estate OS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          // Loading skeleton
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          navigation.groups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              {group.labelKey && (
                <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = isActivePath(pathname, item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        {item.items && item.items.length > 0 ? (
                          // Collapsible menu item with sub-items
                          <Collapsible
                            defaultOpen
                            className="group/collapsible"
                          >
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton tooltip={t(item.labelKey)}>
                                <item.icon />
                                <span>{t(item.labelKey)}</span>
                                <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:-scale-x-100" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.items.map((subItem) => {
                                  const isSubActive = isActivePath(
                                    pathname,
                                    subItem.href
                                  );
                                  return (
                                    <SidebarMenuSubItem key={subItem.href}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isSubActive}
                                      >
                                        <Link href={subItem.href}>
                                          <span>{t(subItem.labelKey)}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          // Simple menu item
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={t(item.labelKey)}
                          >
                            <Link href={item.href}>
                              <item.icon />
                              <span>{t(item.labelKey)}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter>{/* User info + logout can go here in future */}</SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
