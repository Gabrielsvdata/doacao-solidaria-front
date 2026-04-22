import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Doador from './pages/Doador';
import DetalhesInstituicao from './pages/DetalhesInstituicao';
import Login from './pages/Login';
import AdminRegistro from './pages/AdminRegistro';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoacoes from './pages/AdminDoacoes';
import AdminDistribuicoes from './pages/AdminDistribuicoes';
import AdminEstoque from './pages/AdminEstoque';
import AdminInstituicoes from './pages/AdminInstituicoes';
import AdminUsuarios from './pages/AdminUsuarios';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doador" element={<Doador />} />
        <Route path="/instituicao/:id" element={<DetalhesInstituicao />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/registro" element={<AdminRegistro />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doacoes" element={<AdminDoacoes />} />
          <Route path="distribuicoes" element={<AdminDistribuicoes />} />
          <Route path="estoque" element={<AdminEstoque />} />
          <Route path="instituicoes" element={<AdminInstituicoes />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
