import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Building2, Clock, FileText, Globe, Key, Shield } from "lucide-react";
import { useMemo, useState } from "react";

type DocType = {
  name: string;
  retention: string;
  active: boolean;
  notes?: string;
  ttd?: string;
};

type TtdPreview = {
  rows: {
    codigo: string;
    funcao: string;
    subfuncao: string;
    tipo: string;
    corrente: number;
    intermediario: number;
    destinacao: "E" | "GP";
    baseLegal: string;
    observacoes: string;
  }[];
  generated: DocType[];
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("Organização");
  const [toast, setToast] = useState<string | null>(null);

  const [orgName, setOrgName] = useState("Archiclouds Solutions LTDA");
  const [slug, setSlug] = useState("archiclouds");
  const [plan, setPlan] = useState("Pro");
  const [timezone, setTimezone] = useState("UTC-3 (Brasília)");

  const [mfaRequired, setMfaRequired] = useState("Sim");
  const [passwordPolicy, setPasswordPolicy] = useState("Forte (12+ caracteres)");
  const [sessionTimeout, setSessionTimeout] = useState("30 minutos");
  const [auditLevel, setAuditLevel] = useState("Completa");

  const [apiKey, setApiKey] = useState("ac_live_••••••••dk4f");
  const [webhookUrl, setWebhookUrl] = useState("https://api.archiclouds.com/webhook");
  const [apiMode, setApiMode] = useState("Produção");
  const [webhooksActive, setWebhooksActive] = useState("Sim");
  const [ocrIntegration, setOcrIntegration] = useState("Automático");

  const [retentionPolicy, setRetentionPolicy] = useState("Tabela de Temporalidade 2024");
  const [retentionPeriod, setRetentionPeriod] = useState("5 anos");
  const [retentionNotify, setRetentionNotify] = useState("30 dias");
  const [retentionAutoDelete, setRetentionAutoDelete] = useState("Não");
  const [restoreWindow, setRestoreWindow] = useState("90 dias");

  const [docTypes, setDocTypes] = useState<DocType[]>([
    { name: "Contratos", retention: "5 anos", active: true, ttd: "ADM.01" },
    { name: "Atas de Reunião", retention: "3 anos", active: true },
    { name: "Financeiro", retention: "8 anos", active: true, ttd: "FIN.04" },
    { name: "Inventários", retention: "10 anos", active: true },
    { name: "Documentos Pessoais", retention: "2 anos", active: false, notes: "Acesso restrito" },
  ]);

  const [showAddType, setShowAddType] = useState(false);
  const [newType, setNewType] = useState({
    name: "",
    retention: "5 anos",
    active: true,
    notes: "",
    ttd: "",
  });

  const [ttdFile, setTtdFile] = useState<File | null>(null);
  const [ttdStep, setTtdStep] = useState<"upload" | "map" | "preview">("upload");
  const [ttdPreview, setTtdPreview] = useState<TtdPreview | null>(null);

  const ttdColumnOptions = useMemo(
    () => [
      "CODIGO",
      "FUNCAO",
      "SUBFUNCAO",
      "TIPO_DOCUMENTAL",
      "PRAZO_CORRENTE",
      "PRAZO_INTERMEDIARIO",
      "DESTINACAO_FINAL",
      "BASE_LEGAL",
      "OBSERVACOES",
    ],
    []
  );

  const [ttdMapping, setTtdMapping] = useState({
    codigo: "CODIGO",
    funcao: "FUNCAO",
    subfuncao: "SUBFUNCAO",
    tipo: "TIPO_DOCUMENTAL",
    prazoCorrente: "PRAZO_CORRENTE",
    prazoIntermediario: "PRAZO_INTERMEDIARIO",
    destinacao: "DESTINACAO_FINAL",
    baseLegal: "BASE_LEGAL",
    observacoes: "OBSERVACOES",
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const generatePreview = () => {
    const rows = [
      {
        codigo: "01.01",
        funcao: "Administração",
        subfuncao: "Gestão contratual",
        tipo: "Contrato de prestação de serviços",
        corrente: 5,
        intermediario: 10,
        destinacao: "GP" as const,
        baseLegal: "Lei 8.159/1991",
        observacoes: "Manter versão final assinada",
      },
      {
        codigo: "02.04",
        funcao: "Financeiro",
        subfuncao: "Contas a pagar",
        tipo: "Nota fiscal",
        corrente: 5,
        intermediario: 5,
        destinacao: "E" as const,
        baseLegal: "IN 02/2016",
        observacoes: "Eliminação após auditoria",
      },
      {
        codigo: "03.02",
        funcao: "Recursos Humanos",
        subfuncao: "Pessoal",
        tipo: "Ficha funcional",
        corrente: 10,
        intermediario: 0,
        destinacao: "GP" as const,
        baseLegal: "CLT",
        observacoes: "",
      },
    ];

    const generated: DocType[] = rows.map((row) => {
      const total = row.corrente + row.intermediario;
      return {
        name: row.tipo,
        retention: row.destinacao === "GP" ? "Guarda permanente" : `${total} anos`,
        active: true,
        notes: row.observacoes,
        ttd: row.codigo,
      };
    });

    setTtdPreview({ rows, generated });
  };

  const handleImportTTD = () => {
    if (!ttdPreview) return;
    setDocTypes((prev) => {
      const existing = new Set(prev.map((item) => item.name));
      const additions = ttdPreview.generated.filter((item) => !existing.has(item.name));
      return [...prev, ...additions];
    });
    showToast("TTD importada e tipos gerados (simulado)");
    setTtdFile(null);
    setTtdStep("upload");
    setTtdPreview(null);
  };

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary text-sm px-4 py-2">
          {toast}
        </div>
      )}
      <PageHeader title="Configurações" description="Gerencie seu workspace e integrações" />

      <div className="flex flex-wrap gap-2 mb-6">
        {["Organização", "Segurança", "API/Integrações", "Retenção", "Tipos documentais"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm border transition-colors ${
              activeTab === tab
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Organização" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-lg shadow-card max-w-3xl"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Organização</h3>
              <p className="text-xs text-muted-foreground">Configurações gerais do tenant</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Nome do Workspace</label>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Plano</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Starter</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fuso horário</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>UTC-3 (Brasília)</option>
                <option>UTC-4 (Manaus)</option>
                <option>UTC-2 (Fernando de Noronha)</option>
              </select>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <Button size="sm" onClick={() => showToast("Configurações salvas (simulado)")}>Salvar alterações</Button>
          </div>
        </motion.div>
      )}

      {activeTab === "Segurança" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-lg shadow-card max-w-3xl"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Segurança</h3>
              <p className="text-xs text-muted-foreground">Políticas de autenticação e sessão</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">MFA obrigatório</label>
              <select
                value={mfaRequired}
                onChange={(e) => setMfaRequired(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Complexidade de senha</label>
              <select
                value={passwordPolicy}
                onChange={(e) => setPasswordPolicy(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Forte (12+ caracteres)</option>
                <option>Média (8+ caracteres)</option>
                <option>Básica (6+ caracteres)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Timeout de sessão</label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>15 minutos</option>
                <option>30 minutos</option>
                <option>60 minutos</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Auditoria</label>
              <select
                value={auditLevel}
                onChange={(e) => setAuditLevel(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Completa</option>
                <option>Essencial</option>
                <option>Somente críticas</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground">
              OCR preparado: os documentos enviados passam por fila de processamento.
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <Button size="sm" onClick={() => showToast("Políticas atualizadas (simulado)")}>Salvar alterações</Button>
          </div>
        </motion.div>
      )}

      {activeTab === "API/Integrações" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-lg shadow-card max-w-3xl"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Key className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">API e Integrações</h3>
              <p className="text-xs text-muted-foreground">Integrações externas e webhooks (simulado)</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">API Key</label>
              <input
                value={apiKey}
                readOnly
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background font-mono"
              />
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setApiKey("ac_live_••••••••" + Math.random().toString(36).substring(2, 6));
                    showToast("Nova chave gerada (simulado)");
                  }}
                >
                  Gerar nova chave
                </Button>
                <Button variant="outline" size="sm" onClick={() => showToast("Chave copiada (simulado)")}>Copiar</Button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Webhook URL</label>
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-4 w-4" /> Eventos prontos para evolução via API
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ambiente</label>
              <select
                value={apiMode}
                onChange={(e) => setApiMode(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Produção</option>
                <option>Sandbox</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Webhooks ativos</label>
              <select
                value={webhooksActive}
                onChange={(e) => setWebhooksActive(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Integração OCR</label>
              <select
                value={ocrIntegration}
                onChange={(e) => setOcrIntegration(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Automático</option>
                <option>Manual</option>
                <option>Desativado</option>
              </select>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => showToast("Webhook testado (simulado)")}>Testar webhook</Button>
            <Button size="sm" onClick={() => showToast("Configurações de API salvas (simulado)")}>Salvar alterações</Button>
          </div>
        </motion.div>
      )}

      {activeTab === "Retenção" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-lg shadow-card max-w-3xl"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Retenção</h3>
              <p className="text-xs text-muted-foreground">Políticas de temporalidade e eliminação</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Política ativa</label>
              <select
                value={retentionPolicy}
                onChange={(e) => setRetentionPolicy(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Tabela de Temporalidade 2024</option>
                <option>Tabela de Temporalidade 2023</option>
                <option>Política interna padrão</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Retenção padrão</label>
              <select
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>2 anos</option>
                <option>5 anos</option>
                <option>8 anos</option>
                <option>10 anos</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Aviso antes da eliminação</label>
              <select
                value={retentionNotify}
                onChange={(e) => setRetentionNotify(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>15 dias</option>
                <option>30 dias</option>
                <option>60 dias</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Eliminação automática</label>
              <select
                value={retentionAutoDelete}
                onChange={(e) => setRetentionAutoDelete(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Não</option>
                <option>Sim</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Janela de restauração</label>
              <select
                value={restoreWindow}
                onChange={(e) => setRestoreWindow(e.target.value)}
                className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>30 dias</option>
                <option>60 dias</option>
                <option>90 dias</option>
                <option>180 dias</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Importar TTD</h4>
                  <p className="text-xs text-muted-foreground">
                    Faça upload de uma planilha CSV/XLSX para gerar tipos documentais e prazos.
                  </p>
                </div>
                {ttdFile && (
                  <span className="text-xs text-muted-foreground">Arquivo: {ttdFile.name}</span>
                )}
              </div>

              {ttdStep === "upload" && (
                <div className="mt-3 space-y-3">
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    className="text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setTtdFile(file);
                        setTtdStep("map");
                        showToast("Arquivo carregado (simulado)");
                      }
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    A importação é simulada nesta fase. O mapeamento será feito a seguir.
                  </div>
                </div>
              )}

              {ttdStep === "map" && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "codigo", label: "Código" },
                      { key: "funcao", label: "Função" },
                      { key: "subfuncao", label: "Subfunção" },
                      { key: "tipo", label: "Tipo documental" },
                      { key: "prazoCorrente", label: "Prazo corrente" },
                      { key: "prazoIntermediario", label: "Prazo intermediário" },
                      { key: "destinacao", label: "Destinação final" },
                      { key: "baseLegal", label: "Base legal" },
                      { key: "observacoes", label: "Observações" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-[11px] text-muted-foreground">{field.label}</label>
                        <select
                          value={ttdMapping[field.key as keyof typeof ttdMapping]}
                          onChange={(e) =>
                            setTtdMapping((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          className="w-full mt-1 border border-border rounded-md px-2 py-1.5 text-xs bg-background"
                        >
                          {ttdColumnOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTtdStep("upload");
                        setTtdFile(null);
                        showToast("Upload reiniciado (simulado)");
                      }}
                    >
                      Voltar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        generatePreview();
                        setTtdStep("preview");
                        showToast("Pré-visualização gerada (simulado)");
                      }}
                    >
                      Gerar pré-visualização
                    </Button>
                  </div>
                </div>
              )}

              {ttdStep === "preview" && ttdPreview && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    Serão criados {ttdPreview.generated.length} tipos documentais. Destinação final aceita: E = Eliminação, GP = Guarda Permanente.
                  </div>
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="grid grid-cols-5 gap-2 bg-muted px-3 py-2 text-xs text-muted-foreground">
                      <span>Código</span>
                      <span>Tipo</span>
                      <span>Corrente</span>
                      <span>Intermediário</span>
                      <span>Destinação</span>
                    </div>
                    <div className="divide-y divide-border">
                      {ttdPreview.rows.map((row) => (
                        <div key={row.codigo} className="grid grid-cols-5 gap-2 px-3 py-2 text-sm">
                          <span className="font-medium">{row.codigo}</span>
                          <span>{row.tipo}</span>
                          <span>{row.corrente} anos</span>
                          <span>{row.intermediario} anos</span>
                          <span className="text-muted-foreground">{row.destinacao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTtdStep("map")}
                    >
                      Ajustar mapeamento
                    </Button>
                    <Button size="sm" onClick={handleImportTTD}>Importar TTD</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <Button size="sm" onClick={() => showToast("Retenção atualizada (simulado)")}>Salvar alterações</Button>
          </div>
        </motion.div>
      )}

      {activeTab === "Tipos documentais" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-lg shadow-card max-w-3xl"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tipos documentais</h3>
              <p className="text-xs text-muted-foreground">Cadastro e retenção por tipo de documento</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {docTypes.map((type, index) => (
              <div key={type.name} className="border border-border rounded-md px-3 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{type.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Retenção {type.retention} • {type.active ? "Ativo" : "Inativo"}
                    {type.ttd ? ` • TTD ${type.ttd}` : ""}
                  </p>
                  {type.notes && <p className="text-xs text-muted-foreground mt-1">{type.notes}</p>}
                </div>
                <div className="min-w-[140px]">
                  <label className="text-[11px] text-muted-foreground">Retenção</label>
                  <select
                    value={type.retention}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDocTypes((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, retention: value } : item
                        )
                      );
                    }}
                    className="w-full mt-1 border border-border rounded-md px-2 py-1.5 text-xs bg-background"
                  >
                    <option>2 anos</option>
                    <option>3 anos</option>
                    <option>5 anos</option>
                    <option>8 anos</option>
                    <option>10 anos</option>
                    <option>Guarda permanente</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={type.active}
                    onChange={() => {
                      setDocTypes((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, active: !item.active } : item
                        )
                      );
                    }}
                  />
                  Ativo
                </label>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => setShowAddType(true)}>Adicionar tipo</Button>
            <Button size="sm" onClick={() => showToast("Tipos documentais atualizados (simulado)")}>Salvar alterações</Button>
          </div>
        </motion.div>
      )}

      {showAddType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Novo tipo documental</h3>
                <p className="text-xs text-muted-foreground">Cadastro manual com vínculo opcional à TTD.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddType(false)}>
                Fechar
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <input
                  value={newType.name}
                  onChange={(e) => setNewType((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Retenção</label>
                <select
                  value={newType.retention}
                  onChange={(e) => setNewType((prev) => ({ ...prev, retention: e.target.value }))}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option>2 anos</option>
                  <option>3 anos</option>
                  <option>5 anos</option>
                  <option>8 anos</option>
                  <option>10 anos</option>
                  <option>Guarda permanente</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select
                  value={newType.active ? "Ativo" : "Inativo"}
                  onChange={(e) => setNewType((prev) => ({ ...prev, active: e.target.value === "Ativo" }))}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Vínculo com TTD (opcional)</label>
                <input
                  value={newType.ttd}
                  onChange={(e) => setNewType((prev) => ({ ...prev, ttd: e.target.value }))}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                  placeholder="Ex: ADM.01"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Observações</label>
                <textarea
                  value={newType.notes}
                  onChange={(e) => setNewType((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddType(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!newType.name.trim()) {
                    showToast("Informe o nome do tipo documental");
                    return;
                  }
                  setDocTypes((prev) => [
                    ...prev,
                    {
                      name: newType.name,
                      retention: newType.retention,
                      active: newType.active,
                      notes: newType.notes,
                      ttd: newType.ttd || undefined,
                    },
                  ]);
                  setNewType({ name: "", retention: "5 anos", active: true, notes: "", ttd: "" });
                  setShowAddType(false);
                  showToast("Tipo documental adicionado (simulado)");
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
