import styles from './ModalNotificacao.module.scss';

export default function ModalNotificacao({
  tipo = 'info', // 'info', 'sucesso', 'erro', 'aviso'
  titulo,
  mensagem,
  botoes = [], // [{ texto: 'OK', acao: () => {}, tipo: 'primary' }]
  onFechar = () => {},
  visible = true
}) {
  if (!visible) return null;

  const icones = {
    info: '📋',
    sucesso: '✅',
    erro: '❌',
    aviso: '⚠️'
  };

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={`${styles.modal} ${styles[`tipo_${tipo}`]}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.icone}>{icones[tipo]}</span>
          <h2>{titulo}</h2>
          <button className={styles.fechar} onClick={onFechar}>✕</button>
        </div>

        <div className={styles.conteudo}>
          <p>{mensagem}</p>
        </div>

        <div className={styles.footer}>
          {botoes.length === 0 ? (
            <button className={`${styles.botao} ${styles.botao_primary}`} onClick={onFechar}>
              OK
            </button>
          ) : (
            botoes.map((botao, idx) => (
              <button
                key={idx}
                className={`${styles.botao} ${styles[`botao_${botao.tipo || 'primary'}`]}`}
                onClick={() => {
                  botao.acao?.();
                  if (botao.fechar !== false) onFechar();
                }}
              >
                {botao.texto}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
