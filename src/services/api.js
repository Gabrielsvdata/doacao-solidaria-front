import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// ============= DOADOR (Sem autenticação) =============

export const getCategorias = () => 
  axios.get(`${API_BASE}/doador/categorias`);

export const getRecomendacao = (categoriaId) => 
  axios.post(`${API_BASE}/doador/recomendacao`, { categoria_id: categoriaId });

// ============= INSTITUIÇÕES (Sem autenticação) =============

export const getInstituicao = (id) => 
  axios.get(`${API_BASE}/instituicoes/${id}`);

// ============= ADMIN (Com autenticação) =============

export const login = (email, senha) => 
  axios.post(`${API_BASE}/admin/login`, { email, senha });

// Estoque
export const getEstoque = (token) => 
  axios.get(`${API_BASE}/admin/estoque`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const updateEstoque = (id, data, token) => 
  axios.put(`${API_BASE}/admin/estoque/${id}`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

// Análise e Dashboard
export const getAnalise = (token) => 
  axios.get(`${API_BASE}/admin/analise`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

// Doações Recebidas
export const getDoacoes = (token) => 
  axios.get(`${API_BASE}/admin/doacoes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

// Instituições
export const getInstituicoes = (token) => 
  axios.get(`${API_BASE}/admin/instituicoes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const createInstituicao = (data, token) => 
  axios.post(`${API_BASE}/admin/instituicoes`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const deleteInstituicao = (id, data, token) => 
  axios.delete(`${API_BASE}/admin/instituicoes/${id}`, {
    data,
    headers: { 'Authorization': `Bearer ${token}` }
  });

// Usuários (Gerenciar Admins)
export const getUsuarios = (token) => 
  axios.get(`${API_BASE}/admin/usuarios`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const createUsuario = (data, token) => 
  axios.post(`${API_BASE}/admin/usuarios`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const updateUsuario = (id, data, token) => 
  axios.put(`${API_BASE}/admin/usuarios/${id}`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const deleteUsuario = (id, data, token) => 
  axios.delete(`${API_BASE}/admin/usuarios/${id}`, {
    data,
    headers: { 'Authorization': `Bearer ${token}` }
  });

// Distribuições (Saída de Doações)
export const createDistribuicao = (data, token) => 
  axios.post(`${API_BASE}/admin/distribuicoes`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const getDistribuicoes = (token) => 
  axios.get(`${API_BASE}/admin/distribuicoes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

export const getDistribuicoesCarregamento = (token) => 
  axios.get(`${API_BASE}/admin/distribuicoes-carregamento`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

// Tendência de Movimentações
export const getTendenciaMovimentacoes = (token) => 
  axios.get(`${API_BASE}/admin/tendencia-movimentacoes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });