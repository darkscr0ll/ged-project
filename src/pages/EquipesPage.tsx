import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Users, FolderOpen, Shield } from "lucide-react";
import { useMemo, useState } from "react";

type PermissionKey =
  | "visualizar"
  | "enviar"
  | "editar_metadados"
  | "excluir"
  | "restaurar"
  | "compartilhar"
  | "administrar";

type Team = {
  name: string;
  members: string[];
  role: string;
  folders: number;
  lead: string;
};

const permissionOptions: { key: PermissionKey; label: string }[] = [
  { key: "visualizar", label: "Visualizar" },
  { key: "enviar", label: "Enviar" },
  { key: "editar_metadados", label: "Editar metadados" },
  { key: "excluir", label: "Excluir" },
  { key: "restaurar", label: "Restaurar" },
  { key: "compartilhar", label: "Compartilhar" },
  { key: "administrar", label: "Administrar" },
];

const rolePermissions: Record<string, PermissionKey[]> = {
  Admin: [
    "visualizar",
    "enviar",
    "editar_metadados",
    "excluir",
    "restaurar",
    "compartilhar",
    "administrar",
  ],
  Editor: ["visualizar", "enviar", "editar_metadados", "compartilhar"],
  Arquivista: ["visualizar", "enviar", "editar_metadados", "restaurar"],
  Visualizador: ["visualizar"],
};

const teamsData: Team[] = [
  {
    name: "Administrativo",
    members: ["Maria Silva", "Fernanda Costa", "Rafael Souza"],
    role: "Editor",
    folders: 8,
    lead: "Maria Silva",
  },
  {
    name: "Jurídico",
    members: ["João Pereira", "Camila Araújo", "Beatriz Lima"],
    role: "Editor",
    folders: 15,
    lead: "João Pereira",
  },
  {
    name: "Arquivo Central",
    members: ["Ana Lima", "Paulo Santos", "Renata Dias"],
    role: "Arquivista",
    folders: 23,
    lead: "Ana Lima",
  },
  {
    name: "TI",
    members: ["Carlos Ribeiro", "Marcelo Reis"],
    role: "Admin",
    folders: 5,
    lead: "Carlos Ribeiro",
  },
  {
    name: "Financeiro",
    members: ["Lucia Martins", "Bruno Lopes"],
    role: "Visualizador",
    folders: 6,
    lead: "Lucia Martins",
  },
  {
    name: "Recursos Humanos",
    members: ["Pedro Alves", "Renata Dias"],
    role: "Editor",
    folders: 10,
    lead: "Pedro Alves",
  },
];

const memberRolesData: Record<string, string> = {
  "Maria Silva": "Admin",
  "Fernanda Costa": "Editor",
  "Rafael Souza": "Visualizador",
  "João Pereira": "Editor",
  "Camila Araújo": "Editor",
  "Beatriz Lima": "Visualizador",
  "Ana Lima": "Arquivista",
  "Paulo Santos": "Visualizador",
  "Carlos Ribeiro": "Admin",
  "Marcelo Reis": "Editor",
  "Lucia Martins": "Visualizador",
  "Bruno Lopes": "Visualizador",
  "Pedro Alves": "Editor",
  "Renata Dias": "Visualizador",
};

export default function EquipesPage() {
  const [teams, setTeams] = useState(teamsData);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamPermissions, setShowTeamPermissions] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLead, setNewTeamLead] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("Editor");
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState("");
  const [memberNotice, setMemberNotice] = useState<{ message: string; type: "add" | "remove" } | null>(null);
  const [teamPermissions, setTeamPermissions] = useState<Record<string, PermissionKey[]>>(() =>
    Object.fromEntries(
      teamsData.map((team) => [team.name, rolePermissions[team.role] || ["visualizar"]])
    )
  );
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>(memberRolesData);

  const membersList = useMemo(
    () => Object.keys(memberRolesData).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" })),
    []
  );

  const selectedTeamData = selectedTeam
    ? teams.find((team) => team.name === selectedTeam.name) || selectedTeam
    : null;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const showMemberNotice = (message: string, type: "add" | "remove") => {
    setMemberNotice({ message, type });
    setTimeout(() => setMemberNotice(null), 2000);
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return showToast("Informe o nome da equipe.");
    const sanitizedMembers = Array.from(new Set(newTeamMembers));
    const newTeam: Team = {
      name: newTeamName,
      members: sanitizedMembers,
      role: newTeamRole,
      folders: 0,
      lead: newTeamLead || "Sem líder definido",
    };
    setTeams((prev) => [newTeam, ...prev]);
    setTeamPermissions((prev) => ({
      ...prev,
      [newTeam.name]: rolePermissions[newTeam.role] || ["visualizar"],
    }));
    setMemberRoles((prev) => {
      const updated = { ...prev };
      sanitizedMembers.forEach((member) => {
        if (!updated[member]) {
          updated[member] = newTeamRole;
        }
      });
      return updated;
    });
    setNewTeamName("");
    setNewTeamLead("");
    setNewTeamRole("Editor");
    setNewTeamMembers([]);
    setShowNewTeam(false);
    showToast("Equipe criada (simulado)");
  };

  const updateTeamMembers = (teamName: string, members: string[]) => {
    setTeams((prev) =>
      prev.map((team) => (team.name === teamName ? { ...team, members } : team))
    );
    setSelectedTeam((prev) => (prev && prev.name === teamName ? { ...prev, members } : prev));
  };

  const handleAddMember = () => {
    if (!selectedTeamData || !selectedMemberToAdd) return;
    if (selectedTeamData.members.includes(selectedMemberToAdd)) return;
    const updatedMembers = [...selectedTeamData.members, selectedMemberToAdd];
    updateTeamMembers(selectedTeamData.name, updatedMembers);
    if (!memberRoles[selectedMemberToAdd]) {
      setMemberRoles((prev) => ({ ...prev, [selectedMemberToAdd]: selectedTeamData.role }));
    }
    showToast("Membro adicionado (simulado)");
    showMemberNotice(`Membro ${selectedMemberToAdd} adicionado com sucesso.`, "add");
    setSelectedMemberToAdd("");
  };

  const handleRemoveMember = (member: string) => {
    if (!selectedTeamData) return;
    const updatedMembers = selectedTeamData.members.filter((item) => item !== member);
    updateTeamMembers(selectedTeamData.name, updatedMembers);
    showToast("Membro removido (simulado)");
    showMemberNotice(`Membro ${member} removido da equipe.`, "remove");
  };

  const toggleTeamPermission = (teamName: string, key: PermissionKey) => {
    setTeamPermissions((prev) => {
      const current = prev[teamName] || [];
      const updated = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      return { ...prev, [teamName]: updated };
    });
    showToast("Permissões da equipe atualizadas (simulado)");
  };

  const handleMemberRoleChange = (member: string, role: string) => {
    setMemberRoles((prev) => ({ ...prev, [member]: role }));
    showToast("Permissões do membro atualizadas (simulado)");
  };

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary text-sm px-4 py-2">
          {toast}
        </div>
      )}
      <PageHeader
        title="Equipes"
        description="Gerencie equipes e suas permissões"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setShowNewTeam(true)}>
            <Plus className="h-4 w-4" /> Nova Equipe
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, i) => (
          <motion.div
            key={team.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="bg-card rounded-lg shadow-card p-5 hover:shadow-elevated transition-shadow duration-150 cursor-pointer"
            onClick={() => setSelectedTeam(team)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{team.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Líder: {team.lead}</p>
              </div>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                {team.role}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {team.members.length} membros
              </span>
              <span className="flex items-center gap-1">
                <FolderOpen className="h-3.5 w-3.5" /> {team.folders} pastas
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> {team.role}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {showNewTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Nova Equipe</h3>
            <p className="text-xs text-muted-foreground mb-4">Cadastro simulado de equipe.</p>
            <div className="space-y-3">
              <input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Nome da equipe"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <input
                value={newTeamLead}
                onChange={(e) => setNewTeamLead(e.target.value)}
                placeholder="Líder (opcional)"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <select
                value={newTeamRole}
                onChange={(e) => setNewTeamRole(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option>Admin</option>
                <option>Editor</option>
                <option>Arquivista</option>
                <option>Visualizador</option>
              </select>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Membros iniciais</p>
                <div className="border border-border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
                  {membersList.map((member) => (
                    <label key={member} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={newTeamMembers.includes(member)}
                        onChange={() =>
                          setNewTeamMembers((prev) =>
                            prev.includes(member)
                              ? prev.filter((item) => item !== member)
                              : [...prev, member]
                          )
                        }
                        className="h-4 w-4"
                      />
                      <span>{member}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {newTeamMembers.length} membro(s) selecionado(s).
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewTeam(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleCreateTeam}>
                Criar equipe
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedTeamData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Detalhe da Equipe</h3>
              <p className="text-xs text-muted-foreground mb-4">Informações simuladas da equipe selecionada.</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Equipe</span>
                  <span className="font-medium">{selectedTeamData.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Líder</span>
                  <span className="font-medium">{selectedTeamData.lead}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Permissão</span>
                  <span className="font-medium">{selectedTeamData.role}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Membros</p>
                {memberNotice && (
                  <div
                    className={`mb-3 rounded-md border px-3 py-2 text-xs ${
                      memberNotice.type === "add"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-600"
                    }`}
                  >
                    {memberNotice.message}
                  </div>
                )}
                <div className="space-y-2">
                  {selectedTeamData.members.length === 0 && (
                    <div className="text-xs text-muted-foreground">Nenhum membro vinculado.</div>
                  )}
                  {selectedTeamData.members.map((member) => (
                    <div key={member} className="border border-border rounded-md p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{member}</p>
                        <p className="text-xs text-muted-foreground">
                          Papel: {memberRoles[member] || selectedTeamData.role}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRemoveMember(member)}>
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border border-dashed border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-2">Adicionar membro</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMemberToAdd}
                      onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                      className="border border-border rounded-md px-2 py-1 text-xs bg-background w-full"
                    >
                      <option value="">Selecionar usuário</option>
                      {membersList
                        .filter((member) => !selectedTeamData.members.includes(member))
                        .map((member) => (
                          <option key={`add-${member}`} value={member}>
                            {member}
                          </option>
                        ))}
                    </select>
                    <Button size="sm" onClick={handleAddMember}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => showToast("Abrindo edição (simulado)")}>
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTeamPermissions(true);
                }}
              >
                Permissões
              </Button>
              <Button size="sm" onClick={() => setSelectedTeam(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedTeamData && showTeamPermissions && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Permissões da equipe</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Controle granular por equipe e membros. Herança usada para pastas e documentos (simulado).
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="border border-border rounded-md p-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedTeamData.name}</p>
                    <p className="text-xs text-muted-foreground">Permissões atribuídas à equipe.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {selectedTeamData.role}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissionOptions.map((permission) => (
                    <label key={permission.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={(teamPermissions[selectedTeamData.name] || []).includes(permission.key)}
                        onChange={() => toggleTeamPermission(selectedTeamData.name, permission.key)}
                        className="h-4 w-4"
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  Compartilhamento externo: estrutura preparada (em breve).
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Membros e permissões</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {(selectedTeamData.members || []).map((member) => (
                    <div
                      key={member}
                      className="border border-border rounded-md p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{member}</p>
                          <p className="text-xs text-muted-foreground">Permissões individuais simuladas.</p>
                        </div>
                        <select
                          value={memberRoles[member] || "Visualizador"}
                          onChange={(e) => handleMemberRoleChange(member, e.target.value)}
                          className="border border-border rounded-md px-2 py-1 text-xs bg-background"
                        >
                          <option>Admin</option>
                          <option>Editor</option>
                          <option>Arquivista</option>
                          <option>Visualizador</option>
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(rolePermissions[memberRoles[member] || "Visualizador"] || ["visualizar"]).map(
                          (perm) => (
                            <span
                              key={`${member}-${perm}`}
                              className="px-2 py-0.5 bg-muted text-[11px] rounded-full"
                            >
                              {permissionOptions.find((p) => p.key === perm)?.label}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTeamPermissions(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
