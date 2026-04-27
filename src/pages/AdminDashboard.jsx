import { useState, useEffect } from 'react';
import { getAnalise, getDoacoes, getDistribuicoes, getEstoque, getUsuarios, getTendenciaMovimentacoes } from '../services/api';
import { getAuth } from '../services/auth';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import EstoqueGaugeCard from '../components/EstoqueGaugeCard';
import MovimentacoesBarChart from '../components/MovimentacoesBarChart';
import styles from './AdminDashboard.module.scss';

export default function AdminDashboard() {
  const [analise, setAnalise] = useState(null);
  const [tendencia, setTendencia] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [metrics, setMetrics] = useState({
    totalDoacoes: 0,
    totalDistribuicoes: 0,
    itensEstoque: 0,
    usuariosAtivos: 0
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.id;

      const response = await getAnalise(token);
      setAnalise(response.data?.analise || {});

      const resTendencia = await getTendenciaMovimentacoes(token);
      const dadosTendencia = resTendencia.data?.tendencia || [];
      setTendencia(dadosTendencia.map(item => ({
        data: new Date(item.data).toLocaleDateString('pt-BR'),
        quantidade: item.quantidade
      })));

      const resDoacoes = await getDoacoes(token);
      const resDistribuicoes = await getDistribuicoes(token);
      const resEstoque = await getEstoque(token);
      const resUsuarios = await getUsuarios(token);

      setMetrics({
        totalDoacoes: resDoacoes.data?.doacoes?.length || 0,
        totalDistribuicoes: resDistribuicoes.data?.distribuicoes?.length || 0,
        itensEstoque: resEstoque.data?.estoques?.length || 0,
        usuariosAtivos: resUsuarios.data?.usuarios?.filter(u => u.ativo)?.length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
      setErro('Erro ao carregar dados do dashboard');
      setAnalise({
        por_categoria: [],
        status_geral: [],
        instituicoes_criticas: [],
        movimentacoes_recentes: []
      });
      setTendencia([]);
    } finally {
      setCarregando(false);
    }
  };

  const obterCorStatus = (status) => {
    if (!status) return 'neutro';
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('crítico') || statusLower.includes('critico')) return 'critico';
    if (statusLower.includes('médio') || statusLower.includes('medio')) return 'medio';
    if (statusLower.includes('bom')) return 'bom';
    return 'neutro';
  };

  if (carregando) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Bem-vindo ao painel administrativo</p>
      </div>

      {erro && (
        <div className={styles.erro}>
          <span>⚠</span> {erro}
        </div>
      )}

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📦</div>
          <div className={styles.metricContent}>
            <p className={styles.metricLabel}>Total de Doações</p>
            <h3 className={styles.metricValue}>{metrics.totalDoacoes}</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🚚</div>
          <div className={styles.metricContent}>
            <p className={styles.metricLabel}>Distribuições</p>
            <h3 className={styles.metricValue}>{metrics.totalDistribuicoes}</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📊</div>
          <div className={styles.metricContent}>
            <p className={styles.metricLabel}>Itens em Estoque</p>
            <h3 className={styles.metricValue}>{metrics.itensEstoque}</h3>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👥</div>
          <div className={styles.metricContent}>
            <p className={styles.metricLabel}>Usuários Ativos</p>
            <h3 className={styles.metricValue}>{metrics.usuariosAtivos}</h3>
          </div>
        </div>
      </div>

      <div className={styles.graficosContainer}>
        {analise?.por_categoria && Array.isArray(analise.por_categoria) && analise.por_categoria.length > 0 && (
          <div className={styles.graficoCard}>
            <h3>Preenchimento por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analise.por_categoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentual_preenchido" fill="#6c5ce7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {analise?.status_geral && Array.isArray(analise.status_geral) && analise.status_geral.length > 0 && (
          <div className={styles.graficoCard}>
            <h3>Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analise.status_geral} dataKey="quantidade" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {analise.status_geral.map((item, idx) => {
                    const statusLower = String(item.status || '').toLowerCase();
                    let cor = '#6c5ce7';
                    if (statusLower.includes('crítico') || statusLower.includes('critico')) cor = '#dc2626';
                    if (statusLower.includes('médio') || statusLower.includes('medio')) cor = '#f59e0b';
                    if (statusLower.includes('bom')) cor = '#10b981';
                    return <Cell key={`cell-${idx}`} fill={cor} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {analise?.status_geral && Array.isArray(analise.status_geral) && analise.status_geral.length > 0 && (
        <div className={styles.section}>
          <h2>Status Geral do Sistema</h2>
          <div className={styles.statusGrid}>
            {analise.status_geral.map((item, idx) => {
              const status = obterCorStatus(item.status);
              return (
                <div key={idx} className={`${styles.statusCard} ${styles[status]}`}>
                  <div className={styles.statusLabel}>{String(item.status)}</div>
                  <div className={styles.statusValor}>{item.quantidade}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {analise?.por_categoria && Array.isArray(analise.por_categoria) && analise.por_categoria.length > 0 && (
        <div className={styles.section}>
          <h2>Distribuição por Categoria</h2>
          <div className={styles.categoriasGrid}>
            {analise.por_categoria.map((cat) => {
              const qtd = Number(cat.percentual_preenchido) || 0;
              return (
                <div key={cat.id} className={styles.categoriaCard}>
                  <div className={styles.categoriaHeader}>
                    <span className={styles.categoriaName}>{String(cat.categoria || cat.nome || 'Sem nome')}</span>
                    <span className={styles.categoriaBadge}>{qtd}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${Math.min(qtd, 100)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {analise?.instituicoes_criticas && Array.isArray(analise.instituicoes_criticas) && analise.instituicoes_criticas.length > 0 && (
        <div className={styles.section}>
          <h2>⚠️ Instituições em Situação Crítica</h2>
          <div className={styles.criticalTable}>
            <table>
              <thead>
                <tr>
                  <th>Instituição</th>
                  <th>Preenchimento Médio</th>
                  <th>Ação Recomendada</th>
                </tr>
              </thead>
              <tbody>
                {analise.instituicoes_criticas.map((inst, idx) => {
                  const percentual = Number(inst.percentual_medio) || 0;
                  return (
                    <tr key={inst.id || idx}>
                      <td className={styles.instNome}>{String(inst.nome || `Instituição ${idx + 1}`)}</td>
                      <td>
                        <span className={`${styles.badge} ${percentual > 80 ? styles.critico : styles.medio}`}>
                          {percentual.toFixed(1)}%
                        </span>
                      </td>
                      <td className={styles.acaoRecomendada}>
                        {percentual > 80 ? 'Aumentar abastecimento URGENTEMENTE' : 'Monitorar estoque'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analise?.por_categoria && Array.isArray(analise.por_categoria) && analise.por_categoria.length > 0 && (
        <div className={styles.section}>
          <h2>📦 Estoque Atual (Gauge)</h2>
          <div className={styles.gaugesGrid}>
            {analise.por_categoria.map((cat) => (
              <EstoqueGaugeCard
                key={`gauge-${cat.id}`}
                categoria={String(cat.categoria || cat.nome || 'Sem nome')}
                percentual={Number(cat.percentual_preenchido) || 0}
                quantidade={Number(cat.total_quantidade) || 0}
                capacidade={Number(cat.total_capacidade) || 0}
              />
            ))}
          </div>
        </div>
      )}

      {analise?.movimentacoes_recentes && Array.isArray(analise.movimentacoes_recentes) && analise.movimentacoes_recentes.length > 0 && (
        <div className={styles.section}>
          <MovimentacoesBarChart
            dados={analise.movimentacoes_recentes.slice(0, 14).reduce((acc, item) => {
              const dataStr = item.data_movimento ? new Date(item.data_movimento).toLocaleDateString('pt-BR') : 'N/A';
              const existing = acc.find(d => d.data === dataStr);
              const quantidade = Number(item.quantidade) || 0;
              const tipo = String(item.tipo || 'entrada').toLowerCase();
              
              if (existing) {
                if (tipo.includes('entrada')) {
                  existing.entrada += quantidade;
                } else {
                  existing.saida += quantidade;
                }
              } else {
                acc.push({
                  data: dataStr,
                  entrada: tipo.includes('entrada') ? quantidade : 0,
                  saida: !tipo.includes('entrada') ? quantidade : 0,
                });
              }
              return acc;
            }, [])}
            titulo="📊 Movimentações Recentes (Entrada vs Saída)"
          />
        </div>
      )}

      {tendencia && tendencia.length > 0 && (
        <div className={styles.section}>
          <h2>📈 Movimentações (Tendência)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} items`, 'Quantidade']} labelFormatter={(label) => `${label}`} />
              <Legend />
              <Line type="monotone" dataKey="quantidade" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} name="Quantidade" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <button onClick={carregarDados} className={styles.botaoAtualizar}>
        🔄 Atualizar Dashboard
      </button>
    </div>
  );
}
