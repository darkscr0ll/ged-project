import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useMemo, useState } from "react";

const mockSearchData = [
  {
    type: "Documento",
    id: "DOC-001",
    name: "Contrato_Prestacao_Servicos_042.pdf",
    meta: "Contrato • DOC-001",
    path: "Documentos / Contratos",
  },
  {
    type: "Documento",
    id: "DOC-002",
    name: "Tabela_Temporalidade_2024.xlsx",
    meta: "Tabela de Temporalidade • DOC-002",
    path: "Documentos / Tabelas de Temporalidade",
  },
  {
    type: "Documento",
    id: "DOC-003",
    name: "Ata_Reuniao_Conselho_15.pdf",
    meta: "Ata de Reunião • DOC-003",
    path: "Documentos / Atas e Reuniões",
  },
  {
    type: "Documento",
    id: "DOC-004",
    name: "Inventario_Acervo_Municipal.pdf",
    meta: "Inventário • DOC-004",
    path: "Documentos / Inventários",
  },
  { type: "Equipe", name: "Jurídico", meta: "6 membros" },
  { type: "Equipe", name: "Administrativo", meta: "12 membros" },
  { type: "Equipe", name: "Arquivo Central", meta: "4 membros" },
  { type: "Usuário", name: "Maria Silva", meta: "maria@archiclouds.com" },
  { type: "Usuário", name: "João Pereira", meta: "joao@archiclouds.com" },
  { type: "Usuário", name: "Ana Lima", meta: "ana@archiclouds.com" },
];

export function AppLayout() {
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Novo usuário criado",
      description: "Maria Silva foi adicionada ao time Administrativo.",
      time: "há 4 min",
      read: false,
    },
    {
      id: "n2",
      title: "Nova equipe criada",
      description: "Equipe de Arquivo Central criada com 4 membros.",
      time: "há 12 min",
      read: false,
    },
    {
      id: "n3",
      title: "Pasta criada",
      description: "Pasta Contratos 2024 criada no Jurídico.",
      time: "há 1 h",
      read: true,
    },
    {
      id: "n4",
      title: "Documento enviado",
      description: "Contrato_Prestacao_Servicos_042.pdf enviado.",
      time: "há 2 h",
      read: true,
    },
    {
      id: "n5",
      title: "Documento restaurado",
      description: "Inventario_Acervo_Municipal.pdf restaurado.",
      time: "há 1 dia",
      read: true,
    },
    {
      id: "n6",
      title: "Permissão alterada",
      description: "Permissões atualizadas para equipe RH.",
      time: "há 1 dia",
      read: false,
    },
    {
      id: "n7",
      title: "OCR processado",
      description: "OCR concluído para 18 documentos pendentes.",
      time: "há 2 dias",
      read: true,
    },
  ]);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return mockSearchData.filter((item) =>
      `${item.name} ${item.meta} ${item.type}`.toLowerCase().includes(term)
    );
  }, [search]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSelectResult = (item: (typeof mockSearchData)[number]) => {
    if (item.type === "Documento" && item.id) {
      navigate(`/documentos?docId=${item.id}`);
      showToast(`Abrindo documento (simulado): ${item.name}`);
    } else {
      showToast(`Abrindo ${item.type.toLowerCase()} (simulado): ${item.name}`);
    }
    setOpenSearch(false);
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="relative hidden sm:flex items-center gap-2 ml-2 bg-muted rounded-md px-3 py-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar documentos, equipes e usuários..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setOpenSearch(true);
                  }}
                  onFocus={() => setOpenSearch(true)}
                  className="bg-transparent text-sm outline-none w-64 placeholder:text-muted-foreground"
                />
                {openSearch && search.trim() && (
                  <div className="absolute left-0 top-10 w-[360px] bg-card border border-border rounded-md shadow-elevated z-50">
                    <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">
                      {results.length} resultado(s) encontrados
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {results.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground">
                          Nenhum resultado encontrado
                        </div>
                      ) : (
                        results.map((item) => (
                          <button
                            key={`${item.type}-${item.name}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectResult(item);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                          >
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.type} • {item.meta}
                            </p>
                            {item.type === "Documento" && item.path && (
                              <p className="text-[11px] text-muted-foreground">Localização: {item.path}</p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  className="relative p-2 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setOpenNotifications((prev) => !prev)}
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {openNotifications && (
                  <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-md shadow-elevated z-50">
                    <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Notificações</p>
                        <p className="text-xs text-muted-foreground">{unreadCount} não lida(s)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-[11px] text-primary hover:underline"
                          onClick={() =>
                            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
                          }
                        >
                          Marcar todas
                        </button>
                        <button
                          className="text-[11px] text-muted-foreground hover:underline"
                          onClick={() => setNotifications([])}
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {notifications.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">Nenhuma notificação no momento.</div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((item) =>
                                  item.id === notification.id ? { ...item, read: true } : item
                                )
                              )
                            }
                            className={`w-full text-left px-3 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-muted ${
                              notification.read ? "bg-transparent" : "bg-primary/5"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                <p className="text-xs text-muted-foreground">{notification.description}</p>
                              </div>
                              {!notification.read && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-2">{notification.time}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  AC
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Archiclouds</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-md text-sm shadow-elevated">
          {toast}
        </div>
      )}
    </SidebarProvider>
  );
}
