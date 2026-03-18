import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserPlus, MoreHorizontal, Shield, Mail } from "lucide-react";
import { useState } from "react";

type PermissionKey =
  | "visualizar"
  | "enviar"
  | "editar_metadados"
  | "excluir"
  | "restaurar"
  | "compartilhar"
  | "administrar";

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

const usersData = [
  {
    name: "Maria Silva",
    email: "maria@archiclouds.com",
    role: "Admin",
    teams: ["Administrativo", "TI"],
    status: "Ativo",
    mfa: true,
    lastLogin: "Hoje, 09:34",
  },
  {
    name: "João Pereira",
    email: "joao@archiclouds.com",
    role: "Editor",
    teams: ["Jurídico"],
    status: "Ativo",
    mfa: true,
    lastLogin: "Hoje, 08:12",
  },
  {
    name: "Ana Lima",
    email: "ana@archiclouds.com",
    role: "Arquivista",
    teams: ["Arquivo Central"],
    status: "Ativo",
    mfa: false,
    lastLogin: "Ontem, 17:45",
  },
  {
    name: "Carlos Ribeiro",
    email: "carlos@archiclouds.com",
    role: "Admin",
    teams: ["TI", "Administrativo"],
    status: "Ativo",
    mfa: true,
    lastLogin: "Hoje, 10:22",
  },
  {
    name: "Lucia Martins",
    email: "lucia@archiclouds.com",
    role: "Visualizador",
    teams: ["Financeiro"],
    status: "Inativo",
    mfa: false,
    lastLogin: "15 Out 2024",
  },
  {
    name: "Pedro Alves",
    email: "pedro@archiclouds.com",
    role: "Editor",
    teams: ["Recursos Humanos", "Administrativo"],
    status: "Pendente",
    mfa: false,
    lastLogin: "—",
  },
];

const statusColor: Record<string, string> = {
  Ativo: "bg-primary/10 text-primary",
  Inativo: "bg-muted text-muted-foreground",
  Pendente: "bg-warning/10 text-warning",
};

const statusOrder = ["Ativo", "Inativo", "Pendente"];

export default function UsuariosPage() {
  const [users, setUsers] = useState(usersData);
  const [selectedUser, setSelectedUser] = useState<typeof usersData[0] | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, PermissionKey[]>>(() =>
    Object.fromEntries(usersData.map((user) => [user.email, rolePermissions[user.role] || ["visualizar"]]))
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return showToast("Informe um email para convidar.");
    const newUser = {
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "Visualizador",
      teams: [],
      status: "Pendente",
      mfa: false,
      lastLogin: "—",
    };
    setUsers((prev) => [newUser, ...prev]);
    setUserPermissions((prev) => ({
      ...prev,
      [newUser.email]: rolePermissions.Visualizador,
    }));
    setInviteEmail("");
    setShowInvite(false);
    showToast("Convite enviado (simulado)");
  };

  const handleNewUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return showToast("Preencha nome e email.");
    const newUser = {
      name: newUserName,
      email: newUserEmail,
      role: "Editor",
      teams: ["Administrativo"],
      status: "Ativo",
      mfa: false,
      lastLogin: "Agora",
    };
    setUsers((prev) => [newUser, ...prev]);
    setUserPermissions((prev) => ({
      ...prev,
      [newUser.email]: rolePermissions.Editor,
    }));
    setNewUserName("");
    setNewUserEmail("");
    setShowNewUser(false);
    showToast("Usuário criado (simulado)");
  };

  const handleStatusChange = (email: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.email !== email) return user;
        const currentIndex = statusOrder.indexOf(user.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...user, status: nextStatus };
      })
    );
    showToast("Status atualizado (simulado)");
  };

  const toggleUserPermission = (email: string, key: PermissionKey) => {
    setUserPermissions((prev) => {
      const current = prev[email] || [];
      const updated = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      return { ...prev, [email]: updated };
    });
    showToast("Permissões do usuário atualizadas (simulado)");
  };

  const isDefaultRole = (user: (typeof usersData)[0]) => {
    const current = userPermissions[user.email] || [];
    const base = rolePermissions[user.role] || [];
    return current.length === base.length && base.every((item) => current.includes(item));
  };

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary text-sm px-4 py-2">
          {toast}
        </div>
      )}
      <PageHeader
        title="Usuários"
        description="Gerencie convites, acessos e perfis de usuários"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowInvite(true)}>
              <Mail className="h-4 w-4" /> Convidar
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowNewUser(true)}>
              <UserPlus className="h-4 w-4" /> Novo Usuário
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
                <th className="text-left px-5 py-3 font-medium">Usuário</th>
                <th className="text-left px-5 py-3 font-medium">Papel</th>
                <th className="text-left px-5 py-3 font-medium">Equipe</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">MFA</th>
                <th className="text-left px-5 py-3 font-medium">Último Login</th>
                <th className="text-right px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const primaryTeam = user.teams[0] || "—";
                const extraTeams = user.teams.length > 1 ? user.teams.length - 1 : 0;
                return (
                  <tr
                    key={user.email}
                    onClick={() => setSelectedUser(user)}
                    className="group hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-0 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-semibold flex-shrink-0">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-sm text-foreground">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" /> {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{primaryTeam}</span>
                        {extraTeams > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded-full">
                            +{extraTeams}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {user.mfa ? (
                        <span className="text-primary font-medium">Ativo</span>
                      ) : (
                        <span className="text-muted-foreground">Desativado</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{user.lastLogin}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted rounded-md transition-all"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Convidar Usuário</h3>
            <p className="text-xs text-muted-foreground mb-4">Envio de convite por email (simulado).</p>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email do usuário"
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleInvite}>Enviar convite</Button>
            </div>
          </div>
        </div>
      )}

      {showNewUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Novo Usuário</h3>
            <p className="text-xs text-muted-foreground mb-4">Cadastro manual (simulado).</p>
            <div className="space-y-3">
              <input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nome completo"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <input
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Email"
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewUser(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleNewUser}>Criar usuário</Button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Detalhe do Usuário</h3>
            <p className="text-xs text-muted-foreground mb-4">Ações simuladas para gestão do usuário.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Nome</span><span className="font-medium">{selectedUser.name}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{selectedUser.email}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Equipes</span>
                {selectedUser.teams.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {selectedUser.teams.map((team) => (
                      <span key={`${selectedUser.email}-${team}`} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                        {team}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="font-medium">—</span>
                )}
              </div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{selectedUser.status}</span></div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">Permissões do usuário</h4>
                <span className="text-[11px] text-muted-foreground">
                  {isDefaultRole(selectedUser) ? `Baseado no papel ${selectedUser.role}` : "Personalizado"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissionOptions.map((permission) => (
                  <label key={permission.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={(userPermissions[selectedUser.email] || []).includes(permission.key)}
                      onChange={() => toggleUserPermission(selectedUser.email, permission.key)}
                      className="h-4 w-4"
                    />
                    {permission.label}
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Permissões podem ser refinadas por pasta e documento (herança simulada).
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => showToast("Abrindo edição (simulado)")}>Editar</Button>
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedUser.email)}>Alterar status</Button>
              <Button variant="outline" size="sm" onClick={() => showToast("Convite reenviado (simulado)")}>Reenviar convite</Button>
              <Button size="sm" onClick={() => setSelectedUser(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
