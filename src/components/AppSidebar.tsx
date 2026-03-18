import {
  LayoutDashboard,
  FileText,
  Users,
  UsersRound,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Documentos", url: "/documentos", icon: FileText },
  { title: "Equipes", url: "/equipes", icon: UsersRound },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Auditoria", url: "/auditoria", icon: ShieldCheck },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Archiclouds" className="h-8 w-8 rounded-md flex-shrink-0" />
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div>
                <h1 className="text-sm font-semibold text-sidebar-foreground">Archiclouds</h1>
                <p className="text-xs text-sidebar-muted">GED</p>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150"
                        activeClassName="!bg-sidebar-accent !text-sidebar-foreground"
                      >
                        <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150 w-full">
                <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span>Sair</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
