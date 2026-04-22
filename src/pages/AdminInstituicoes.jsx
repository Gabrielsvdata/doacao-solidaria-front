import { useState, useEffect } from 'react';
import { getInstituicoes, createInstituicao, deleteInstituicao } from '../services/api';
import { getAuth } from '../services/auth';
import Botao from '../components/Botao';
import styles from './AdminInstituicoes.module.scss';

export default function AdminInstituicoes() {
  const [instituicoes, setInstituicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [instituicaoParaDeletar, setInstituicaoParaDeletar] = useState(null);
  const [senhaDelete, setSenhaDelete] = useState('');
  const [deletando, setDeletando] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    cidade: '',
    telefone: '',
    email: ''
  });

  useEffect(() => {
    carregarInstituicoes();
  }, []);

  const carregarInstituicoes = async () => {
    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.id;
      const response = await getInstituicoes(token);
      setInstituicoes(response.data?.instituicoes || []);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
      setErro('Erro ao carregar instituições');
    } finally {
      setCarregando(false);
    }
  };

  const abrirModal = () => {
    setFormData({
      nome: '',
      endereco: '',
      cidade: '',
      telefone: '',
      email: ''
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErro('');
      const token = getAuth()?.id;
      await createInstituicao(formData, token);
      fecharModal();
      await carregarInstituicoes();
    } catch (error) {
      console.error('Erro ao criar instituição:', error);
      setErro('Erro ao criar instituição');
    }
  };

  const handleDelete = (id, pode_deletar) => {
    if (!pode_deletar) {
      setErro('Esta instituição não pode ser deletada');
      return;
    }

    setInstituicaoParaDeletar(id);
    setSenhaDelete('');
    setModalDeleteAberto(true);
  };

  const confirmarDelete = async () => {
    if (!senhaDelete) {
      setErro('Por favor, digite sua senha para confirmar');
      return;
    }

    try {
      setDeletando(true);
      setErro('');
      const token = getAuth()?.id;
      const usuarioLogado = getAuth();

      await deleteInstituicao(instituicaoParaDeletar, {
        usuario_id_logado: usuarioLogado?.id,
        senha: senhaDelete
      }, token);

      setSucesso('Instituição deletada com sucesso!');
      setInstituicoes(instituicoes.filter(i => i.id !== instituicaoParaDeletar));
      setModalDeleteAberto(false);
      setSenhaDelete('');
      setInstituicaoParaDeletar(null);

      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao deletar instituição:', error);
      setErro(error.response?.data?.erro || 'Erro ao deletar instituição');
    } finally {
      setDeletando(false);
    }
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando instituições...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Gerenciar Instituições</h1>
        <p>Crie, visualize e gerencie as instituições parceiras</p>
        <Botao variante="primario" onClick={abrirModal} className={styles.btnCriar}>
          + Criar Instituição
        </Botao>
      </header>

      {erro && (
        <div className={styles.erro}>
          <p>{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className={styles.sucesso}>
          <p>{sucesso}</p>
        </div>
      )}

      {instituicoes.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cidade</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {instituicoes.map((inst) => (
                <tr key={inst.id}>
                  <td>{inst.nome}</td>
                  <td>{inst.cidade}</td>
                  <td>{inst.telefone || 'N/A'}</td>
                  <td>{inst.email || 'N/A'}</td>
                  <td>
                    <span className={`${styles.status} ${inst.ativo ? styles.ativo : styles.inativo}`}>
                      {inst.ativo ? '🟢 Ativa' : '⚫ Inativa'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`${styles.btnDeletar} ${!inst.pode_deletar ? styles.desabilitado : ''}`}
                      onClick={() => handleDelete(inst.id, inst.pode_deletar)}
                      disabled={!inst.pode_deletar}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.vazio}>
          <p>Nenhuma instituição registrada ainda.</p>
        </div>
      )}

      {modalAberto && (
        <div className={styles.modal} onClick={fecharModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2>Criar Nova Instituição</h2>
              <button className={styles.fechar} onClick={fecharModal}>✕</button>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nome*</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Nome da instituição"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Endereço completo"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Cidade*</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  placeholder="Cidade"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Telefone</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="Telefone para contato"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email para contato"
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={fecharModal} className={styles.btnCancelar}>
                  Cancelar
                </button>
                <Botao tipo="submit" variante="primario">
                  Criar
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {modalDeleteAberto && (
        <div className={styles.modal} onClick={() => setModalDeleteAberto(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2>Confirmar Deleção</h2>
              <button className={styles.fechar} onClick={() => {
                setModalDeleteAberto(false);
                setSenhaDelete('');
                setInstituicaoParaDeletar(null);
              }}>✕</button>
            </header>

            <div className={styles.modalBody}>
              <p>Por favor, digite sua senha para confirmar a deleção da instituição:</p>
              <input
                type="password"
                placeholder="Sua senha"
                value={senhaDelete}
                onChange={(e) => setSenhaDelete(e.target.value)}
                disabled={deletando}
                className={styles.input}
              />
            </div>

            <div className={styles.modalFooter}>
              <button type="button" onClick={() => {
                setModalDeleteAberto(false);
                setSenhaDelete('');
                setInstituicaoParaDeletar(null);
              }} className={styles.btnCancelar} disabled={deletando}>
                Cancelar
              </button>
              <Botao 
                variante="primario" 
                onClick={confirmarDelete}
                disabled={deletando}
              >
                {deletando ? 'Deletando...' : 'Deletar'}
              </Botao>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
