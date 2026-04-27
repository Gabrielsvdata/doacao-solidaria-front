import { useState, useEffect } from 'react';
import { getDoacoesValidacao } from '../services/api';
import { getAuth } from '../services/auth';
import SearchBar from '../components/SearchBar';
import styles from './AdminHistoricoDoações.module.scss';

// Função utilitária para formatar datas
const formatarData = (dataString) => {
  if (!dataString) return 'N/A';
  try {
    let data;
    if (dataString.includes('T')) {
      const [ano, mes, dia] = dataString.split('T')[0].split('-');
      data = new Date(ano, mes - 1, dia);
    } else if (dataString.includes('-')) {
      const [ano, mes, dia] = dataString.split('-');
      data = new Date(ano, mes - 1, dia);
    } else {
      data = new Date(dataString);
    }
    if (isNaN(data.getTime())) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  } catch {
    return 'N/A';
  }
};

// Função para formatar data com hora
const formatarDataCompleta = (dataString) => {
  if (!dataString) return 'N/A';
  try {
    let data;
    if (dataString.includes('T')) {
      const [ano, mes, dia] = dataString.split('T')[0].split('-');
      data = new Date(ano, mes - 1, dia);
    } else if (dataString.includes('-')) {
      const [ano, mes, dia] = dataString.split('-');
      data = new Date(ano, mes - 1, dia);
    } else {
      data = new Date(dataString);
    }
    if (isNaN(data.getTime())) return 'N/A';
    return data.toLocaleString('pt-BR');
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

export default function AdminHistoricoDoações() {
  const [doacoes, setDoacoes] = useState([]);
  const [doacoesFiltradas, setDoacoesFiltradas] = useState([]);
  const [busca, setBusca] = useState('');
  const [abaSelecionada, setAbaSelecionada] = useState('APROVADA');
  const [filtro, setFiltro] = useState({
    instituicao: '',
    categoria: '',
    dataInicio: '',
    dataFim: ''
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [contadores, setContadores] = useState({ APROVADA: 0, REJEITADA: 0 });

  useEffect(() => {
    carregarDoacoes();
  }, [abaSelecionada]);

  useEffect(() => {
    aplicarFiltros();
  }, [doacoes, busca, filtro]);

  const carregarDoacoes = async () => {
    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.token;
      
      // Carregar doações aprovadas
      const resAprovadas = await getDoacoesValidacao({ status: 'APROVADA' }, token);
      const doacoesAprovadas = resAprovadas.data?.doacoes || resAprovadas.data || [];
      
      // Carregar doações rejeitadas
      const resRejeitadas = await getDoacoesValidacao({ status: 'REJEITADA' }, token);
      const doacoesRejeitadas = resRejeitadas.data?.doacoes || resRejeitadas.data || [];
      
      // Determinar qual lista usar baseado na aba
      const doacoesParaMostrar = abaSelecionada === 'APROVADA' ? doacoesAprovadas : doacoesRejeitadas;
      
      setDoacoes(doacoesParaMostrar);
      setContadores({
        APROVADA: Array.isArray(doacoesAprovadas) ? doacoesAprovadas.length : 0,
        REJEITADA: Array.isArray(doacoesRejeitadas) ? doacoesRejeitadas.length : 0
      });
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      setErro('Erro ao carregar doações');
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = doacoes;

    // Filtro por busca (nome doador, instituição, categoria)
    if (busca) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(d =>
        (d.doador_nome?.toLowerCase().includes(termo) ||
        d.instituicao?.toLowerCase().includes(termo) ||
        d.categoria?.toLowerCase().includes(termo) ||
        d.doador_telefone?.includes(termo))
      );
    }

    // Filtro por instituição
    if (filtro.instituicao) {
      resultado = resultado.filter(d => d.instituicao === filtro.instituicao);
    }

    // Filtro por categoria
    if (filtro.categoria) {
      resultado = resultado.filter(d => d.categoria === filtro.categoria);
    }

    // Filtro por data (intervalo de data_agendamento)
    if (filtro.dataInicio || filtro.dataFim) {
      resultado = resultado.filter(d => {
        const data = parseData(d.data_agendamento);
        if (!data) return false;
        const inicio = filtro.dataInicio ? new Date(filtro.dataInicio) : new Date(0);
        const fim = filtro.dataFim ? new Date(filtro.dataFim) : new Date();
        return data >= inicio && data <= fim;
      });
    }

    setDoacoesFiltradas(resultado);
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
      instituicao: '',
      categoria: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  // Opções únicas para select
  const instituicoes = [...new Set(doacoes.map(d => d.instituicao))].filter(Boolean);
  const categorias = [...new Set(doacoes.map(d => d.categoria))].filter(Boolean);

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando doações...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📋 Histórico de Doações</h1>
        <p>Doações aprovadas e rejeitadas durante a validação</p>
      </header>

      {erro && (
        <div className={styles.erro}>
          <p>{erro}</p>
        </div>
      )}

      {/* Abas de Status */}
      <div className={styles.abas}>
        <button 
          className={`${styles.aba} ${abaSelecionada === 'APROVADA' ? styles.ativo : ''}`}
          onClick={() => setAbaSelecionada('APROVADA')}
        >
          ✓ Aprovadas <span className={styles.contador}>{contadores.APROVADA}</span>
        </button>
        <button 
          className={`${styles.aba} ${abaSelecionada === 'REJEITADA' ? styles.ativo : ''}`}
          onClick={() => setAbaSelecionada('REJEITADA')}
        >
          ✕ Rejeitadas <span className={styles.contador}>{contadores.REJEITADA}</span>
        </button>
      </div>

      {/* Seção de Filtros */}
      <div className={styles.filtrosSecao}>
        <div className={styles.filtrosTop}>
          <SearchBar 
            valor={busca} 
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por doador, instituição ou categoria..."
          />
          {(busca || filtro.instituicao || filtro.categoria || filtro.dataInicio || filtro.dataFim) && (
            <button className={styles.btnLimpar} onClick={() => {
              setBusca('');
              setFiltro({ instituicao: '', categoria: '', dataInicio: '', dataFim: '' });
            }}>
              ✕ Limpar filtros
            </button>
          )}
        </div>

        <div className={styles.filtrosGrid}>
          <div className={styles.filtroGrupo}>
            <label>Instituição:</label>
            <select 
              value={filtro.instituicao} 
              onChange={(e) => setFiltro(prev => ({ ...prev, instituicao: e.target.value }))}
            >
              <option value="">Todas</option>
              {instituicoes.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGrupo}>
            <label>Categoria:</label>
            <select 
              value={filtro.categoria}
              onChange={(e) => setFiltro(prev => ({ ...prev, categoria: e.target.value }))}
            >
              <option value="">Todas</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGrupo}>
            <label>Data início:</label>
            <input 
              type="date" 
              value={filtro.dataInicio}
              onChange={(e) => setFiltro(prev => ({ ...prev, dataInicio: e.target.value }))}
            />
          </div>

          <div className={styles.filtroGrupo}>
            <label>Data fim:</label>
            <input 
              type="date" 
              value={filtro.dataFim}
              onChange={(e) => setFiltro(prev => ({ ...prev, dataFim: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className={styles.resultado}>
        <p className={styles.contador}>
          {doacoesFiltradas.length} de {doacoes.length} doações
        </p>
      </div>

      {doacoesFiltradas.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Doador</th>
                <th>Telefone</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Instituição</th>
                <th>Data Agendada</th>
                <th>Data Validação</th>
                {abaSelecionada === 'REJEITADA' && <th>Motivo Rejeição</th>}
              </tr>
            </thead>
            <tbody>
              {doacoesFiltradas.map((doacao) => (
                <tr key={doacao.id} className={abaSelecionada === 'REJEITADA' ? styles.rejeitada : styles.aprovada}>
                  <td className={styles.doador}>{doacao.doador_nome}</td>
                  <td>{doacao.doador_telefone}</td>
                  <td>{doacao.categoria}</td>
                  <td className={styles.quantidade}>{doacao.quantidade} {doacao.unidade}</td>
                  <td>{doacao.instituicao}</td>
                  <td>{formatarData(doacao.data_agendamento)}</td>
                  <td>{formatarDataCompleta(doacao.data_validacao)}</td>
                  {abaSelecionada === 'REJEITADA' && <td className={styles.motivo}>{doacao.motivo_rejeicao || 'N/A'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.vazio}>
          <p>Nenhuma doação {abaSelecionada === 'APROVADA' ? 'aprovada' : 'rejeitada'} encontrada.</p>
        </div>
      )}
    </div>
  );
}
