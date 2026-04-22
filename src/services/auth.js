// ============ Gerenciamento de Autenticação ============

export const setAuth = (admin) => {
  localStorage.setItem('usuario', JSON.stringify(admin));
  localStorage.setItem('autenticado', 'true');
};

export const getAuth = () => {
  try {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return localStorage.getItem('autenticado') === 'true' && getAuth() !== null;
};

export const logout = () => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('autenticado');
};

export const getUsuarioId = () => {
  const auth = getAuth();
  return auth?.id || null;
};

export const getInstituicaoId = () => {
  const auth = getAuth();
  return auth?.instituicao_id || null;
};
