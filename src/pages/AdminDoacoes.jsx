import { useState, useEffect } from 'react';
import { getDoacoes } from '../services/api';
import { getAuth } from '../services/auth';
import SearchBar from '../components/SearchBar';
import styles from './AdminDoacoes.module.scss';

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

export default function AdminDoacoes() {
  const [doacoes, setDoacoes] = useState([]);
  const [doacoesFiltradas, setDoacoesFiltradas] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState({
    instituicao: '',
    categoria: '',
    dataInicio: '',
    dataFim: ''
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDoacoes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [doacoes, busca, filtro]);

  const carregarDoacoes = async () => {
    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.id;
      const response = await getDoacoes(token);
      setDoacoes(response.data?.doacoes || []);
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
        d.categoria?.toLowerCase().includes(termo))
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

    // Filtro por data (intervalo)
    if (filtro.dataInicio || filtro.dataFim) {
      resultado = resultado.filter(d => {
        const data = parseData(d.data_doacao);
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
        <h1>Doações Registradas</h1>
        <p>Histórico completo de doações realizadas</p>
      </header>

      {erro && (
        <div className={styles.erro}>
          <p>{erro}</p>
        </div>
      )}

      {/* Seção de Filtros */}
      <div className={styles.filtrosSecao}>
        <div className={styles.filtrosTop}>
          <SearchBar 
            valor={busca} 
            onChange={handleBusca}
            placeholder="Buscar por doador, instituição ou categoria..."
          />
          {(busca || filtro.instituicao || filtro.categoria || filtro.dataInicio || filtro.dataFim) && (
            <button className={styles.btnLimpar} onClick={limparFiltros}>
              ✕ Limpar filtros
            </button>
          )}
        </div>

        <div className={styles.filtrosGrid}>
          <div className={styles.filtroGrupo}>
            <label>Instituição:</label>
            <select name="instituicao" value={filtro.instituicao} onChange={handleFiltro}>
              <option value="">Todas</option>
              {instituicoes.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGrupo}>
            <label>Categoria:</label>
            <select name="categoria" value={filtro.categoria} onChange={handleFiltro}>
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
          {doacoesFiltradas.length} de {doacoes.length} doações
        </p>
      </div>

      {doacoesFiltradas.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome do Doador</th>
                <th>Telefone</th>
                <th>Instituição</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {doacoesFiltradas.map((doacao, idx) => (
                <tr key={idx}>
                  <td>{doacao.doador_nome || 'N/A'}</td>
                  <td>{doacao.telefone || 'N/A'}</td>
                  <td>{doacao.instituicao || 'N/A'}</td>
                  <td>{doacao.categoria || 'N/A'}</td>
                  <td className={styles.quantidade}>{doacao.quantidade_doada || 0}</td>
                  <td>{formatarData(doacao.data_doacao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.vazio}>
          <p>Nenhuma doação encontrada com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
