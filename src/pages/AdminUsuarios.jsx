import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, deleteUsuario, updateUsuario, getInstituicoes } from '../services/api';
import { getAuth } from '../services/auth';
import Botao from '../components/Botao';
import SearchBar from '../components/SearchBar';
import styles from './AdminUsuarios.module.scss';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [instituicoes, setInstituicoes] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [deletando, setDeletando] = useState(null);
  const [atualizando, setAtualizando] = useState(null);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState(null);
  const [senhaDelete, setSenhaDelete] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    instituicao_id: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [usuarios, busca]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const token = getAuth()?.id;

      // Carregar usuários
      const resUsuarios = await getUsuarios(token);
      setUsuarios(resUsuarios.data?.usuarios || []);

      // Carregar instituições
      const resInstituicoes = await getInstituicoes(token);
      setInstituicoes(resInstituicoes.data?.instituicoes || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = usuarios;

    if (busca) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(u =>
        u.nome?.toLowerCase().includes(termo) ||
        u.email?.toLowerCase().includes(termo)
      );
    }

    setUsuariosFiltrados(resultado);
  };

  const handleBusca = (e) => {
    setBusca(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.senha) {
      setErro('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.id;

      await createUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        instituicao_id: formData.instituicao_id || null
      }, token);

      setSucesso('Usuário cadastrado com sucesso!');
      setFormData({ nome: '', email: '', senha: '', instituicao_id: '' });
      setModalAberto(false);

      // Recarregar usuários
      await carregarDados();

      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setErro(error.response?.data?.erro || 'Erro ao cadastrar usuário');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeleteUsuario = (id) => {
    setUsuarioParaDeletar(id);
    setSenhaDelete('');
    setModalDeleteAberto(true);
  };

  const confirmarDeleteUsuario = async () => {
    if (!senhaDelete) {
      setErro('Por favor, digite sua senha para confirmar');
      return;
    }

    try {
      setDeletando(usuarioParaDeletar);
      setErro('');
      const token = getAuth()?.id;
      const usuarioLogado = getAuth();

      await deleteUsuario(usuarioParaDeletar, {
        usuario_id_logado: usuarioLogado?.id,
        senha: senhaDelete
      }, token);

      setSucesso('Usuário deletado com sucesso!');
      setUsuarios(usuarios.filter(u => u.id !== usuarioParaDeletar));
      setModalDeleteAberto(false);
      setSenhaDelete('');
      setUsuarioParaDeletar(null);

      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao deletar:', error);
      setErro(error.response?.data?.erro || 'Erro ao deletar usuário');
    } finally {
      setDeletando(null);
    }
  };

  const handleToggleAtivar = async (usuario) => {
    try {
      setAtualizando(usuario.id);
      setErro('');
      const token = getAuth()?.id;

      await updateUsuario(usuario.id, {
        ativo: !usuario.ativo
      }, token);

      const novoStatus = !usuario.ativo ? 'ativado' : 'desativado';
      setSucesso(`Usuário ${novoStatus} com sucesso!`);

      // Atualizar na lista local
      const usuariosAtualizados = usuarios.map(u =>
        u.id === usuario.id ? { ...u, ativo: !u.ativo } : u
      );
      setUsuarios(usuariosAtualizados);

      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      setErro(error.response?.data?.erro || 'Erro ao atualizar usuário');
    } finally {
      setAtualizando(null);
    }
  };

  const obterNomeInstituicao = (id) => {
    const inst = instituicoes.find(i => i.id === id);
    return inst ? inst.nome : '—';
  };

  const formatarData = (data) => {
    if (!data) return '—';
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) return '—';
      return dataObj.toLocaleDateString('pt-BR');
    } catch {
      return '—';
    }
  };

  return (
    <div className={styles.usuariosPage}>
      <div className={styles.header}>
        <h1>Gestão de Usuários</h1>
        <p>Gerenciador de usuários administrativos do sistema</p>
      </div>

      {sucesso && (
        <div className={styles.sucesso}>
          <span>✓</span> {sucesso}
        </div>
      )}

      {erro && (
        <div className={styles.erro}>
          <span>✕</span> {erro}
        </div>
      )}

      <div className={styles.acao}>
        <Botao
          variante="primario"
          tamanho="medio"
          onClick={() => setModalAberto(true)}
        >
          + Novo Usuário
        </Botao>
      </div>

      {carregando && !usuarios.length ? (
        <div className={styles.loading}>Carregando usuários...</div>
      ) : (
        <>
          {/* Seção de Busca */}
          <div className={styles.filtrosSecao}>
            <div className={styles.filtrosTop}>
              <SearchBar 
                valor={busca} 
                onChange={handleBusca}
                placeholder="Buscar por nome ou email..."
              />
              {busca && (
                <button className={styles.btnLimpar} onClick={() => setBusca('')}>
                  ✕ Limpar busca
                </button>
              )}
            </div>
          </div>

          {/* Resultado */}
          <div className={styles.resultado}>
            <p className={styles.contador}>
              {usuariosFiltrados.length} de {usuarios.length} usuários
            </p>
          </div>

          {usuariosFiltrados.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Instituição</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id}>
                      <td className={styles.nome}>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>{obterNomeInstituicao(usuario.instituicao_id)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[usuario.ativo ? 'ativo' : 'inativo']}`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>{formatarData(usuario.criado_em)}</td>
                      <td className={styles.acoes}>
                        <button
                          className={`${styles.botaoAcao} ${usuario.ativo ? styles.desativar : styles.ativar}`}
                          onClick={() => handleToggleAtivar(usuario)}
                          disabled={atualizando === usuario.id}
                          title={usuario.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {atualizando === usuario.id ? '...' : (usuario.ativo ? 'Desativar' : 'Ativar')}
                        </button>
                        <button
                          className={`${styles.botaoAcao} ${styles.deletar}`}
                          onClick={() => handleDeleteUsuario(usuario.id)}
                          disabled={deletando === usuario.id}
                          title="Deletar"
                        >
                          {deletando === usuario.id ? '...' : '🗑️'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.semDados}>
              Nenhum usuário encontrado com a busca aplicada.
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Novo Usuário</h2>
              <button
                className={styles.fechar}
                onClick={() => {
                  setModalAberto(false);
                  setFormData({ nome: '', email: '', senha: '', instituicao_id: '' });
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome *</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Digite o nome completo"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={carregando}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">E-mail *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={carregando}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="instituicao">Instituição (Opcional)</label>
                <select
                  id="instituicao"
                  name="instituicao_id"
                  value={formData.instituicao_id}
                  onChange={handleChange}
                  disabled={carregando || instituicoes.length === 0}
                  className={styles.select}
                >
                  <option value="">Selecione uma instituição</option>
                  {instituicoes.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="senha">Senha *</label>
                <input
                  id="senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  disabled={carregando}
                  className={styles.input}
                />
              </div>

              <div className={styles.formActions}>
                <Botao
                  variante="primario"
                  tamanho="medio"
                  tipo="submit"
                  disabled={carregando}
                >
                  {carregando ? 'Salvando...' : 'Salvar Usuário'}
                </Botao>
                <Botao
                  variante="secundario"
                  tamanho="medio"
                  onClick={() => {
                    setModalAberto(false);
                    setFormData({ nome: '', email: '', senha: '', instituicao_id: '' });
                  }}
                  disabled={carregando}
                >
                  Cancelar
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {modalDeleteAberto && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Confirmar Deleção</h2>
              <button
                className={styles.fechar}
                onClick={() => {
                  setModalDeleteAberto(false);
                  setSenhaDelete('');
                  setUsuarioParaDeletar(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p>Por favor, digite sua senha para confirmar a deleção do usuário:</p>
              <input
                type="password"
                placeholder="Sua senha"
                value={senhaDelete}
                onChange={(e) => setSenhaDelete(e.target.value)}
                disabled={deletando === usuarioParaDeletar}
                className={styles.input}
              />
            </div>

            <div className={styles.formActions}>
              <Botao
                variante="primario"
                tamanho="medio"
                onClick={confirmarDeleteUsuario}
                disabled={deletando === usuarioParaDeletar}
              >
                {deletando === usuarioParaDeletar ? 'Deletando...' : 'Deletar'}
              </Botao>
              <Botao
                variante="secundario"
                tamanho="medio"
                onClick={() => {
                  setModalDeleteAberto(false);
                  setSenhaDelete('');
                  setUsuarioParaDeletar(null);
                }}
                disabled={deletando === usuarioParaDeletar}
              >
                Cancelar
              </Botao>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
