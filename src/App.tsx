import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import DocumentosPage from "@/pages/DocumentosPage";
import EquipesPage from "@/pages/EquipesPage";
import UsuariosPage from "@/pages/UsuariosPage";
import AuditoriaPage from "@/pages/AuditoriaPage";
import RelatoriosPage from "@/pages/RelatoriosPage";
import ConfiguracoesPage from "@/pages/ConfiguracoesPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/documentos" element={<DocumentosPage />} />
            <Route path="/equipes" element={<EquipesPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
