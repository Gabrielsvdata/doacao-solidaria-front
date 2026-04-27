import { useState, useEffect } from 'react';
import { getEstoque, updateEstoque } from '../services/api';
import { getAuth, getUsuarioId } from '../services/auth';
import Botao from '../components/Botao';
import SearchBar from '../components/SearchBar';
import styles from './AdminEstoque.module.scss';

export default function AdminEstoque() {
  const [estoque, setEstoque] = useState([]);
  const [estoqueFiltrado, setEstoqueFiltrado] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState({
    status: ''
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [formData, setFormData] = useState({
    quantidade_atual: '',
    descricao: '',
    doador_nome: '',
    telefone: ''
  });

  useEffect(() => {
    carregarEstoque();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [estoque, busca, filtro]);

  const carregarEstoque = async () => {
    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.id;
      const response = await getEstoque(token);
      setEstoque(response.data?.estoques || []);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      setErro('Erro ao carregar estoque');
    } finally {
      setCarregando(false);
    }
  };

  const obterStatus = (item) => {
    if (!item.capacidade_maxima || item.capacidade_maxima === 0) return 'falta';
    
    const percentual = (item.quantidade_atual / item.capacidade_maxima) * 100;
    
    if (percentual === 0) return 'falta';
    if (percentual < 20) return 'crítico';
    if (percentual < 50) return 'baixo';
    if (percentual < 80) return 'médio';
    if (percentual <= 100) return 'bom';
    return 'excesso';  // Mais de 100%
  };

  const obterCor = (status) => {
    const cores = {
      'falta': '#dc2626',      // Vermelho escuro
      'crítico': '#ef4444',    // Vermelho
      'baixo': '#f97316',      // Laranja
      'médio': '#f59e0b',      // Amarelo
      'bom': '#10b981',        // Verde
      'excesso': '#3b82f6'     // Azul
    };
    return cores[status] || '#6b7280';
  };

  const obterLabel = (status) => {
    const labels = {
      'falta': 'Sem Estoque',
      'crítico': 'Crítico',
      'baixo': 'Baixo',
      'médio': 'Médio',
      'bom': 'Adequado',
      'excesso': 'Excesso'
    };
    return labels[status] || 'Desconhecido';
  };

  const aplicarFiltros = () => {
    let resultado = estoque;

    // Busca geral
    if (busca) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(e =>
        e.instituicao?.toLowerCase().includes(termo) ||
        e.categoria?.toLowerCase().includes(termo)
      );
    }

    // Filtro por status
    if (filtro.status) {
      resultado = resultado.filter(e => obterStatus(e) === filtro.status);
    }

    setEstoqueFiltrado(resultado);
  };

  const handleBusca = (e) => {
    setBusca(e.target.value);
  };

  const handleFiltro = (e) => {
    const { name, value } = e.target;
    setFiltro(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltro({ status: '' });
  };

  const abrirModal = (item) => {
    setItemSelecionado(item);
    setFormData({
      quantidade_atual: item.quantidade_atual || '',
      descricao: item.descricao || '',
      doador_nome: '',
      telefone: ''
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setItemSelecionado(null);
    setFormData({
      quantidade_atual: '',
      descricao: '',
      doador_nome: '',
      telefone: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErro('');
      setSucesso('');
      const token = getAuth()?.id;
      const usuarioId = getUsuarioId();

      // Validar quantidade_atual
      const quantidade = parseInt(formData.quantidade_atual);
      if (isNaN(quantidade) || quantidade < 0) {
        setErro('Quantidade deve ser um número >= 0');
        return;
      }

      // Dados a enviar conforme esperado pelo backend
      const payload = {
        quantidade_atual: quantidade,
        usuario_id: usuarioId,
        descricao: formData.descricao || null
      };

      // Se houver dados de doador, incluir (para registrar doação)
      // Backend calcula automaticamente a diferença como quantidade_doada
      if (formData.doador_nome) {
        payload.doador_nome = formData.doador_nome;
        payload.telefone = formData.telefone || null;
      }

      await updateEstoque(itemSelecionado.id, payload, token);

      setSucesso(`Estoque de ${itemSelecionado.categoria} atualizado com sucesso!`);
      fecharModal();
      await carregarEstoque();
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      setErro(error.response?.data?.erro || 'Erro ao atualizar estoque');
    }
  };

  const obterStatusCor = (percentual) => {
    if (percentual >= 80) return '#00b894';
    if (percentual >= 50) return '#fdcb6e';
    return '#ff6b6b';
  };

  const obterStatusTexto = (percentual) => {
    if (percentual >= 80) return 'Bom';
    if (percentual >= 50) return 'Médio';
    return 'Crítico';
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando estoque...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Gerenciar Estoque</h1>
        <p>Monitore e atualize os estoques das instituições</p>
      </header>

      {erro && (
        <div className={styles.erro}>
          <p>{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className={styles.sucesso}>
          <span>✓</span> {sucesso}
        </div>
      )}

      {/* Seção de Filtros */}
      <div className={styles.filtrosSecao}>
        <div className={styles.filtrosTop}>
          <SearchBar 
            valor={busca} 
            onChange={handleBusca}
            placeholder="Buscar por instituição ou categoria..."
          />
          {(busca || filtro.status) && (
            <button className={styles.btnLimpar} onClick={limparFiltros}>
              ✕ Limpar filtros
            </button>
          )}
        </div>

        <div className={styles.filtrosGrid}>
          <div className={styles.filtroGrupo}>
            <label>Status:</label>
            <select name="status" value={filtro.status} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option value="bom">Bom (80% ou mais)</option>
              <option value="médio">Médio (50-79%)</option>
              <option value="crítico">Crítico (Menos de 50%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className={styles.resultado}>
        <p className={styles.contador}>
          {estoqueFiltrado.length} de {estoque.length} itens
        </p>
      </div>

      {estoqueFiltrado.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Instituição</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Capacidade</th>
                <th>Percentual</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {estoqueFiltrado.map((item) => {
                const percentual = (item.quantidade_atual / item.capacidade_maxima) * 100;
                return (
                  <tr key={item.id}>
                    <td>{item.instituicao || 'N/A'}</td>
                    <td>{item.categoria || 'N/A'}</td>
                    <td>{item.quantidade_atual || 0}</td>
                    <td>{item.capacidade_maxima || 0}</td>
                    <td className={styles.percentual}>{Math.round(percentual)}%</td>
                    <td>
                      <span 
                        className={styles.status}
                        style={{ borderColor: obterStatusCor(percentual) }}
                      >
                        {obterStatusTexto(percentual)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.btnAtualizar}
                        onClick={() => abrirModal(item)}
                      >
                        Atualizar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.vazio}>
          <p>Nenhum item de estoque encontrado com os filtros aplicados.</p>
        </div>
      )}

      {modalAberto && (
        <div className={styles.modal} onClick={fecharModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2>Atualizar Estoque</h2>
              <button className={styles.fechar} onClick={fecharModal}>✕</button>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Quantidade Atual</label>
                <input
                  type="number"
                  name="quantidade_atual"
                  value={formData.quantidade_atual}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Adicione observações..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nome do Doador</label>
                <input
                  type="text"
                  name="doador_nome"
                  value={formData.doador_nome}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Telefone</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={fecharModal} className={styles.btnCancelar}>
                  Cancelar
                </button>
                <Botao tipo="submit" variante="primario">
                  Salvar
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
