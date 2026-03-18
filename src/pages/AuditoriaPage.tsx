import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, Filter, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const logs = [
  {
    id: "AUD-4108",
    action: "VERSION_RESTORE",
    user: "Ana Lima",
    target: "Contrato_042.pdf (v3 → v2)",
    context: "Documentos > Versionamento",
    ip: "192.168.1.78",
    timestamp: "14 Nov 2024, 16:40:09",
    integrity: "sha256:7d9c1f8f9a2e",
    previousId: "AUD-4107",
    previousHash: "sha256:18a2d0c2a3f1",
  },
  {
    id: "AUD-4107",
    action: "DOC_RESTORE",
    user: "Carlos Ribeiro",
    target: "Inventario_Municipal.pdf",
    context: "Documentos > Lixeira",
    ip: "172.16.0.5",
    timestamp: "14 Nov 2024, 16:05:32",
    integrity: "sha256:18a2d0c2a3f1",
    previousId: "AUD-4106",
    previousHash: "sha256:31c7b9a2e110",
  },
  {
    id: "AUD-4106",
    action: "TRASH_DELETE",
    user: "Carlos Ribeiro",
    target: "Rascunho_003.pdf",
    context: "Documentos > Lixeira",
    ip: "172.16.0.5",
    timestamp: "14 Nov 2024, 15:58:21",
    integrity: "sha256:31c7b9a2e110",
    previousId: "AUD-4105",
    previousHash: "sha256:ac229bf05f34",
  },
  {
    id: "AUD-4105",
    action: "SUBFOLDER_CREATE",
    user: "Maria Silva",
    target: "Contratos 2024/Fornecedores",
    context: "Documentos > Pastas",
    ip: "192.168.1.45",
    timestamp: "14 Nov 2024, 14:22:10",
    integrity: "sha256:ac229bf05f34",
    previousId: "AUD-4104",
    previousHash: "sha256:3b0b6c2a1a90",
  },
  {
    id: "AUD-4104",
    action: "FOLDER_CREATE",
    user: "Maria Silva",
    target: "Contratos 2024",
    context: "Documentos > Pastas",
    ip: "192.168.1.45",
    timestamp: "14 Nov 2024, 14:05:02",
    integrity: "sha256:3b0b6c2a1a90",
    previousId: "AUD-4103",
    previousHash: "sha256:2d90f8a21c8e",
  },
  {
    id: "AUD-4103",
    action: "PERM_CHANGE",
    user: "Admin",
    target: "Equipe Jurídico → Editor",
    context: "Administração > Permissões",
    ip: "192.168.1.10",
    timestamp: "14 Nov 2024, 11:32:44",
    integrity: "sha256:2d90f8a21c8e",
    previousId: "AUD-4102",
    previousHash: "sha256:f2a1c7d91f6b",
  },
  {
    id: "AUD-4102",
    action: "TEAM_CREATE",
    user: "Admin",
    target: "Equipe Jurídico",
    context: "Administração > Equipes",
    ip: "192.168.1.10",
    timestamp: "14 Nov 2024, 10:58:09",
    integrity: "sha256:f2a1c7d91f6b",
    previousId: "AUD-4101",
    previousHash: "sha256:9f2c1d8b4e01",
  },
  {
    id: "AUD-4101",
    action: "USER_STATUS_CHANGE",
    user: "Admin",
    target: "maria@archiclouds.com (Status: Suspenso)",
    context: "Administração > Usuários",
    ip: "192.168.1.10",
    timestamp: "14 Nov 2024, 10:40:17",
    integrity: "sha256:9f2c1d8b4e01",
    previousId: "AUD-4100",
    previousHash: "sha256:118b29c9d8a2",
  },
  {
    id: "AUD-4100",
    action: "USER_CREATE",
    user: "Admin",
    target: "pedro@archiclouds.com",
    context: "Administração > Usuários",
    ip: "192.168.1.10",
    timestamp: "14 Nov 2024, 10:12:33",
    integrity: "sha256:118b29c9d8a2",
    previousId: "AUD-4099",
    previousHash: "sha256:bf08d1a7e01c",
  },
  {
    id: "AUD-4099",
    action: "DOC_UPLOAD",
    user: "Lucia Martins",
    target: "Tabela_TTD_2024.xlsx",
    context: "Documentos > Upload",
    ip: "10.0.0.55",
    timestamp: "13 Nov 2024, 17:18:54",
    integrity: "sha256:bf08d1a7e01c",
    previousId: "AUD-4098",
    previousHash: "sha256:0a7f1bd2c31f",
  },
  {
    id: "AUD-4098",
    action: "DOC_DOWNLOAD",
    user: "João Pereira",
    target: "Inventario_Municipal.pdf",
    context: "Documentos > Biblioteca",
    ip: "10.0.0.23",
    timestamp: "13 Nov 2024, 16:35:12",
    integrity: "sha256:0a7f1bd2c31f",
    previousId: null,
    previousHash: null,
  },
];

const actionLabels: Record<string, { label: string; color: string }> = {
  DOC_UPLOAD: { label: "Upload", color: "bg-primary/10 text-primary" },
  DOC_DOWNLOAD: { label: "Download", color: "bg-primary/10 text-primary" },
  PERM_CHANGE: { label: "Permissão", color: "bg-warning/10 text-warning" },
  USER_CREATE: { label: "Novo Usuário", color: "bg-primary/10 text-primary" },
  USER_STATUS_CHANGE: { label: "Status Usuário", color: "bg-warning/10 text-warning" },
  TEAM_CREATE: { label: "Nova Equipe", color: "bg-primary/10 text-primary" },
  FOLDER_CREATE: { label: "Nova Pasta", color: "bg-primary/10 text-primary" },
  SUBFOLDER_CREATE: { label: "Nova Subpasta", color: "bg-primary/10 text-primary" },
  TRASH_DELETE: { label: "Exclusão", color: "bg-destructive/10 text-destructive" },
  DOC_RESTORE: { label: "Restauração", color: "bg-primary/10 text-primary" },
  VERSION_RESTORE: { label: "Restaura Versão", color: "bg-primary/10 text-primary" },
};

const periodOptions = ["Todos", "Últimos 7 dias", "Últimos 30 dias", "Últimos 90 dias"];

const periodDaysMap: Record<string, number> = {
  "Últimos 7 dias": 7,
  "Últimos 30 dias": 30,
  "Últimos 90 dias": 90,
};

const parseLogDate = (timestamp: string) => {
  const normalized = timestamp.replace(",", "");
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date("2024-11-14T18:00:00") : parsed;
};

const mockNow = new Date("2024-11-14T18:00:00");

export default function AuditoriaPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null);
  const [actionFilter, setActionFilter] = useState("Todos");
  const [userFilter, setUserFilter] = useState("Todos");
  const [contextFilter, setContextFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("Todos");
  const [toast, setToast] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (actionFilter !== "Todos") result = result.filter((log) => log.action === actionFilter);
    if (userFilter !== "Todos") result = result.filter((log) => log.user === userFilter);
    if (contextFilter.trim()) {
      const term = contextFilter.toLowerCase();
      result = result.filter((log) => log.context.toLowerCase().includes(term));
    }
    if (targetFilter.trim()) {
      const term = targetFilter.toLowerCase();
      result = result.filter((log) => log.target.toLowerCase().includes(term));
    }
    if (ipFilter.trim()) {
      const term = ipFilter.toLowerCase();
      result = result.filter((log) => log.ip.toLowerCase().includes(term));
    }
    if (periodFilter !== "Todos") {
      const limitDays = periodDaysMap[periodFilter] || 0;
      result = result.filter((log) => {
        const logDate = parseLogDate(log.timestamp);
        const diffDays = (mockNow.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= limitDays;
      });
    }
    return result;
  }, [actionFilter, userFilter, contextFilter, targetFilter, ipFilter, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, userFilter, contextFilter, targetFilter, ipFilter, periodFilter]);

  const handleExport = (format: "CSV" | "PDF") => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const baseRows = filteredLogs.map((log) => [
      log.id,
      actionLabels[log.action]?.label || log.action,
      log.user,
      log.target,
      log.context,
      log.ip,
      log.timestamp,
      log.integrity,
      log.previousId || "—",
      log.previousHash || "—",
    ]);
    const content =
      format === "CSV"
        ? [
            ["ID", "Ação", "Usuário", "Alvo", "Contexto", "IP", "Data/Hora", "Hash", "Evento anterior", "Hash anterior"].join(";"),
            ...baseRows.map((row) => row.map((value) => escapeCsv(String(value))).join(";")),
          ].join("\n")
        : [
            "AUDITORIA - ARCHICLOUDS GED",
            "=================================",
            ...baseRows.map(
              (row) =>
                `ID: ${row[0]}\nAção: ${row[1]}\nUsuário: ${row[2]}\nAlvo: ${row[3]}\nContexto: ${row[4]}\nIP: ${row[5]}\nData/Hora: ${row[6]}\nHash: ${row[7]}\nEvento anterior: ${row[8]}\nHash anterior: ${row[9]}\n---`
            ),
          ].join("\n");

    const blob = new Blob([content], {
      type: format === "CSV" ? "text/csv" : "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria_${format.toLowerCase()}.${format === "CSV" ? "csv" : "pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exportação ${format} iniciada (simulado)`);
    setShowExport(false);
  };

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary text-sm px-4 py-2">
          {toast}
        </div>
      )}
      <PageHeader
        title="Auditoria"
        description="Registro imutável e encadeado de eventos do sistema"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(true)}>
              <Filter className="h-4 w-4" /> Filtros
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowExport(true)}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-card rounded-lg shadow-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left px-5 py-3 font-medium">ID</th>
                <th className="text-left px-5 py-3 font-medium">Ação</th>
                <th className="text-left px-5 py-3 font-medium">Usuário</th>
                <th className="text-left px-5 py-3 font-medium">Alvo</th>
                <th className="text-left px-5 py-3 font-medium">Contexto</th>
                <th className="text-left px-5 py-3 font-medium">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-sm text-muted-foreground text-center">
                    Nenhum evento encontrado
                  </td>
                </tr>
              )}
              {paginatedLogs.map((log) => {
                const action = actionLabels[log.action] || { label: log.action, color: "bg-muted text-muted-foreground" };
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-0 cursor-pointer"
                  >
                    <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{log.id}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${action.color}`}>
                        {action.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">{log.user}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground truncate max-w-[220px]">{log.target}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{log.context}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular-nums">{log.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Registro imutável e encadeado • Retenção: 5 anos
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={`page-${i + 1}`}
                variant="outline"
                size="sm"
                className={i + 1 === currentPage ? "bg-primary/10 text-primary border-primary/20" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Próximo
            </Button>
          </div>
        </div>
      </motion.div>

      {showFilters && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Filtros de Auditoria</h3>
            <p className="text-xs text-muted-foreground mb-4">Refine o log por ação, usuário, contexto, IP e período.</p>
            <div className="space-y-3">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="Todos">Todas as ações</option>
                {Object.keys(actionLabels).map((action) => (
                  <option key={action} value={action}>
                    {actionLabels[action].label}
                  </option>
                ))}
              </select>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="Todos">Todos os usuários</option>
                {[...new Set(logs.map((log) => log.user))].map((user) => (
                  <option key={user}>{user}</option>
                ))}
              </select>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                {periodOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <input
                value={contextFilter}
                onChange={(e) => setContextFilter(e.target.value)}
                placeholder="Contexto (ex: Documentos > Lixeira)"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <input
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                placeholder="Alvo ou recurso auditado"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <input
                value={ipFilter}
                onChange={(e) => setIpFilter(e.target.value)}
                placeholder="Endereço IP"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowFilters(false);
                  showToast("Filtros aplicados (simulado)");
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showExport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Exportar auditoria</h3>
            <p className="text-xs text-muted-foreground mb-4">Exporta o recorte filtrado do log em CSV ou PDF (simulado).</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => handleExport("CSV")}>Exportar CSV</Button>
              <Button variant="outline" onClick={() => handleExport("PDF")}>Exportar PDF</Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowExport(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Evento de Auditoria</h3>
            <p className="text-xs text-muted-foreground mb-4">Detalhe simulado do log com encadeamento de integridade.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Identificador</span>
                <span className="font-medium font-mono">{selectedLog.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ação</span>
                <span className="font-medium">
                  {actionLabels[selectedLog.action]?.label || selectedLog.action}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Usuário</span>
                <span className="font-medium">{selectedLog.user}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Alvo</span>
                <span className="font-medium">{selectedLog.target}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contexto</span>
                <span className="font-medium">{selectedLog.context}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IP</span>
                <span className="font-medium font-mono">{selectedLog.ip}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data/Hora</span>
                <span className="font-medium">{selectedLog.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hash do evento</span>
                <span className="font-medium font-mono">{selectedLog.integrity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Evento anterior</span>
                <span className="font-medium font-mono">{selectedLog.previousId || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hash anterior</span>
                <span className="font-medium font-mono">{selectedLog.previousHash || "—"}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
