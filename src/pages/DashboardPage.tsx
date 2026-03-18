import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Users, HardDrive, ShieldCheck, Clock, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const stats = [
  { title: "Documentos", value: "12.847", change: "+234 este mês", changeType: "positive" as const, icon: FileText },
  { title: "Usuários Ativos", value: "48", change: "+3 esta semana", changeType: "positive" as const, icon: Users },
  { title: "Armazenamento", value: "42.3 GB", change: "68% do plano", changeType: "neutral" as const, icon: HardDrive },
  { title: "Ações Auditadas", value: "3.291", change: "Últimos 30 dias", changeType: "neutral" as const, icon: ShieldCheck },
];

const recentDocs = [
  { name: "Contrato_Prestacao_Servicos_042.pdf", size: "1.2 MB", version: "V.3", date: "24 Out 2024", user: "Maria S." },
  { name: "Tabela_Temporalidade_2024.xlsx", size: "856 KB", version: "V.1", date: "23 Out 2024", user: "João P." },
  { name: "Ata_Reuniao_Conselho_15.pdf", size: "2.4 MB", version: "V.2", date: "22 Out 2024", user: "Ana L." },
  { name: "Inventario_Acervo_Municipal.pdf", size: "5.7 MB", version: "V.5", date: "21 Out 2024", user: "Carlos R." },
  { name: "Manual_Procedimentos_GED.docx", size: "340 KB", version: "V.1", date: "20 Out 2024", user: "Lucia M." },
];

const recentActivities = [
  { action: "Upload de documento", user: "Maria S.", time: "há 5 min", detail: "Contrato_Prestacao_042.pdf" },
  { action: "Login realizado", user: "João P.", time: "há 12 min", detail: "IP: 192.168.1.45" },
  { action: "Permissão alterada", user: "Admin", time: "há 1h", detail: "Equipe Jurídico → Editor" },
  { action: "Documento excluído", user: "Carlos R.", time: "há 2h", detail: "Rascunho_Oficio_003.pdf" },
];

export default function DashboardPage() {
  const [selectedDoc, setSelectedDoc] = useState<typeof recentDocs[0] | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<typeof recentActivities[0] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary text-sm px-4 py-2">
          {toast}
        </div>
      )}
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu workspace Archiclouds"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-lg shadow-card"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Documentos Recentes</h2>
            <button
              onClick={() => showToast("Navegando para Documentos (simulado)")}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Nome</th>
                  <th className="text-left px-5 py-3 font-medium">Tamanho</th>
                  <th className="text-left px-5 py-3 font-medium">Versão</th>
                  <th className="text-left px-5 py-3 font-medium">Data</th>
                  <th className="text-right px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr
                    key={doc.name}
                    onClick={() => setSelectedDoc(doc)}
                    className="group hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-0 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate max-w-[240px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular-nums">{doc.size}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {doc.version}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{doc.date}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted rounded-md transition-all"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.3 }}
          className="bg-card rounded-lg shadow-card"
        >
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Atividade Recente</h2>
          </div>
          <div className="p-5 space-y-4">
            {recentActivities.map((activity, i) => (
              <button
                key={i}
                onClick={() => setSelectedActivity(activity)}
                className="flex items-start gap-3 text-left w-full hover:bg-muted/40 rounded-md p-2 transition-colors"
              >
                <div className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.user} · <Clock className="inline h-3 w-3" /> {activity.time}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Detalhe do Documento</h3>
            <p className="text-sm text-muted-foreground mb-4">Informações simuladas do arquivo selecionado.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Nome</span><span className="font-medium">{selectedDoc.name}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Tamanho</span><span className="font-medium">{selectedDoc.size}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Versão</span><span className="font-medium">{selectedDoc.version}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Responsável</span><span className="font-medium">{selectedDoc.user}</span></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>Fechar</Button>
              <Button size="sm" onClick={() => { showToast("Abrindo visualização (simulado)"); setSelectedDoc(null); }}>Visualizar</Button>
            </div>
          </div>
        </div>
      )}

      {selectedActivity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Detalhe da Atividade</h3>
            <p className="text-sm text-muted-foreground mb-4">Log simulado referente à ação selecionada.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Ação</span><span className="font-medium">{selectedActivity.action}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Usuário</span><span className="font-medium">{selectedActivity.user}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Detalhe</span><span className="font-medium">{selectedActivity.detail}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Quando</span><span className="font-medium">{selectedActivity.time}</span></div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedActivity(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
