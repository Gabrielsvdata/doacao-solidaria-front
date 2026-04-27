import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './EstoqueGaugeCard.module.scss';

/**
 * Componente EstoqueGaugeCard
 * Exibe o preenchimento de estoque com gauge visual + porcentagem
 */
export default function EstoqueGaugeCard({ categoria, percentual = 0, quantidade = 0, capacidade = 0 }) {
  // Preparar dados para o gauge (Pie em layout circular)
  const data = [
    { name: 'Preenchido', value: Math.min(percentual, 100) },
    { name: 'Disponível', value: Math.max(100 - percentual, 0) }
  ];

  // Cores baseadas no percentual
  const obterCor = (valor) => {
    if (valor >= 80) return '#10b981'; // Verde - Bom
    if (valor >= 50) return '#f59e0b'; // Amarelo - Médio
    return '#dc2626'; // Vermelho - Crítico
  };

  const corPreenchido = obterCor(percentual);

  return (
    <div className={styles.card}>
      <h3 className={styles.titulo}>{categoria}</h3>
      
      <div className={styles.conteudo}>
        {/* Gauge Visual */}
        <div className={styles.gaugeContainer}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                startAngle={180}
                endAngle={0}
                dataKey="value"
              >
                <Cell fill={corPreenchido} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Texto centralizado */}
          <div className={styles.percentualOverlay}>
            <div className={styles.percentualValor}>{Math.round(percentual)}%</div>
            <div className={styles.percentualLabel}>Preenchido</div>
          </div>
        </div>

        {/* Info Cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Quantidade</span>
            <span className={styles.infoValor}>{quantidade.toLocaleString('pt-BR')}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Capacidade</span>
            <span className={styles.infoValor}>{capacidade.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={styles.statusBadge} data-status={percentual >= 80 ? 'bom' : percentual >= 50 ? 'medio' : 'critico'}>
          {percentual >= 80 ? '✓ Adequado' : percentual >= 50 ? '⚠ Médio' : '✕ Crítico'}
        </div>
      </div>
    </div>
  );
}
