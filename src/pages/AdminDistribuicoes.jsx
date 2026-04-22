import { useState, useEffect } from 'react';
import { getDistribuicoes, createDistribuicao, getEstoque, getInstituicoes, getDistribuicoesCarregamento, getCategorias } from '../services/api';
import { getAuth, getUsuarioId } from '../services/auth';
import Botao from '../components/Botao';
import SearchBar from '../components/SearchBar';
import styles from './AdminDistribuicoes.module.scss';

// Função utilitária para formatar datas
const formatarData = (dataString) => {
  if (!dataString) return 'N/A';
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  } catch {
    return 'N/A';
  }
};

// Função para converter string de data para objeto Date para filtros
const parseData = (dataString) => {
  if (!dataString) return null;
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return null;
    return data;
  } catch {
    return null;
  }
};

export default function AdminDistribuicoes() {
  const [distribuicoes, setDistribuicoes] = useState([]);
  const [distribuicoesFiltradas, setDistribuicoesFiltradas] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [instituicoes, setInstituicoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState({
    tipo: '',
    instituicao: '',
    categoria: '',
    dataInicio: '',
    dataFim: ''
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const [formData, setFormData] = useState({
    estoque_id: '',
    quantidade: '',
    tipo_saida: '',
    beneficiario_nome: '',
    beneficiario_telefone: '',
    beneficiario_cpf: '',
    instituicao_destino_id: '',
    motivo: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [distribuicoes, busca, filtro]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const token = getAuth()?.id;
      
      const [resDistribuicoes, resEstoque, resInstituicoes, resCategorias] = await Promise.all([
        getDistribuicoes(token),
        getEstoque(token),
        getInstituicoes(token),
        getCategorias()
      ]);
      
      setDistribuicoes(resDistribuicoes.data?.distribuicoes || []);
      setEstoque(resEstoque.data?.estoques || []);
      setInstituicoes(resInstituicoes.data?.instituicoes || []);
      setCategorias(resCategorias.data?.categorias || resCategorias.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
      setCategorias([]);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = distribuicoes;

    // Busca geral
    if (busca) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(d =>
        d.instituicao?.toLowerCase().includes(termo) ||
        d.categoria?.toLowerCase().includes(termo) ||
        d.beneficiario_nome?.toLowerCase().includes(termo)
      );
    }

    // Filtro por tipo
    if (filtro.tipo) {
      resultado = resultado.filter(d => d.tipo_saida === filtro.tipo);
    }

    // Filtro por instituição
    if (filtro.instituicao) {
      resultado = resultado.filter(d => d.instituicao === filtro.instituicao);
    }

    // Filtro por categoria
    if (filtro.categoria) {
      resultado = resultado.filter(d => d.categoria === filtro.categoria);
    }

    // Filtro por data
    if (filtro.dataInicio || filtro.dataFim) {
      resultado = resultado.filter(d => {
        const data = parseData(d.data_distribuicao);
        if (!data) return false;
        const inicio = filtro.dataInicio ? new Date(filtro.dataInicio) : new Date(0);
        const fim = filtro.dataFim ? new Date(filtro.dataFim) : new Date();
        return data >= inicio && data <= fim;
      });
    }

    setDistribuicoesFiltradas(resultado);
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
    setFiltro({
      tipo: '',
      instituicao: '',
      categoria: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const obterInstituicaoEstoque = (estoqueId) => {
    const item = estoque.find(e => e.id === parseInt(estoqueId));
    return item ? item.instituicao_id : null;
  };

  const validarFormulario = () => {
    if (!formData.estoque_id) {
      setErro('Selecione um item de estoque');
      return false;
    }
    
    // Validar quantidade
    const quantidade = parseInt(formData.quantidade);
    if (!formData.quantidade || quantidade <= 0) {
      setErro('Quantidade deve ser maior que 0');
      return false;
    }

    // Buscar estoque selecionado
    const estoqueOrigem = estoque.find(e => e.id === parseInt(formData.estoque_id));
    if (!estoqueOrigem) {
      setErro('Estoque não encontrado');
      return false;
    }

    // Validar quantidade não excede disponível
    if (quantidade > estoqueOrigem.quantidade_atual) {
      setErro(`Quantidade insuficiente. Disponível: ${estoqueOrigem.quantidade_atual}`);
      return false;
    }

    if (!formData.tipo_saida) {
      setErro('Selecione um tipo de saída');
      return false;
    }

    // Validações específicas por tipo
    if (formData.tipo_saida === 'familia' && !formData.beneficiario_nome) {
      setErro('Nome do beneficiário é obrigatório para distribuição a família');
      return false;
    }

    if (formData.tipo_saida === 'transferencia') {
      if (!formData.instituicao_destino_id) {
        setErro('Selecione uma instituição destino para transferência');
        return false;
      }

      const instOrigem = obterInstituicaoEstoque(formData.estoque_id);
      if (instOrigem === parseInt(formData.instituicao_destino_id)) {
        setErro('Não é permitido transferir para a mesma instituição de origem');
        return false;
      }

      // Validar capacidade do destino
      const estoqueDestino = estoque.find(
        e => e.instituicao_id === parseInt(formData.instituicao_destino_id) &&
             e.categoria_id === estoqueOrigem.categoria_id
      );

      if (estoqueDestino) {
        const capacidadeDisponivel = estoqueDestino.capacidade_maxima - estoqueDestino.quantidade_atual;
        if (quantidade > capacidadeDisponivel) {
          setErro(
            `Capacidade insuficiente no destino. ` +
            `Disponível: ${capacidadeDisponivel} (Total: ${estoqueDestino.capacidade_maxima}, ` +
            `Atual: ${estoqueDestino.quantidade_atual})`
          );
          return false;
        }
      } else {
        // Se não existe estoque no destino, será criado com capacidade 100
        if (quantidade > 100) {
          setErro('Capacidade máxima do novo estoque é 100 itens');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.id;
      const usuarioId = getUsuarioId();

      await createDistribuicao({
        estoque_id: parseInt(formData.estoque_id),
        quantidade: parseInt(formData.quantidade),
        tipo_saida: formData.tipo_saida,
        beneficiario_nome: formData.beneficiario_nome || null,
        beneficiario_telefone: formData.beneficiario_telefone || null,
        beneficiario_cpf: formData.beneficiario_cpf || null,
        instituicao_destino_id: formData.instituicao_destino_id ? parseInt(formData.instituicao_destino_id) : null,
        motivo: formData.motivo || null,
        usuario_id: usuarioId
      }, token);

      setSucesso('Distribuição realizada com sucesso!');
      fecharModal();
      await carregarDados();
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao criar distribuição:', error);
      setErro(error.response?.data?.erro || 'Erro ao criar distribuição');
    } finally {
      setCarregando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFormData({
      estoque_id: '',
      quantidade: '',
      tipo_saida: '',
      beneficiario_nome: '',
      beneficiario_telefone: '',
      beneficiario_cpf: '',
      instituicao_destino_id: '',
      motivo: ''
    });
    setErro('');
  };

  const obterDescricaoTipo = (tipo) => {
    const descricoes = {
      familia: 'Distribuição para família',
      instituicao: 'Distribuição para instituição',
      descarte: 'Descarte de itens',
      transferencia: 'Transferência entre instituições'
    };
    return descricoes[tipo] || tipo;
  };

  return (
    <div className={styles.distribuicoesPage}>
      <div className={styles.header}>
        <h1>Distribuições</h1>
        <p>Histórico de distribuições realizadas</p>
      </div>

      {sucesso && (
        <div className={styles.sucesso}>
          <span>✓</span> {sucesso}
        </div>
      )}

      {erro && !modalAberto && (
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
          + Nova Distribuição
        </Botao>
      </div>

      {carregando && !distribuicoes.length ? (
        <div className={styles.loading}>Carregando distribuições...</div>
      ) : (
        <>
          {/* Seção de Filtros */}
          <div className={styles.filtrosSecao}>
            <div className={styles.filtrosTop}>
              <SearchBar 
                valor={busca} 
                onChange={handleBusca}
                placeholder="Buscar por instituição, categoria ou beneficiário..."
              />
              {(busca || filtro.tipo || filtro.instituicao || filtro.categoria || filtro.dataInicio || filtro.dataFim) && (
                <button className={styles.btnLimpar} onClick={limparFiltros}>
                  ✕ Limpar filtros
                </button>
              )}
            </div>

            <div className={styles.filtrosGrid}>
              <div className={styles.filtroGrupo}>
                <label>Tipo:</label>
                <select name="tipo" value={filtro.tipo} onChange={handleFiltro}>
                  <option value="">Todos</option>
                  <option value="familia">Família</option>
                  <option value="instituicao">Instituição</option>
                  <option value="transferencia">Transferência</option>
                  <option value="descarte">Descarte</option>
                </select>
              </div>

              <div className={styles.filtroGrupo}>
                <label>Instituição:</label>
                <select name="instituicao" value={filtro.instituicao} onChange={handleFiltro}>
                  <option value="">Todas</option>
                  {instituicoes.map(inst => (
                    <option key={inst.id} value={inst.nome}>{inst.nome}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filtroGrupo}>
                <label>Categoria:</label>
                <select name="categoria" value={filtro.categoria} onChange={handleFiltro}>
                  <option value="">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filtroGrupo}>
                <label>Data início:</label>
                <input 
                  type="date" 
                  name="dataInicio" 
                  value={filtro.dataInicio}
                  onChange={handleFiltro}
                />
              </div>

              <div className={styles.filtroGrupo}>
                <label>Data fim:</label>
                <input 
                  type="date" 
                  name="dataFim" 
                  value={filtro.dataFim}
                  onChange={handleFiltro}
                />
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className={styles.resultado}>
            <p className={styles.contador}>
              {distribuicoesFiltradas.length} de {distribuicoes.length} distribuições
            </p>
          </div>

          {distribuicoesFiltradas.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Instituição</th>
                    <th>Categoria</th>
                    <th>Quantidade</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {distribuicoesFiltradas.map(dist => (
                    <tr key={dist.id}>
                      <td>{dist.instituicao_origem || dist.instituicao_id}</td>
                      <td>{dist.categoria}</td>
                      <td className={styles.quantidade}>{dist.quantidade}</td>
                      <td>{obterDescricaoTipo(dist.tipo_saida)}</td>
                      <td>{formatarData(dist.data_distribuicao)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.concluido}`}>
                          Concluído
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.semDados}>
              Nenhuma distribuição encontrada com os filtros aplicados.
            </div>
          )}
        </>
      )}

      {/* Modal de Nova Distribuição */}
      {modalAberto && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Nova Distribuição</h2>
              <button
                className={styles.fechar}
                onClick={fecharModal}
              >
                ✕
              </button>
            </div>

            {erro && (
              <div className={styles.erroModal}>
                <span>✕</span> {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="estoque_id">Item de Estoque *</label>
                  <select
                    id="estoque_id"
                    name="estoque_id"
                    value={formData.estoque_id}
                    onChange={handleChange}
                    disabled={carregando}
                    className={styles.select}
                  >
                    <option value="">Selecione um item</option>
                    {estoque.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.categoria} - {item.instituicao} ({item.quantidade_atual} disponível)
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="quantidade">Quantidade *</label>
                  <input
                    id="quantidade"
                    type="number"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleChange}
                    disabled={carregando}
                    className={styles.input}
                    min="1"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tipo_saida">Tipo de Saída *</label>
                <select
                  id="tipo_saida"
                  name="tipo_saida"
                  value={formData.tipo_saida}
                  onChange={handleChange}
                  disabled={carregando}
                  className={styles.select}
                >
                  <option value="">Selecione um tipo</option>
                  <option value="familia">Distribuição para Família</option>
                  <option value="instituicao">Distribuição para Instituição</option>
                  <option value="transferencia">Transferência entre Instituições</option>
                  <option value="descarte">Descarte</option>
                </select>
              </div>

              {formData.tipo_saida === 'familia' && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="beneficiario_nome">Nome do Beneficiário *</label>
                    <input
                      id="beneficiario_nome"
                      type="text"
                      name="beneficiario_nome"
                      value={formData.beneficiario_nome}
                      onChange={handleChange}
                      disabled={carregando}
                      className={styles.input}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="beneficiario_telefone">Telefone</label>
                    <input
                      id="beneficiario_telefone"
                      type="tel"
                      name="beneficiario_telefone"
                      value={formData.beneficiario_telefone}
                      onChange={handleChange}
                      disabled={carregando}
                      className={styles.input}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              )}

              {formData.tipo_saida === 'transferencia' && (
                <div className={styles.formGroup}>
                  <label htmlFor="instituicao_destino_id">Instituição Destino *</label>
                  <select
                    id="instituicao_destino_id"
                    name="instituicao_destino_id"
                    value={formData.instituicao_destino_id}
                    onChange={handleChange}
                    disabled={carregando || !formData.estoque_id}
                    className={styles.select}
                  >
                    <option value="">Selecione uma instituição</option>
                    {instituicoes
                      .filter(inst => inst.id !== obterInstituicaoEstoque(formData.estoque_id))
                      .map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.nome}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="motivo">Motivo / Observações</label>
                <textarea
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  disabled={carregando}
                  className={styles.textarea}
                  placeholder="Informações adicionais..."
                  rows="3"
                />
              </div>

              <div className={styles.formActions}>
                <Botao
                  variante="primario"
                  tamanho="medio"
                  tipo="submit"
                  disabled={carregando}
                >
                  {carregando ? 'Processando...' : 'Registrar Distribuição'}
                </Botao>
                <Botao
                  variante="secundario"
                  tamanho="medio"
                  onClick={fecharModal}
                  disabled={carregando}
                >
                  Cancelar
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
