import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, HardDrive, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const reports = [
  {
    id: "armazenamento",
    title: "Ocupação de armazenamento por pasta/equipe",
    description: "Uso de disco detalhado por pasta e equipe",
    icon: HardDrive,
    status: "Disponível",
  },
  {
    id: "produtividade",
    title: "Produtividade por equipe",
    description: "Uploads, visualizações e edições por time",
    icon: Users,
    status: "Disponível",
  },
  {
    id: "tipos",
    title: "Documentos por tipo documental",
    description: "Distribuição de documentos por tipo e categoria",
    icon: FileText,
    status: "Disponível",
  },
  {
    id: "auditoria",
    title: "Auditoria consolidada",
    description: "Resumo das ações auditadas no período",
    icon: ShieldCheck,
    status: "Disponível",
  },
  {
    id: "conformidade",
    title: "Conformidade e eliminação",
    description: "Documentos em retenção, elegíveis e eliminados",
    icon: ShieldCheck,
    status: "Disponível",
  },
];

const reportDetails = {
  armazenamento: {
    summary: [
      { label: "Total armazenado", value: "1,8 TB" },
      { label: "Crescimento mensal", value: "+6,4%" },
      { label: "Maior pasta", value: "Contratos" },
    ],
    columns: ["Pasta/Equipe", "Uso", "%"],
    rows: [
      ["Jurídico / Contratos", "420 GB", "24%"],
      ["Administrativo / Financeiro", "360 GB", "20%"],
      ["Arquivo Central / Atas", "310 GB", "17%"],
      ["RH / Colaboradores", "210 GB", "12%"],
      ["Compras / Fornecedores", "190 GB", "11%"],
    ],
  },
  produtividade: {
    summary: [
      { label: "Uploads no período", value: "1.240" },
      { label: "Edições", value: "380" },
      { label: "Visualizações", value: "6.410" },
    ],
    columns: ["Equipe", "Uploads", "Visualizações", "Edições"],
    rows: [
      ["Administrativo", "420", "2.140", "120"],
      ["Jurídico", "310", "1.480", "95"],
      ["Arquivo Central", "280", "1.120", "80"],
      ["RH", "230", "1.670", "85"],
    ],
  },
  tipos: {
    summary: [
      { label: "Total de documentos", value: "12.540" },
      { label: "Tipo líder", value: "Contratos" },
      { label: "Tipos ativos", value: "14" },
    ],
    columns: ["Tipo documental", "Quantidade", "%"],
    rows: [
      ["Contratos", "3.420", "27%"],
      ["Atas de Reunião", "2.180", "17%"],
      ["Financeiro", "1.960", "15%"],
      ["Recursos Humanos", "1.740", "14%"],
      ["Inventários", "1.320", "11%"],
    ],
  },
  auditoria: {
    summary: [
      { label: "Eventos no período", value: "4.230" },
      { label: "Usuários auditados", value: "48" },
      { label: "Alertas críticos", value: "3" },
    ],
    columns: ["Evento", "Quantidade", "%"],
    rows: [
      ["Uploads", "1.240", "29%"],
      ["Alterações de permissão", "420", "10%"],
      ["Restaurações", "120", "3%"],
      ["Exclusões", "85", "2%"],
      ["Visualizações", "2.365", "56%"],
    ],
  },
  conformidade: {
    summary: [
      { label: "Em retenção", value: "6.820" },
      { label: "Elegíveis para eliminação", value: "420" },
      { label: "Eliminados", value: "38" },
    ],
    columns: ["Status", "Quantidade", "Observação"],
    rows: [
      ["Em retenção", "6.820", "Prazo dentro da TTD"],
      ["Elegíveis", "420", "Aguardando aprovação"],
      ["Suspensos", "85", "Hold jurídico"],
      ["Eliminados", "38", "Baixa auditada"],
    ],
  },
} as const;

const periodFactorMap: Record<string, number> = {
  "Últimos 7 dias": 0.35,
  "Últimos 30 dias": 1,
  "Últimos 90 dias": 2.4,
  "Ano atual": 4.5,
};

const statusFactorMap: Record<string, number> = {
  "Todos os status": 1,
  "Ativo": 0.92,
  "Em retenção": 1.08,
  "Elegível": 0.78,
  "Eliminado": 0.6,
};

const teamFactorMap: Record<string, number> = {
  "Todas as equipes": 1,
  "Administrativo": 0.96,
  "Jurídico": 0.9,
  "Arquivo Central": 1.05,
  "RH": 0.88,
};

const docTypeFactorMap: Record<string, number> = {
  "Todos os tipos": 1,
  "Contratos": 1.1,
  "Atas de Reunião": 0.92,
  "Financeiro": 0.98,
  "Inventários": 0.86,
};

const parseNumber = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const match = normalized.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const parseStorage = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const match = normalized.match(/\d+(\.\d+)?/);
  const amount = match ? Number(match[0]) : 0;
  if (value.toLowerCase().includes("tb")) {
    return amount * 1024;
  }
  return amount;
};

const formatStorage = (gb: number) => {
  if (gb >= 1024) {
    return `${(gb / 1024).toFixed(2).replace(".", ",")} TB`;
  }
  return `${Math.round(gb)} GB`;
};

const formatNumber = (value: number) => value.toLocaleString("pt-BR");

type ReportId = keyof typeof reportDetails;

type Filters = {
  period: string;
  team: string;
  docType: string;
  status: string;
};

const buildReportDetail = (reportId: ReportId, filters: Filters) => {
  const base = reportDetails[reportId];
  let rows = [...base.rows];
  const factor =
    (periodFactorMap[filters.period] ?? 1) *
    (teamFactorMap[filters.team] ?? 1) *
    (docTypeFactorMap[filters.docType] ?? 1) *
    (statusFactorMap[filters.status] ?? 1);

  if (filters.team !== "Todas as equipes" && (reportId === "armazenamento" || reportId === "produtividade")) {
    rows = rows.filter((row) => row[0].toLowerCase().includes(filters.team.toLowerCase()));
  }

  if (filters.docType !== "Todos os tipos" && reportId === "tipos") {
    rows = rows.filter((row) => row[0] === filters.docType);
  }

  if (filters.status !== "Todos os status" && reportId === "conformidade") {
    rows = rows.filter((row) => row[0].toLowerCase().includes(filters.status.toLowerCase()));
  }

  if (reportId === "armazenamento") {
    const adjustedRows = rows.map((row) => {
      const usage = parseStorage(row[1]);
      const adjustedUsage = usage * (0.85 + factor * 0.15);
      return [row[0], formatStorage(adjustedUsage), row[2]];
    });
    const total = adjustedRows.reduce((acc, row) => acc + parseStorage(row[1]), 0);
    const recalculatedRows = adjustedRows.map((row) => {
      const usage = parseStorage(row[1]);
      const pct = total ? Math.round((usage / total) * 100) : 0;
      return [row[0], row[1], `${pct}%`];
    });
    const growth = (6.4 * factor).toFixed(1).replace(".", ",");
    return {
      ...base,
      rows: recalculatedRows,
      summary: [
        { label: "Total armazenado", value: formatStorage(total) },
        { label: "Crescimento mensal", value: `+${growth}%` },
        { label: "Maior pasta", value: recalculatedRows[0]?.[0] ?? "Sem dados" },
      ],
    };
  }

  if (reportId === "produtividade") {
    const adjustedRows = rows.map((row) => {
      const uploads = Math.round(parseNumber(row[1]) * factor);
      const views = Math.round(parseNumber(row[2]) * factor);
      const edits = Math.round(parseNumber(row[3]) * factor);
      return [row[0], formatNumber(uploads), formatNumber(views), formatNumber(edits)];
    });
    const totals = adjustedRows.reduce(
      (acc, row) => {
        acc.uploads += parseNumber(row[1]);
        acc.views += parseNumber(row[2]);
        acc.edits += parseNumber(row[3]);
        return acc;
      },
      { uploads: 0, views: 0, edits: 0 }
    );
    return {
      ...base,
      rows: adjustedRows,
      summary: [
        { label: "Uploads no período", value: formatNumber(totals.uploads) },
        { label: "Edições", value: formatNumber(totals.edits) },
        { label: "Visualizações", value: formatNumber(totals.views) },
      ],
    };
  }

  if (reportId === "tipos") {
    const adjustedRows = rows.map((row) => {
      const qty = Math.round(parseNumber(row[1]) * factor);
      return [row[0], formatNumber(qty), row[2]];
    });
    const total = adjustedRows.reduce((acc, row) => acc + parseNumber(row[1]), 0);
    const recalculatedRows = adjustedRows.map((row) => {
      const qty = parseNumber(row[1]);
      const pct = total ? Math.round((qty / total) * 100) : 0;
      return [row[0], row[1], `${pct}%`];
    });
    return {
      ...base,
      rows: recalculatedRows,
      summary: [
        { label: "Total de documentos", value: formatNumber(total) },
        { label: "Tipo líder", value: recalculatedRows[0]?.[0] ?? "Sem dados" },
        { label: "Tipos ativos", value: formatNumber(recalculatedRows.length) },
      ],
    };
  }

  if (reportId === "auditoria") {
    const adjustedRows = rows.map((row) => {
      const qty = Math.round(parseNumber(row[1]) * factor);
      return [row[0], formatNumber(qty), row[2]];
    });
    const total = adjustedRows.reduce((acc, row) => acc + parseNumber(row[1]), 0);
    const recalculatedRows = adjustedRows.map((row) => {
      const qty = parseNumber(row[1]);
      const pct = total ? Math.round((qty / total) * 100) : 0;
      return [row[0], row[1], `${pct}%`];
    });
    return {
      ...base,
      rows: recalculatedRows,
      summary: [
        { label: "Eventos no período", value: formatNumber(total) },
        { label: "Usuários auditados", value: formatNumber(Math.max(8, Math.round(48 * factor * 0.4))) },
        { label: "Alertas críticos", value: formatNumber(Math.max(1, Math.round(3 * factor * 0.5))) },
      ],
    };
  }

  if (reportId === "conformidade") {
    const adjustedRows = rows.map((row) => {
      const qty = Math.round(parseNumber(row[1]) * factor);
      return [row[0], formatNumber(qty), row[2]];
    });
    const getValue = (label: string) => {
      const found = adjustedRows.find((row) => row[0] === label);
      return formatNumber(found ? parseNumber(found[1]) : 0);
    };
    return {
      ...base,
      rows: adjustedRows,
      summary: [
        { label: "Em retenção", value: getValue("Em retenção") },
        { label: "Elegíveis para eliminação", value: getValue("Elegíveis") },
        { label: "Eliminados", value: getValue("Eliminados") },
      ],
    };
  }

  return base;
};

export default function RelatoriosPage() {
  const [selectedReport, setSelectedReport] = useState<(typeof reports)[0] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{ type: "CSV" | "PDF" } | null>(null);

  const [period, setPeriod] = useState("Últimos 30 dias");
  const [team, setTeam] = useState("Todas as equipes");
  const [docType, setDocType] = useState("Todos os tipos");
  const [status, setStatus] = useState("Todos os status");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const triggerExport = (type: "CSV" | "PDF") => {
    showToast(`Exportação ${type} gerada (simulado)`);
    setExportFeedback({ type });
    setExportOpen(false);
  };

  useEffect(() => {
    if (!exportFeedback) return;
    const timer = setTimeout(() => setExportFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [exportFeedback]);

  const computedDetails = useMemo(() => {
    const filters = { period, team, docType, status };
    return reports.reduce<Record<string, ReturnType<typeof buildReportDetail>>>((acc, report) => {
      acc[report.id] = buildReportDetail(report.id as ReportId, filters);
      return acc;
    }, {});
  }, [period, team, docType, status]);

  const detail = useMemo(() => {
    if (!selectedReport) return null;
    return computedDetails[selectedReport.id];
  }, [selectedReport, computedDetails]);

  const activeFilters = useMemo(() => {
    const filters = [`Período: ${period}`];
    if (team !== "Todas as equipes") filters.push(`Equipe: ${team}`);
    if (docType !== "Todos os tipos") filters.push(`Tipo: ${docType}`);
    if (status !== "Todos os status") filters.push(`Status: ${status}`);
    return filters;
  }, [period, team, docType, status]);

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary text-sm px-4 py-2">
          {toast}
        </div>
      )}
      <PageHeader title="Relatórios" description="Exportação de dados e análises do sistema" />

      <div className="bg-card rounded-lg shadow-card p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="min-w-[180px]">
          <label className="text-xs text-muted-foreground">Período</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
            <option>Ano atual</option>
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs text-muted-foreground">Equipe</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option>Todas as equipes</option>
            <option>Administrativo</option>
            <option>Jurídico</option>
            <option>Arquivo Central</option>
            <option>RH</option>
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs text-muted-foreground">Tipo documental</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option>Todos os tipos</option>
            <option>Contratos</option>
            <option>Atas de Reunião</option>
            <option>Financeiro</option>
            <option>Inventários</option>
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option>Todos os status</option>
            <option>Ativo</option>
            <option>Em retenção</option>
            <option>Elegível</option>
            <option>Eliminado</option>
          </select>
        </div>
        <div className="ml-auto relative flex flex-col items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportOpen((prev) => !prev)}
          >
            Exportar dados filtrados
          </Button>
          {exportFeedback && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs ${
                exportFeedback.type === "CSV" ? "text-emerald-600" : "text-sky-600"
              }`}
            >
              <span
                className={`inline-flex h-2 w-2 rounded-full ${
                  exportFeedback.type === "CSV" ? "bg-emerald-500" : "bg-sky-500"
                }`}
              />
              <span>{exportFeedback.type} gerado para dados filtrados</span>
            </div>
          )}
          {exportOpen && (
            <div className="absolute right-0 top-9 mt-2 w-44 rounded-md border border-border bg-card shadow-card z-10">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                onClick={() => triggerExport("CSV")}
              >
                <div className="flex items-center justify-between">
                  <span>CSV</span>
                  {exportFeedback?.type === "CSV" && (
                    <span className="text-[10px] text-emerald-600">gerado</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">Exporta o recorte filtrado</span>
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                onClick={() => triggerExport("PDF")}
              >
                <div className="flex items-center justify-between">
                  <span>PDF</span>
                  {exportFeedback?.type === "PDF" && (
                    <span className="text-[10px] text-sky-600">gerado</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">Exporta o recorte filtrado</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, i) => {
          const summaryDetail = computedDetails[report.id];
          return (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="bg-card rounded-lg shadow-card p-5 transition-shadow duration-150 hover:shadow-elevated cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Disponível</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{report.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>

              <div className="mt-3 space-y-1">
                {summaryDetail?.summary.slice(0, 2).map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground">Linhas exibidas: {summaryDetail?.rows.length}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {activeFilters.map((filter) => (
                  <span key={filter} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {filter}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedReport && detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{selectedReport.title}</h3>
                <p className="text-xs text-muted-foreground">Detalhe simulado com filtros aplicados.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Fechar
              </Button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Filtros ativos</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeFilters.map((filter) => (
                  <span key={filter} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {filter}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {detail.summary.map((item) => (
                <div key={item.label} className="border border-border rounded-md px-3 py-2">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Linhas exibidas: {detail.rows.length}</span>
              <span>Dados ajustados pelo filtro atual.</span>
            </div>

            <div className="mt-2 border border-border rounded-md overflow-hidden">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-muted px-3 py-2 text-xs text-muted-foreground">
                {detail.columns.map((col) => (
                  <span key={col}>{col}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {detail.rows.map((row, index) => (
                  <div key={index} className="grid grid-cols-3 sm:grid-cols-4 gap-2 px-3 py-2 text-sm">
                    {row.map((cell, cellIndex) => (
                      <span key={cellIndex} className={cellIndex === 0 ? "font-medium" : "text-muted-foreground"}>
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {exportFeedback && (
              <p
                className={`mt-4 text-xs ${
                  exportFeedback.type === "CSV" ? "text-emerald-600" : "text-sky-600"
                }`}
              >
                Última exportação: {exportFeedback.type} (dados filtrados)
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => triggerExport("CSV")}>
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => triggerExport("PDF")}>
                Exportar PDF
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  showToast("Relatório atualizado (simulado)");
                  setSelectedReport(null);
                }}
              >
                Atualizar relatório
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
