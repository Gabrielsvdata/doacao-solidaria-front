import styles from './Botao.module.scss';

export default function Botao({ 
  children, 
  variante = 'primario', 
  tamanho = 'medio', 
  disabled = false,
  onClick,
  tipo = 'button',
  className = ''
}) {
  const classesFinais = `${styles.botao} ${styles[`botao--${variante}`]} ${styles[`botao--${tamanho}`]} ${className}`.trim();

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={disabled}
      className={classesFinais}
    >
      {children}
    </button>
  );
}