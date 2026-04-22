import React from 'react';
import styles from './CardInstituicao.module.scss';

const CardInstituicao = ({ instituicao, onVerDetalhes }) => {
  // ✅ Usar a mesma lógica do backend (modules/rules.js)
  const obterStatusBadge = (percentual) => {
    if (percentual === 0) return { status: 'falta', label: 'FALTA', severidade: 'crítica' };
    if (percentual < 20) return { status: 'critico', label: 'CRÍTICO', severidade: 'crítica' };
    if (percentual < 50) return { status: 'baixo', label: 'BAIXO', severidade: 'alta' };
    if (percentual < 80) return { status: 'medio', label: 'MÉDIO', severidade: 'normal' };
    if (percentual <= 100) return { status: 'bom', label: 'BOM', severidade: 'normal' };
    return { status: 'excesso', label: 'EXCESSO', severidade: 'info' };
  };

  // ✅ Mensagens contextualizadas (baseadas em backend modules/rules.js)
  const obterMensagem = (status, categoria, percentual) => {
    const mensagens = {
      "FALTA": `🚨 ALERTA: SEM estoque de ${categoria}. Doação urgente necessária!`,
      "CRÍTICO": `⚠️ CRÍTICO: Nível crítico de ${categoria}. Doação importante!`,
      "BAIXO": `⚠️ AVISO: Nível baixo de ${categoria}. Doação bem-vinda!`,
      "MÉDIO": `ℹ️ Nível moderado de ${categoria}. Toda ajuda é bem-vinda!`,
      "BOM": `✅ Bom estoque de ${categoria} no momento.`,
      "EXCESSO": `📦 Excesso de ${categoria}. Foco em outras categorias!`
    };
    return mensagens[status] || "Status desconhecido";
  };

  const percentual = instituicao.percentual || 0;
  const statusInfo = obterStatusBadge(percentual);
  const mensagem = obterMensagem(statusInfo.label, instituicao.categoria, percentual);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.nome}>{instituicao.nome}</h3>
        <span className={`${styles.badge} ${styles[`badge--${statusInfo.status}`]}`}>
          {statusInfo.label}
        </span>
      </div>

      <p className={styles.mensagem}>
        {mensagem}
      </p>

      <div className={styles.infoContainer}>
        <div className={styles.infoItem}>
          <span className={styles.icon}>📍</span>
          <span className={styles.texto}>{instituicao.endereco} — {instituicao.cidade}</span>
        </div>

        {instituicao.telefone && (
          <div className={styles.infoItem}>
            <span className={styles.icon}>📱</span>
            <span className={styles.texto}>{instituicao.telefone}</span>
          </div>
        )}

        {instituicao.horario && (
          <div className={styles.infoItem}>
            <span className={styles.icon}>🕐</span>
            <span className={styles.texto}>{instituicao.horario}</span>
          </div>
        )}
      </div>

      <div className={styles.preenchimento}>
        <span className={styles.label}>
          Estoque: {instituicao.quantidade_atual || 0} de {instituicao.capacidade_maxima || 100} itens ({percentual.toFixed(1)}%)
        </span>
        <div className={styles.barraProgresso}>
          <div 
            className={styles.fill}
            style={{ width: `${percentual}%`, backgroundColor: obterCorStatus(percentual) }}
          ></div>
        </div>
      </div>

      <button 
        className={styles.botaoDetalhes}
        onClick={() => onVerDetalhes && onVerDetalhes(instituicao)}
      >
        Ver detalhes →
      </button>
    </div>
  );
};

const obterCorStatus = (percentual) => {
  // ✅ Cores alinhadas com status do backend
  if (percentual === 0) return '#7f1d1d';  // FALTA - Vermelho escuro
  if (percentual < 20) return '#dc2626';   // CRÍTICO - Vermelho
  if (percentual < 50) return '#f97316';   // BAIXO - Laranja
  if (percentual < 80) return '#eab308';   // MÉDIO - Amarelo
  if (percentual <= 100) return '#10b981'; // BOM - Verde
  return '#8b5cf6'; // EXCESSO - Roxo
};

export default CardInstituicao;