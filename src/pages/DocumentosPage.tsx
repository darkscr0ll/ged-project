import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Upload,
  Filter,
  FileText,
  MoreHorizontal,
  FolderOpen,
  Search,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type PermissionKey =
  | "visualizar"
  | "enviar"
  | "editar_metadados"
  | "excluir"
  | "restaurar"
  | "compartilhar"
  | "administrar";

type PermissionSet = {
  teams: Record<string, PermissionKey[]>;
  users: Record<string, PermissionKey[]>;
};

type MetadataField = {
  key: string;
  label: string;
  type: "texto" | "numero" | "data" | "lista";
  options?: string[];
};

type DocumentType = {
  id: string;
  name: string;
  fields: MetadataField[];
};

type OcrStatus = "pendente" | "processado" | "indexado";

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

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  owner: string;
};

type VersionEntry = {
  version: number;
  author: string;
  date: string;
};

type Doc = {
  id: string;
  name: string;
  folderId: string | null;
  size: string;
  type: string;
  version: number;
  versions: VersionEntry[];
  ttd: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  status: "active" | "trashed" | "restored";
  documentTypeId: string;
  tags: string[];
  metadata: Record<string, string>;
  ocrStatus: OcrStatus;
  ocrContent?: string;
};

type ConfirmAction =
  | { type: "trash"; docId: string }
  | { type: "restoreDoc"; docId: string }
  | { type: "restoreVersion"; docId: string; version: number };

type UserInfo = { name: string; team: string; role: string };

const teamsList = [
  "Administrativo",
  "Jurídico",
  "Arquivo Central",
  "TI",
  "Financeiro",
  "Recursos Humanos",
];

const usersList: UserInfo[] = [
  { name: "Maria Silva", team: "Administrativo", role: "Admin" },
  { name: "João Pereira", team: "Jurídico", role: "Editor" },
  { name: "Ana Lima", team: "Arquivo Central", role: "Arquivista" },
  { name: "Carlos Ribeiro", team: "TI", role: "Admin" },
  { name: "Lucia Martins", team: "Financeiro", role: "Visualizador" },
  { name: "Pedro Alves", team: "Recursos Humanos", role: "Editor" },
];

const initialDocumentTypes: DocumentType[] = [
  {
    id: "dt-contrato",
    name: "Contrato",
    fields: [
      { key: "numero", label: "Número do contrato", type: "texto" },
      { key: "vigencia", label: "Vigência", type: "texto" },
      { key: "fornecedor", label: "Fornecedor", type: "texto" },
    ],
  },
  {
    id: "dt-ata",
    name: "Ata de Reunião",
    fields: [
      { key: "orgao", label: "Órgão", type: "texto" },
      { key: "data_reuniao", label: "Data da reunião", type: "data" },
    ],
  },
  {
    id: "dt-tabela",
    name: "Tabela de Temporalidade",
    fields: [
      { key: "orgao", label: "Órgão", type: "texto" },
      { key: "versao", label: "Versão", type: "texto" },
    ],
  },
  {
    id: "dt-inventario",
    name: "Inventário",
    fields: [
      { key: "setor", label: "Setor responsável", type: "texto" },
      { key: "referencia", label: "Referência", type: "texto" },
    ],
  },
];

const initialFolders: Folder[] = [
  { id: "f1", name: "Contratos", parentId: null, createdAt: "20 Out 2024", updatedAt: "24 Out 2024", owner: "Maria S." },
  { id: "f2", name: "Atas e Reuniões", parentId: null, createdAt: "18 Out 2024", updatedAt: "22 Out 2024", owner: "Ana L." },
  { id: "f3", name: "Tabelas de Temporalidade", parentId: null, createdAt: "12 Out 2024", updatedAt: "23 Out 2024", owner: "João P." },
  { id: "f4", name: "Inventários", parentId: null, createdAt: "10 Out 2024", updatedAt: "21 Out 2024", owner: "Carlos R." },
  { id: "f5", name: "Ofícios e Comunicações", parentId: null, createdAt: "09 Out 2024", updatedAt: "20 Out 2024", owner: "Lucia M." },
  { id: "f6", name: "Manuais e Procedimentos", parentId: null, createdAt: "08 Out 2024", updatedAt: "19 Out 2024", owner: "Pedro A." },
  { id: "f7", name: "Contratos - 2024", parentId: "f1", createdAt: "21 Out 2024", updatedAt: "24 Out 2024", owner: "Maria S." },
];

const initialDocuments: Doc[] = [
  {
    id: "DOC-001",
    name: "Contrato_Prestacao_Servicos_042.pdf",
    folderId: "f1",
    size: "1.2 MB",
    type: "PDF",
    version: 3,
    versions: [
      { version: 1, author: "Maria S.", date: "20 Out 2024" },
      { version: 2, author: "Maria S.", date: "22 Out 2024" },
      { version: 3, author: "Maria S.", date: "24 Out 2024" },
    ],
    ttd: "Corrente - 5 anos",
    createdAt: "20 Out 2024",
    updatedAt: "24 Out 2024",
    owner: "Maria S.",
    status: "active",
    documentTypeId: "dt-contrato",
    tags: ["jurídico", "fornecedor"],
    metadata: { numero: "042/2024", vigencia: "24 meses", fornecedor: "Grupo Horizonte" },
    ocrStatus: "indexado",
    ocrContent: "Contrato de prestação de serviços firmado entre Archiclouds e Grupo Horizonte para serviços de TI.",
  },
  {
    id: "DOC-002",
    name: "Tabela_Temporalidade_2024.xlsx",
    folderId: "f3",
    size: "856 KB",
    type: "XLSX",
    version: 1,
    versions: [{ version: 1, author: "João P.", date: "23 Out 2024" }],
    ttd: "Permanente",
    createdAt: "23 Out 2024",
    updatedAt: "23 Out 2024",
    owner: "João P.",
    status: "active",
    documentTypeId: "dt-tabela",
    tags: ["temporalidade", "governança"],
    metadata: { orgao: "Secretaria Geral", versao: "2024.1" },
    ocrStatus: "processado",
  },
  {
    id: "DOC-003",
    name: "Ata_Reuniao_Conselho_15.pdf",
    folderId: "f2",
    size: "2.4 MB",
    type: "PDF",
    version: 2,
    versions: [
      { version: 1, author: "Ana L.", date: "21 Out 2024" },
      { version: 2, author: "Ana L.", date: "22 Out 2024" },
    ],
    ttd: "Intermediário - 10 anos",
    createdAt: "22 Out 2024",
    updatedAt: "22 Out 2024",
    owner: "Ana L.",
    status: "active",
    documentTypeId: "dt-ata",
    tags: ["conselho", "deliberação"],
    metadata: { orgao: "Conselho Administrativo", data_reuniao: "15/10/2024" },
    ocrStatus: "pendente",
  },
  {
    id: "DOC-004",
    name: "Inventario_Acervo_Municipal.pdf",
    folderId: "f4",
    size: "5.7 MB",
    type: "PDF",
    version: 5,
    versions: [
      { version: 1, author: "Carlos R.", date: "15 Out 2024" },
      { version: 2, author: "Carlos R.", date: "17 Out 2024" },
      { version: 3, author: "Carlos R.", date: "19 Out 2024" },
      { version: 4, author: "Carlos R.", date: "20 Out 2024" },
      { version: 5, author: "Carlos R.", date: "21 Out 2024" },
    ],
    ttd: "Permanente",
    createdAt: "21 Out 2024",
    updatedAt: "21 Out 2024",
    owner: "Carlos R.",
    status: "active",
    documentTypeId: "dt-inventario",
    tags: ["acervo", "patrimônio"],
    metadata: { setor: "Arquivo Central", referencia: "INV-ACV-2024" },
    ocrStatus: "indexado",
    ocrContent: "Inventário do acervo municipal, listagem de volumes e caixas arquivísticas.",
  },
  {
    id: "DOC-005",
    name: "Oficio_Circular_089_2024.pdf",
    folderId: "f5",
    size: "245 KB",
    type: "PDF",
    version: 1,
    versions: [{ version: 1, author: "Lucia M.", date: "20 Out 2024" }],
    ttd: "Corrente - 2 anos",
    createdAt: "20 Out 2024",
    updatedAt: "20 Out 2024",
    owner: "Lucia M.",
    status: "active",
    documentTypeId: "dt-contrato",
    tags: ["comunicação", "ofício"],
    metadata: { numero: "089/2024", vigencia: "—", fornecedor: "—" },
    ocrStatus: "processado",
  },
  {
    id: "DOC-006",
    name: "Manual_Procedimentos_GED.docx",
    folderId: "f6",
    size: "340 KB",
    type: "DOCX",
    version: 1,
    versions: [{ version: 1, author: "Pedro A.", date: "19 Out 2024" }],
    ttd: "Corrente - 5 anos",
    createdAt: "19 Out 2024",
    updatedAt: "19 Out 2024",
    owner: "Pedro A.",
    status: "active",
    documentTypeId: "dt-inventario",
    tags: ["procedimentos", "treinamento"],
    metadata: { setor: "TI", referencia: "MAN-GED-01" },
    ocrStatus: "pendente",
  },
];

const initialFolderPermissions: Record<string, PermissionSet> = {
  f1: { teams: { Administrativo: rolePermissions.Editor }, users: { "Maria Silva": rolePermissions.Admin } },
  f2: { teams: { "Arquivo Central": rolePermissions.Editor }, users: { "Ana Lima": rolePermissions.Arquivista } },
  f3: { teams: { Jurídico: rolePermissions.Editor }, users: { "João Pereira": rolePermissions.Editor } },
  f4: { teams: { TI: rolePermissions.Admin }, users: { "Carlos Ribeiro": rolePermissions.Admin } },
  f5: { teams: { Financeiro: rolePermissions.Visualizador }, users: { "Lucia Martins": rolePermissions.Visualizador } },
  f6: { teams: { "Recursos Humanos": rolePermissions.Editor }, users: { "Pedro Alves": rolePermissions.Editor } },
};

const initialDocExceptions: Record<string, PermissionSet> = {
  "DOC-001": { teams: {}, users: { "João Pereira": ["visualizar"] } },
  "DOC-004": { teams: { TI: ["visualizar", "editar_metadados"] }, users: {} },
};

const formatDate = () =>
  new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export default function DocumentosPage() {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [documents, setDocuments] = useState<Doc[]>(initialDocuments);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [folderQuery, setFolderQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState<"root" | "sub" | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null);
  const [ttdFilter, setTtdFilter] = useState("Todos");
  const [documentQuery, setDocumentQuery] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("Todos");
  const [tagFilter, setTagFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("Todas as equipes");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [ocrQuery, setOcrQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docDraft, setDocDraft] = useState<Doc | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [folderPermissions, setFolderPermissions] = useState<Record<string, PermissionSet>>(initialFolderPermissions);
  const [docExceptions, setDocExceptions] = useState<Record<string, PermissionSet>>(initialDocExceptions);
  const [selectedFolderPermissionsId, setSelectedFolderPermissionsId] = useState<string | null>(null);
  const [newExceptionTeam, setNewExceptionTeam] = useState("");
  const [newExceptionUser, setNewExceptionUser] = useState("");
  const [folderTeamQuery, setFolderTeamQuery] = useState("");
  const [folderUserQuery, setFolderUserQuery] = useState("");
  const [newFolderTeam, setNewFolderTeam] = useState("");
  const [newFolderUser, setNewFolderUser] = useState("");
  const [showDocTypes, setShowDocTypes] = useState(false);
  const [newDocTypeName, setNewDocTypeName] = useState("");
  const [newDocTypeFields, setNewDocTypeFields] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = 6;
  const retentionDays = 120;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const sortByName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });

  const sortedTeams = useMemo(
    () => [...teamsList].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" })),
    []
  );

  const sortedUsers = useMemo(
    () => [...usersList].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })),
    []
  );

  const sortedDocumentTypes = useMemo(() => [...documentTypes].sort(sortByName), [documentTypes]);

  const sortedFolders = useMemo(() => [...folders].sort(sortByName), [folders]);

  const ownerTeamMap = useMemo(
    () =>
      usersList.reduce<Record<string, string>>((acc, user) => {
        acc[user.name] = user.team;
        return acc;
      }, {}),
    []
  );

  const getOwnerTeam = (owner: string) => ownerTeamMap[owner] || "Equipe não informada";

  const selectedDoc = useMemo(
    () => documents.find((doc) => doc.id === selectedDocId) || null,
    [documents, selectedDocId]
  );

  useEffect(() => {
    if (selectedDoc) {
      setDocDraft(selectedDoc);
      setEditMode(false);
      setNewExceptionTeam("");
      setNewExceptionUser("");
    }
  }, [selectedDoc]);

  useEffect(() => {
    const docIdParam = searchParams.get("docId");
    if (!docIdParam) return;
    const targetDoc = documents.find((doc) => doc.id === docIdParam);
    if (targetDoc) {
      setActiveFolder(targetDoc.folderId || null);
      setSelectedDocId(targetDoc.id);
    } else {
      showToast("Documento não encontrado na listagem atual.");
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("docId");
    setSearchParams(nextParams, { replace: true });
  }, [documents, searchParams, setSearchParams]);

  const filteredFolders = useMemo(() => {
    return folders
      .filter((folder) => folder.name.toLowerCase().includes(folderQuery.toLowerCase()))
      .sort(sortByName);
  }, [folders, folderQuery]);

  const statusMap: Record<string, Doc["status"]> = {
    Ativo: "active",
    Restaurado: "restored",
    "Na lixeira": "trashed",
  };

  const baseDocs = useMemo(() => {
    if (statusFilter === "Todos") {
      return documents.filter((doc) => doc.status !== "trashed");
    }
    return documents.filter((doc) => doc.status === statusMap[statusFilter]);
  }, [documents, statusFilter]);

  const documentSearchTerm = documentQuery.trim().toLowerCase();

  const filteredDocs = useMemo(() => {
    let result = baseDocs;
    if (activeFolder) {
      result = result.filter((d) => d.folderId === activeFolder);
    }
    if (documentSearchTerm) {
      result = result.filter((d) => {
        const matchesName = d.name.toLowerCase().includes(documentSearchTerm);
        const matchesId = d.id.toLowerCase().includes(documentSearchTerm);
        const matchesTag = d.tags.some((tag) => tag.toLowerCase().includes(documentSearchTerm));
        return matchesName || matchesId || matchesTag;
      });
    }
    if (docTypeFilter !== "Todos") {
      result = result.filter((d) => d.documentTypeId === docTypeFilter);
    }
    if (ttdFilter !== "Todos") {
      result = result.filter((d) => d.ttd === ttdFilter);
    }
    if (tagFilter.trim()) {
      const term = tagFilter.toLowerCase();
      result = result.filter((d) => d.tags.some((tag) => tag.toLowerCase().includes(term)));
    }
    if (ownerFilter.trim()) {
      const term = ownerFilter.toLowerCase();
      result = result.filter((d) => d.owner.toLowerCase().includes(term));
    }
    if (teamFilter !== "Todas as equipes") {
      result = result.filter((d) => getOwnerTeam(d.owner) === teamFilter);
    }
    if (ocrQuery.trim()) {
      const term = ocrQuery.toLowerCase();
      result = result.filter(
        (d) => d.ocrStatus === "indexado" && (d.ocrContent || "").toLowerCase().includes(term)
      );
    }
    return [...result].sort(sortByName);
  }, [
    baseDocs,
    activeFolder,
    documentSearchTerm,
    docTypeFilter,
    ttdFilter,
    tagFilter,
    ownerFilter,
    teamFilter,
    ocrQuery,
  ]);

  const showFolders = statusFilter !== "Na lixeira";

  const listFolders = useMemo(() => {
    if (!showFolders) return [];
    let result = filteredFolders;
    if (activeFolder) {
      result = result.filter((folder) => folder.parentId === activeFolder);
    } else if (!documentSearchTerm) {
      result = result.filter((folder) => folder.parentId === null);
    }
    if (documentSearchTerm) {
      result = result.filter((folder) => folder.name.toLowerCase().includes(documentSearchTerm));
    }
    return [...result].sort(sortByName);
  }, [filteredFolders, activeFolder, showFolders, documentSearchTerm]);

  const combinedItems = [
    ...listFolders.map((folder) => ({ kind: "folder" as const, data: folder })),
    ...filteredDocs.map((doc) => ({ kind: "doc" as const, data: doc })),
  ];

  const totalPages = Math.max(1, Math.ceil(combinedItems.length / pageSize));
  const paginatedItems = combinedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFolder, ttdFilter, folderQuery, documentQuery, docTypeFilter, tagFilter, ownerFilter, teamFilter, statusFilter, ocrQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const applyFilters = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowFilters(false);
      showToast("Filtros aplicados (simulado)");
    }, 600);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      showToast("Informe o nome da pasta");
      return;
    }

    const parentId = showFolderModal === "sub" ? activeFolder : newFolderParent;
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim(),
      parentId: parentId || null,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      owner: "Usuário atual",
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setNewFolderParent(null);
    setShowFolderModal(null);
    showToast("Pasta criada (simulado)");
  };

  const handleUpload = () => {
    if (!uploadFileName || !uploadFolderId) {
      showToast("Selecione o arquivo e a pasta");
      return;
    }

    const extension = uploadFileName.split(".").pop()?.toUpperCase() || "ARQ";
    const now = formatDate();
    const supportsOcr = ["PDF", "PNG", "JPG", "JPEG", "TIFF"].includes(extension);
    const newDoc: Doc = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      name: uploadFileName,
      folderId: uploadFolderId,
      size: "—",
      type: extension,
      version: 1,
      versions: [{ version: 1, author: "Usuário atual", date: now }],
      ttd: "Corrente - 5 anos",
      createdAt: now,
      updatedAt: now,
      owner: "Usuário atual",
      status: "active",
      documentTypeId: documentTypes[0]?.id || "dt-contrato",
      tags: [],
      metadata: {},
      ocrStatus: supportsOcr ? "pendente" : "processado",
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadFileName("");
    setUploadFolderId(null);
    setShowUpload(false);
    showToast("Upload iniciado (simulado)");
  };

  const handleTrashDoc = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, status: "trashed", updatedAt: formatDate() } : doc
      )
    );
    setSelectedDocId(null);
    showToast("Documento movido para lixeira");
  };

  const handleRestoreDoc = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, status: "restored", updatedAt: formatDate() } : doc
      )
    );
    showToast("Documento restaurado");
  };

  const handleRestoreVersion = (docId: string, version: number) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              version,
              status: "restored",
              updatedAt: formatDate(),
            }
          : doc
      )
    );
    showToast(`Versão restaurada para V.${version}`);
  };

  const saveDocEdits = () => {
    if (!docDraft) return;
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docDraft.id ? { ...doc, ...docDraft, updatedAt: formatDate() } : doc
      )
    );
    setEditMode(false);
    showToast("Metadados atualizados (simulado)");
  };

  const getFolderCount = (folderId: string) =>
    documents.filter((doc) => doc.folderId === folderId && doc.status !== "trashed").length;

  const rootFolders = filteredFolders.filter((folder) => folder.parentId === null);
  const subFoldersMap = useMemo(() => {
    const map = filteredFolders.reduce<Record<string, Folder[]>>((acc, folder) => {
      if (folder.parentId) {
        acc[folder.parentId] = acc[folder.parentId] || [];
        acc[folder.parentId].push(folder);
      }
      return acc;
    }, {});

    Object.keys(map).forEach((key) => {
      map[key] = map[key].sort(sortByName);
    });

    return map;
  }, [filteredFolders]);

  const getStatusLabel = (status: Doc["status"]) => {
    if (status === "trashed") return "Na lixeira";
    if (status === "restored") return "Restaurado";
    return "Ativo";
  };

  const getStatusBadgeClass = (status: Doc["status"]) => {
    if (status === "restored") return "bg-amber-100 text-amber-700";
    if (status === "trashed") return "bg-rose-100 text-rose-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getOcrLabel = (status: OcrStatus) => {
    if (status === "indexado") return "OCR indexado";
    if (status === "processado") return "OCR processado";
    return "OCR pendente";
  };

  const getOcrBadgeClass = (status: OcrStatus) => {
    if (status === "indexado") return "bg-primary/10 text-primary";
    if (status === "processado") return "bg-amber-100 text-amber-700";
    return "bg-muted text-muted-foreground";
  };

  const getDocTypeName = (docTypeId: string) =>
    documentTypes.find((type) => type.id === docTypeId)?.name || "Tipo não definido";

  const confirmCopy = () => {
    if (!confirmAction) return { title: "Confirmar", message: "Deseja prosseguir?", confirmLabel: "Confirmar" };
    if (confirmAction.type === "trash") {
      return {
        title: "Mover para lixeira",
        message: "Este documento será removido e ficará disponível na lixeira.",
        confirmLabel: "Mover",
      };
    }
    if (confirmAction.type === "restoreDoc") {
      return {
        title: "Restaurar documento",
        message: "O documento será restaurado e voltará para a listagem ativa.",
        confirmLabel: "Restaurar",
      };
    }
    return {
      title: "Restaurar versão",
      message: `Deseja restaurar a versão V.${confirmAction.version}?`,
      confirmLabel: "Restaurar versão",
    };
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "trash") {
      handleTrashDoc(confirmAction.docId);
    }
    if (confirmAction.type === "restoreDoc") {
      handleRestoreDoc(confirmAction.docId);
    }
    if (confirmAction.type === "restoreVersion") {
      handleRestoreVersion(confirmAction.docId, confirmAction.version);
    }
    setConfirmAction(null);
  };

  const togglePermission = (current: PermissionKey[], key: PermissionKey) =>
    current.includes(key) ? current.filter((item) => item !== key) : [...current, key];

  const updateFolderPermission = (folderId: string, scope: "teams" | "users", name: string, key: PermissionKey) => {
    setFolderPermissions((prev) => {
      const current = prev[folderId] || { teams: {}, users: {} };
      const scopeMap = current[scope] || {};
      const updatedList = togglePermission(scopeMap[name] || [], key);
      return {
        ...prev,
        [folderId]: {
          ...current,
          [scope]: { ...scopeMap, [name]: updatedList },
        },
      };
    });
    showToast("Permissões da pasta atualizadas (simulado)");
  };

  const addFolderAccess = (folderId: string, scope: "teams" | "users", name: string) => {
    if (!name) return;
    setFolderPermissions((prev) => {
      const current = prev[folderId] || { teams: {}, users: {} };
      if ((current[scope] || {})[name]) return prev;
      return {
        ...prev,
        [folderId]: {
          ...current,
          [scope]: { ...current[scope], [name]: ["visualizar"] },
        },
      };
    });
    showToast("Acesso adicionado (simulado)");
  };

  const removeFolderAccess = (folderId: string, scope: "teams" | "users", name: string) => {
    setFolderPermissions((prev) => {
      const current = prev[folderId] || { teams: {}, users: {} };
      const scopeMap = { ...(current[scope] || {}) };
      delete scopeMap[name];
      return {
        ...prev,
        [folderId]: {
          ...current,
          [scope]: scopeMap,
        },
      };
    });
    showToast("Acesso removido (simulado)");
  };

  const updateDocException = (docId: string, scope: "teams" | "users", name: string, key: PermissionKey) => {
    setDocExceptions((prev) => {
      const current = prev[docId] || { teams: {}, users: {} };
      const scopeMap = current[scope] || {};
      const updatedList = togglePermission(scopeMap[name] || [], key);
      return {
        ...prev,
        [docId]: {
          ...current,
          [scope]: { ...scopeMap, [name]: updatedList },
        },
      };
    });
    showToast("Exceção do documento atualizada (simulado)");
  };

  const removeDocException = (docId: string, scope: "teams" | "users", name: string) => {
    setDocExceptions((prev) => {
      const current = prev[docId] || { teams: {}, users: {} };
      const scopeMap = { ...(current[scope] || {}) };
      delete scopeMap[name];
      return {
        ...prev,
        [docId]: {
          ...current,
          [scope]: scopeMap,
        },
      };
    });
    showToast("Exceção removida (simulado)");
  };

  const addDocException = (docId: string, scope: "teams" | "users", name: string) => {
    if (!name) return;
    setDocExceptions((prev) => {
      const current = prev[docId] || { teams: {}, users: {} };
      if ((current[scope] || {})[name]) return prev;
      return {
        ...prev,
        [docId]: {
          ...current,
          [scope]: { ...current[scope], [name]: ["visualizar"] },
        },
      };
    });
    showToast("Exceção adicionada (simulado)");
  };

  const selectedFolder = selectedFolderPermissionsId
    ? folders.find((folder) => folder.id === selectedFolderPermissionsId)
    : null;

  const selectedFolderPermissions = selectedFolder ? folderPermissions[selectedFolder.id] || { teams: {}, users: {} } : null;

  const docFolderPermissions = selectedDoc?.folderId
    ? folderPermissions[selectedDoc.folderId] || { teams: {}, users: {} }
    : { teams: {}, users: {} };

  const docExceptionsData = selectedDoc ? docExceptions[selectedDoc.id] || { teams: {}, users: {} } : { teams: {}, users: {} };

  const teamsWithAccess = selectedFolderPermissions ? Object.keys(selectedFolderPermissions.teams) : [];
  const usersWithAccess = selectedFolderPermissions ? Object.keys(selectedFolderPermissions.users) : [];

  const filteredTeamsWithAccess = teamsWithAccess
    .filter((team) => team.toLowerCase().includes(folderTeamQuery.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

  const filteredUsersWithAccess = usersList
    .filter((user) => {
      if (!usersWithAccess.includes(user.name)) return false;
      const query = folderUserQuery.toLowerCase();
      if (!query) return true;
      return user.name.toLowerCase().includes(query) || user.team.toLowerCase().includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));

  const handleCreateDocType = () => {
    if (!newDocTypeName.trim()) {
      showToast("Informe o nome do tipo documental");
      return;
    }
    const fields = newDocTypeFields
      .split(",")
      .map((field) => field.trim())
      .filter(Boolean)
      .map((field) => ({
        key: field.toLowerCase().replace(/\s+/g, "_"),
        label: field,
        type: "texto" as const,
      }));
    const newType: DocumentType = {
      id: `dt-${Date.now()}`,
      name: newDocTypeName.trim(),
      fields,
    };
    setDocumentTypes((prev) => [newType, ...prev]);
    setNewDocTypeName("");
    setNewDocTypeFields("");
    showToast("Tipo documental cadastrado (simulado)");
  };

  const activeFolderName = activeFolder ? folders.find((folder) => folder.id === activeFolder)?.name : null;
  const searchScopeLabel = activeFolderName
    ? `Pasta atual: ${activeFolderName}`
    : "Todos os documentos e pastas";

  const hasActiveFilters =
    !!documentQuery.trim() ||
    docTypeFilter !== "Todos" ||
    ttdFilter !== "Todos" ||
    !!tagFilter.trim() ||
    !!ownerFilter.trim() ||
    teamFilter !== "Todas as equipes" ||
    statusFilter !== "Todos" ||
    !!ocrQuery.trim();

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary text-sm px-4 py-2">
          {toast}
        </div>
      )}
      <PageHeader
        title="Documentos"
        description="Gerencie e organize seus documentos"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(true)}>
              <Filter className="h-4 w-4" /> Filtros
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowDocTypes(true)}>
              Tipos documentais
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowTrash(true)}>
              <Trash2 className="h-4 w-4" /> Lixeira
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder tree */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-lg shadow-card p-4"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar pasta..."
              value={folderQuery}
              onChange={(e) => setFolderQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2 px-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setShowFolderModal("root");
                setNewFolderParent(null);
              }}
            >
              <FolderPlus className="h-4 w-4" /> Nova pasta
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                if (!activeFolder) {
                  showToast("Selecione uma pasta para criar subpasta");
                  return;
                }
                setShowFolderModal("sub");
              }}
            >
              <FolderPlus className="h-4 w-4" /> Nova subpasta
            </Button>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveFolder(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                !activeFolder ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> Todos
              </span>
              <span className="tabular-nums text-xs">{documents.filter((doc) => doc.status !== "trashed").length}</span>
            </button>
            {filteredFolders.length === 0 && (
              <div className="text-xs text-muted-foreground px-3 py-2">Nenhuma pasta encontrada</div>
            )}
            {rootFolders.map((folder) => (
              <div key={folder.id}>
                <button
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    activeFolder === folder.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" /> {folder.name}
                  </span>
                  <span className="tabular-nums text-xs">{getFolderCount(folder.id)}</span>
                </button>
                {subFoldersMap[folder.id]?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveFolder(sub.id)}
                    className={`w-full flex items-center justify-between px-6 py-1.5 rounded-md text-xs transition-colors ${
                      activeFolder === sub.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="h-3.5 w-3.5" /> {sub.name}
                    </span>
                    <span className="tabular-nums text-[10px]">{getFolderCount(sub.id)}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </motion.div>

        {/* Document list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="lg:col-span-3 bg-card rounded-lg shadow-card overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1 w-full md:w-72">
              <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={documentQuery}
                  onChange={(e) => setDocumentQuery(e.target.value)}
                  placeholder="Buscar por nome, ID ou tag"
                  className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
                />
              </div>
              <span className="text-[11px] text-muted-foreground">Escopo: {searchScopeLabel}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Busca avançada por tipo, equipe, responsável, status e OCR nos filtros.
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">Item</th>
                  <th className="text-left px-5 py-3 font-medium">Tipo documental / TTD</th>
                  <th className="text-left px-5 py-3 font-medium">Tamanho</th>
                  <th className="text-left px-5 py-3 font-medium">Versão</th>
                  <th className="text-left px-5 py-3 font-medium">Atualizado</th>
                  <th className="text-right px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-sm text-muted-foreground text-center">
                      Carregando documentos...
                    </td>
                  </tr>
                )}
                {!loading && paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-sm text-muted-foreground text-center">
                      {hasActiveFilters
                        ? "Nenhum resultado encontrado para a busca aplicada."
                        : "Nenhum documento ou pasta encontrado"}
                    </td>
                  </tr>
                )}
                {!loading &&
                  paginatedItems.map((item) =>
                    item.kind === "folder" ? (
                      <tr
                        key={item.data.id}
                        onClick={() => setActiveFolder(item.data.id)}
                        className="group hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-0 cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-foreground block truncate max-w-[280px]">
                                {item.data.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Pasta</span>
                                <span className="px-2 py-0.5 text-[10px] bg-muted text-muted-foreground rounded-full">
                                  Arquivo
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">Pasta</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">—</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">—</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{item.data.updatedAt}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFolderPermissionsId(item.data.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted rounded-md transition-all"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={item.data.id}
                        onClick={() => setSelectedDocId(item.data.id)}
                        className="group hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-0 cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-foreground block truncate max-w-[280px]">
                                {item.data.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground font-mono">{item.data.id}</span>
                                <span className="px-2 py-0.5 text-[10px] uppercase bg-muted text-muted-foreground rounded-full">
                                  {item.data.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">
                          <div className="text-sm text-foreground font-medium">{getDocTypeName(item.data.documentTypeId)}</div>
                          <div className="text-xs text-muted-foreground">{item.data.ttd}</div>
                          <div className="text-[11px] text-muted-foreground mt-1">Equipe: {getOwnerTeam(item.data.owner)}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.data.tags.slice(0, 2).map((tag) => (
                              <span key={`${item.data.id}-${tag}`} className="px-2 py-0.5 text-[10px] bg-muted rounded-full">
                                {tag}
                              </span>
                            ))}
                            <span className={`px-2 py-0.5 text-[10px] rounded-full ${getOcrBadgeClass(item.data.ocrStatus)}`}>
                              {getOcrLabel(item.data.ocrStatus)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground tabular-nums">{item.data.size}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                              V.{item.data.version}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${getStatusBadgeClass(
                                item.data.status
                              )}`}
                            >
                              {getStatusLabel(item.data.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{item.data.updatedAt}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted rounded-md transition-all"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando {paginatedItems.length} de {combinedItems.length} itens
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
      </div>

      {showFilters && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Busca avançada</h3>
            <p className="text-xs text-muted-foreground mb-4">Combine filtros para refinar a listagem.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Tipo documental</label>
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="Todos">Todos</option>
                  {sortedDocumentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Categoria de temporalidade (TTD)</label>
                <select
                  value={ttdFilter}
                  onChange={(e) => setTtdFilter(e.target.value)}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option>Todos</option>
                  <option>Corrente - 5 anos</option>
                  <option>Corrente - 2 anos</option>
                  <option>Intermediário - 10 anos</option>
                  <option>Permanente</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Equipe responsável</label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option>Todas as equipes</option>
                  {sortedTeams.map((team) => (
                    <option key={team}>{team}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tags</label>
                <input
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  placeholder="Ex: jurídico, acervo"
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Responsável</label>
                <input
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  placeholder="Nome do responsável"
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option>Todos</option>
                  <option>Ativo</option>
                  <option>Restaurado</option>
                  <option>Na lixeira</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Conteúdo OCR</label>
                <input
                  value={ocrQuery}
                  onChange={(e) => setOcrQuery(e.target.value)}
                  placeholder="Buscar por conteúdo indexado"
                  className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDocTypes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Tipos documentais e metadados</h3>
              <p className="text-xs text-muted-foreground mb-4">Configure modelos com campos personalizados (simulado).</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {documentTypes.map((type) => (
                    <div key={type.id} className="border border-border rounded-md p-3">
                      <p className="text-sm font-semibold text-foreground">{type.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {type.fields.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Sem campos personalizados</span>
                        ) : (
                          type.fields.map((field) => (
                            <span key={`${type.id}-${field.key}`} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                              {field.label}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border border-border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Novo tipo documental</h4>
                  <div className="space-y-3">
                    <input
                      value={newDocTypeName}
                      onChange={(e) => setNewDocTypeName(e.target.value)}
                      placeholder="Nome do tipo"
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                    />
                    <input
                      value={newDocTypeFields}
                      onChange={(e) => setNewDocTypeFields(e.target.value)}
                      placeholder="Campos (separados por vírgula)"
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Exemplo: Número do contrato, Vigência, Fornecedor
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={handleCreateDocType}>
                      Adicionar tipo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowDocTypes(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Upload de documento</h3>
            <p className="text-xs text-muted-foreground mb-4">Fluxo simulado de envio de arquivo.</p>
            <div className="space-y-3">
              <input
                type="file"
                className="w-full text-sm"
                onChange={(e) => setUploadFileName(e.target.files?.[0]?.name || "")}
              />
              <select
                value={uploadFolderId || ""}
                onChange={(e) => setUploadFolderId(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">Selecionar pasta</option>
                {sortedFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowUpload(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleUpload}>
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {showFolderModal === "sub" ? "Nova subpasta" : "Nova pasta"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Crie uma nova pasta para organizar documentos.</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome da pasta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              {showFolderModal === "root" && (
                <select
                  value={newFolderParent || ""}
                  onChange={(e) => setNewFolderParent(e.target.value || null)}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Sem pasta pai</option>
                  {sortedFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              )}
              {showFolderModal === "sub" && activeFolder && (
                <div className="text-xs text-muted-foreground">
                  Criando dentro de: <strong>{folders.find((f) => f.id === activeFolder)?.name}</strong>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFolderModal(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleCreateFolder}>
                Criar
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedFolder && selectedFolderPermissions && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Permissões da pasta</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Controle de acesso por equipe e usuário com herança para documentos.
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-4">
              <div className="border border-border rounded-md p-4 mb-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedFolder.name}</p>
                  <p className="text-xs text-muted-foreground">Última atualização: {selectedFolder.updatedAt}</p>
                </div>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                  <li>O papel do usuário (Admin, Editor, Arquivista, Visualizador) não libera acesso automático a todas as pastas.</li>
                  <li>A regra base é definida pela equipe; ela é herdada pelos documentos desta pasta.</li>
                  <li>Permissões individuais são exceções ou ajustes finos sobre a regra base.</li>
                </ul>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">Regra base (Equipe)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Exceção direta (Usuário)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground">Equipes com acesso (regra base)</h4>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar equipe"
                        value={folderTeamQuery}
                        onChange={(e) => setFolderTeamQuery(e.target.value)}
                        className="bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {filteredTeamsWithAccess.length === 0 && (
                      <div className="text-xs text-muted-foreground">Nenhuma equipe com acesso direto.</div>
                    )}
                    {filteredTeamsWithAccess.map((team) => (
                      <div key={`folder-team-${team}`} className="border border-border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{team}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Regra base</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFolderAccess(selectedFolder.id, "teams", team)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permissionOptions.map((permission) => (
                            <label key={`${team}-${permission.key}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <input
                                type="checkbox"
                                checked={(selectedFolderPermissions.teams[team] || []).includes(permission.key)}
                                onChange={() => updateFolderPermission(selectedFolder.id, "teams", team, permission.key)}
                                className="h-4 w-4"
                              />
                              {permission.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="border border-dashed border-border rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-2">Adicionar equipe com acesso</p>
                      <div className="flex items-center gap-2">
                        <select
                          value={newFolderTeam}
                          onChange={(e) => setNewFolderTeam(e.target.value)}
                          className="border border-border rounded-md px-2 py-1 text-xs bg-background w-full"
                        >
                          <option value="">Selecionar equipe</option>
                          {sortedTeams
                            .filter((team) => !selectedFolderPermissions.teams[team])
                            .map((team) => (
                              <option key={`folder-team-add-${team}`} value={team}>
                                {team}
                              </option>
                            ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => {
                            addFolderAccess(selectedFolder.id, "teams", newFolderTeam);
                            setNewFolderTeam("");
                          }}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground">Usuários com acesso direto (exceções)</h4>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar usuário ou equipe"
                        value={folderUserQuery}
                        onChange={(e) => setFolderUserQuery(e.target.value)}
                        className="bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {filteredUsersWithAccess.length === 0 && (
                      <div className="text-xs text-muted-foreground">Nenhum usuário com exceção configurada.</div>
                    )}
                    {filteredUsersWithAccess.map((user) => {
                      const teamBase = selectedFolderPermissions.teams[user.team] || [];
                      return (
                        <div key={`folder-user-${user.name}`} className="border border-border rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-medium text-foreground">{user.name}</span>
                              <div className="text-[11px] text-muted-foreground">{user.team} · {user.role}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Exceção</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFolderAccess(selectedFolder.id, "users", user.name)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                          <div className="mb-3">
                            <p className="text-[11px] text-muted-foreground mb-1">Regra base da equipe</p>
                            {teamBase.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground">Sem regra base para a equipe.</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {teamBase.map((perm) => (
                                  <span key={`${user.name}-base-${perm}`} className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full">
                                    {permissionOptions.find((p) => p.key === perm)?.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissionOptions.map((permission) => (
                              <label key={`${user.name}-${permission.key}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                  type="checkbox"
                                  checked={(selectedFolderPermissions.users[user.name] || []).includes(permission.key)}
                                  onChange={() => updateFolderPermission(selectedFolder.id, "users", user.name, permission.key)}
                                  className="h-4 w-4"
                                />
                                {permission.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <div className="border border-dashed border-border rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-2">Adicionar exceção por usuário</p>
                      <div className="flex items-center gap-2">
                        <select
                          value={newFolderUser}
                          onChange={(e) => setNewFolderUser(e.target.value)}
                          className="border border-border rounded-md px-2 py-1 text-xs bg-background w-full"
                        >
                          <option value="">Selecionar usuário</option>
                          {sortedUsers
                            .filter((user) => !selectedFolderPermissions.users[user.name])
                            .map((user) => (
                              <option key={`folder-user-add-${user.name}`} value={user.name}>
                                {user.name} · {user.team}
                              </option>
                            ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => {
                            addFolderAccess(selectedFolder.id, "users", newFolderUser);
                            setNewFolderUser("");
                          }}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  Documentos herdam permissões da pasta, salvo exceções específicas no documento.
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  Compartilhamento externo está preparado e será disponibilizado em breve.
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedFolderPermissionsId(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedDoc && docDraft && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-4xl p-6 max-h-[90vh] flex flex-col">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Detalhe do documento</h3>
              <p className="text-xs text-muted-foreground mb-4">Visualize e edite os metadados básicos.</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nome</span>
                  {editMode ? (
                    <input
                      value={docDraft.name}
                      onChange={(e) => setDocDraft({ ...docDraft, name: e.target.value })}
                      className="border border-border rounded-md px-2 py-1 text-sm bg-background"
                    />
                  ) : (
                    <span className="font-medium">{selectedDoc.name}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipo documental</span>
                  {editMode ? (
                    <select
                      value={docDraft.documentTypeId}
                      onChange={(e) => setDocDraft({ ...docDraft, documentTypeId: e.target.value })}
                      className="border border-border rounded-md px-2 py-1 text-sm bg-background"
                    >
                      {sortedDocumentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-medium">{getDocTypeName(selectedDoc.documentTypeId)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Formato</span>
                  {editMode ? (
                    <input
                      value={docDraft.type}
                      onChange={(e) => setDocDraft({ ...docDraft, type: e.target.value })}
                      className="border border-border rounded-md px-2 py-1 text-sm bg-background"
                    />
                  ) : (
                    <span className="font-medium">{selectedDoc.type}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">TTD</span>
                  <span className="font-medium">{selectedDoc.ttd}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tamanho</span>
                  <span className="font-medium">{selectedDoc.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Versão atual</span>
                  <span className="font-medium">V.{selectedDoc.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedDoc.status)}`}>
                    {getStatusLabel(selectedDoc.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">OCR</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getOcrBadgeClass(selectedDoc.ocrStatus)}`}>
                    {getOcrLabel(selectedDoc.ocrStatus)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Criado em</span>
                  <span className="font-medium">{selectedDoc.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Atualizado em</span>
                  <span className="font-medium">{selectedDoc.updatedAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Responsável</span>
                  {editMode ? (
                    <input
                      value={docDraft.owner}
                      onChange={(e) => setDocDraft({ ...docDraft, owner: e.target.value })}
                      className="border border-border rounded-md px-2 py-1 text-sm bg-background"
                    />
                  ) : (
                    <span className="font-medium">{selectedDoc.owner}</span>
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Tags</span>
                  {editMode ? (
                    <input
                      value={docDraft.tags.join(", ")}
                      onChange={(e) =>
                        setDocDraft({
                          ...docDraft,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean),
                        })
                      }
                      className="border border-border rounded-md px-2 py-1 text-sm bg-background w-72"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {selectedDoc.tags.map((tag) => (
                        <span key={`${selectedDoc.id}-tag-${tag}`} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Metadados personalizados</h4>
                <p className="text-xs text-muted-foreground mb-4">Campos definidos pelo tipo documental.</p>
                <div className="space-y-2">
                  {(documentTypes.find((type) => type.id === docDraft.documentTypeId)?.fields || []).length === 0 && (
                    <div className="text-xs text-muted-foreground">Nenhum campo personalizado configurado.</div>
                  )}
                  {(documentTypes.find((type) => type.id === docDraft.documentTypeId)?.fields || []).map((field) => (
                    <div key={`${selectedDoc.id}-${field.key}`} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{field.label}</span>
                      {editMode ? (
                        <input
                          value={docDraft.metadata[field.key] || ""}
                          onChange={(e) =>
                            setDocDraft({
                              ...docDraft,
                              metadata: { ...docDraft.metadata, [field.key]: e.target.value },
                            })
                          }
                          className="border border-border rounded-md px-2 py-1 text-sm bg-background"
                        />
                      ) : (
                        <span className="font-medium">{selectedDoc.metadata[field.key] || "—"}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Conteúdo OCR</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedDoc.ocrStatus === "indexado"
                    ? "Conteúdo indexado disponível (simulado)."
                    : "OCR em processamento ou pendente para este documento."}
                </p>
                {selectedDoc.ocrStatus === "indexado" && (
                  <div className="text-sm text-muted-foreground border border-border rounded-md p-3 bg-muted/30">
                    {selectedDoc.ocrContent}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Permissões</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Permissões herdadas da pasta e exceções aplicadas ao documento.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Herdadas da pasta {folders.find((f) => f.id === selectedDoc.folderId)?.name || "(sem pasta)"}
                    </p>
                    <div className="space-y-2">
                      {Object.keys(docFolderPermissions.teams).length === 0 &&
                        Object.keys(docFolderPermissions.users).length === 0 && (
                          <div className="text-xs text-muted-foreground">Nenhuma permissão herdada configurada.</div>
                        )}
                      {Object.entries(docFolderPermissions.teams).map(([team, perms]) => (
                        <div key={`doc-inherit-team-${team}`} className="border border-border rounded-md px-3 py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">Equipe {team}</p>
                            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Herdado</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {perms.map((perm) => (
                              <span key={`${team}-${perm}`} className="px-2 py-0.5 bg-muted text-[11px] rounded-full">
                                {permissionOptions.find((p) => p.key === perm)?.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {Object.entries(docFolderPermissions.users).map(([user, perms]) => (
                        <div key={`doc-inherit-user-${user}`} className="border border-border rounded-md px-3 py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">Usuário {user}</p>
                            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Herdado</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {perms.map((perm) => (
                              <span key={`${user}-${perm}`} className="px-2 py-0.5 bg-muted text-[11px] rounded-full">
                                {permissionOptions.find((p) => p.key === perm)?.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Exceções do documento</p>
                    <div className="space-y-2">
                      {Object.keys(docExceptionsData.teams).length === 0 &&
                        Object.keys(docExceptionsData.users).length === 0 && (
                          <div className="text-xs text-muted-foreground">Nenhuma exceção configurada.</div>
                        )}

                      {Object.entries(docExceptionsData.teams).map(([team, perms]) => (
                        <div key={`doc-exc-team-${team}`} className="border border-border rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">Equipe {team}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Exceção</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => removeDocException(selectedDoc.id, "teams", team)}>
                              Remover
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissionOptions.map((permission) => (
                              <label key={`${team}-${permission.key}-exc`} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                  type="checkbox"
                                  checked={perms.includes(permission.key)}
                                  onChange={() => updateDocException(selectedDoc.id, "teams", team, permission.key)}
                                  className="h-4 w-4"
                                />
                                {permission.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      {Object.entries(docExceptionsData.users).map(([user, perms]) => (
                        <div key={`doc-exc-user-${user}`} className="border border-border rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">Usuário {user}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Exceção</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => removeDocException(selectedDoc.id, "users", user)}>
                              Remover
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissionOptions.map((permission) => (
                              <label key={`${user}-${permission.key}-exc`} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                  type="checkbox"
                                  checked={perms.includes(permission.key)}
                                  onChange={() => updateDocException(selectedDoc.id, "users", user, permission.key)}
                                  className="h-4 w-4"
                                />
                                {permission.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-border rounded-md p-3">
                        <p className="text-xs text-muted-foreground mb-2">Adicionar exceção por equipe</p>
                        <div className="flex items-center gap-2">
                          <select
                            value={newExceptionTeam}
                            onChange={(e) => setNewExceptionTeam(e.target.value)}
                            className="border border-border rounded-md px-2 py-1 text-xs bg-background w-full"
                          >
                            <option value="">Selecionar equipe</option>
                            {sortedTeams
                              .filter((team) => !docExceptionsData.teams[team])
                              .map((team) => (
                                <option key={`team-exc-${team}`} value={team}>
                                  {team}
                                </option>
                              ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => {
                              addDocException(selectedDoc.id, "teams", newExceptionTeam);
                              setNewExceptionTeam("");
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                      <div className="border border-border rounded-md p-3">
                        <p className="text-xs text-muted-foreground mb-2">Adicionar exceção por usuário</p>
                        <div className="flex items-center gap-2">
                          <select
                            value={newExceptionUser}
                            onChange={(e) => setNewExceptionUser(e.target.value)}
                            className="border border-border rounded-md px-2 py-1 text-xs bg-background w-full"
                          >
                            <option value="">Selecionar usuário</option>
                            {sortedUsers
                              .filter((user) => !docExceptionsData.users[user.name])
                              .map((user) => (
                                <option key={`user-exc-${user.name}`} value={user.name}>
                                  {user.name}
                                </option>
                              ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => {
                              addDocException(selectedDoc.id, "users", newExceptionUser);
                              setNewExceptionUser("");
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    Compartilhamento externo permanece preparado (em breve).
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Histórico de versões</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDoc.versions.map((entry) => (
                    <div
                      key={`${selectedDoc.id}-v-${entry.version}`}
                      className="flex items-center justify-between border border-border rounded-md px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium">V.{entry.version}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.date} · {entry.author}
                        </div>
                      </div>
                      {selectedDoc.version === entry.version ? (
                        <span className="text-xs font-semibold text-primary">Atual</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setConfirmAction({
                              type: "restoreVersion",
                              docId: selectedDoc.id,
                              version: entry.version,
                            })
                          }
                        >
                          Restaurar versão
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction({ type: "trash", docId: selectedDoc.id })}>
                Mover para lixeira
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDocId(null)}>
                  Fechar
                </Button>
                {editMode ? (
                  <Button size="sm" onClick={saveDocEdits}>
                    Salvar
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setEditMode(true)}>
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrash && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Lixeira</h3>
            <p className="text-xs text-muted-foreground mb-1">Itens removidos aguardando restauração dentro do prazo definido.</p>
            <p className="text-[11px] text-muted-foreground mb-4">Documentos excluídos podem ser restaurados por até {retentionDays} dias.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {documents.filter((doc) => doc.status === "trashed").length === 0 && (
                <div className="text-xs text-muted-foreground">Nenhum documento na lixeira.</div>
              )}
              {documents
                .filter((doc) => doc.status === "trashed")
                .sort(sortByName)
                .map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Removido em {doc.updatedAt} · {doc.owner}
                      </div>
                      <div className="text-[11px] text-muted-foreground">Restaurável por até {retentionDays} dias</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setConfirmAction({ type: "restoreDoc", docId: doc.id })}>
                      Restaurar
                    </Button>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowTrash(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-elevated w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">{confirmCopy().title}</h3>
            <p className="text-xs text-muted-foreground mb-4">{confirmCopy().message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                {confirmCopy().confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
