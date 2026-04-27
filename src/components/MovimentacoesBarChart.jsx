import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import styles from './MovimentacoesBarChart.module.scss';

/**
 * Componente MovimentacoesBarChart
 * Exibe movimentações (Entrada vs Saída) em bar chart stacked por período
 */
export default function MovimentacoesBarChart({ dados = [], titulo = 'Movimentações Recentes' }) {
  if (!dados || dados.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.titulo}>{titulo}</h3>
        <div className={styles.vazio}>
          <p>Sem dados de movimentação</p>
        </div>
      </div>
    );
  }

  // Formatar dados para o gráfico
  const dadosFormatados = dados.map(item => ({
    data: item.data || item.label || 'N/A',
    Entrada: item.entrada || 0,
    Saída: item.saida || item.sai || 0,
    entrada_raw: item.entrada || 0, // Para tooltip
    saida_raw: item.saida || item.sai || 0
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{payload[0].payload.data}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('pt-BR')} un
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.titulo}>{titulo}</h3>
      
      <div className={styles.legenda}>
        <div className={styles.legendaItem}>
          <span className={styles.legendaBox} style={{ backgroundColor: '#10b981' }}></span>
          <span>Entrada</span>
        </div>
        <div className={styles.legendaItem}>
          <span className={styles.legendaBox} style={{ backgroundColor: '#dc2626' }}></span>
          <span>Saída</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={dadosFormatados}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="data"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={Math.max(0, Math.floor(dadosFormatados.length / 7))}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Quantidade (un)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Entrada" stackId="movimentacao" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Saída" stackId="movimentacao" fill="#dc2626" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Resumo */}
      <div className={styles.resumo}>
        {dadosFormatados.length > 0 && (
          <>
            <div className={styles.resumoItem}>
              <span className={styles.resumoLabel}>Total Entrada:</span>
              <span className={styles.resumoValor} style={{ color: '#10b981' }}>
                {dadosFormatados.reduce((acc, d) => acc + d.Entrada, 0).toLocaleString('pt-BR')} un
              </span>
            </div>
            <div className={styles.resumoItem}>
              <span className={styles.resumoLabel}>Total Saída:</span>
              <span className={styles.resumoValor} style={{ color: '#dc2626' }}>
                {dadosFormatados.reduce((acc, d) => acc + d.Saída, 0).toLocaleString('pt-BR')} un
              </span>
            </div>
            <div className={styles.resumoItem}>
              <span className={styles.resumoLabel}>Balanço:</span>
              <span className={styles.resumoValor} style={{ 
                color: (dadosFormatados.reduce((acc, d) => acc + d.Entrada, 0) - dadosFormatados.reduce((acc, d) => acc + d.Saída, 0)) >= 0 ? '#10b981' : '#dc2626'
              }}>
                {(dadosFormatados.reduce((acc, d) => acc + d.Entrada, 0) - dadosFormatados.reduce((acc, d) => acc + d.Saída, 0)).toLocaleString('pt-BR')} un
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
