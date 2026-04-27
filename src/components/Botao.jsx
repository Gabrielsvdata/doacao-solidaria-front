import styles from './Botao.module.scss';

export default function Botao({ 
  children,
  texto,
  variante = 'primario', 
  cor,
  tamanho = 'medio', 
  disabled = false,
  desabilitado = false,
  onClick,
  tipo = 'button',
  className = ''
}) {
  // Suportar tanto 'cor' quanto 'variante'
  const varianteUsada = cor || variante;
  
  // Suportar tanto 'desabilitado' quanto 'disabled'
  const estaDesabilitado = desabilitado || disabled;
  
  // Suportar tanto 'children' quanto 'texto'
  const conteudo = children || texto;
  
  const classesFinais = `${styles.botao} ${styles[`botao--${varianteUsada}`]} ${styles[`botao--${tamanho}`]} ${className}`.trim();

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={estaDesabilitado}
      className={classesFinais}
    >
      {conteudo}
    </button>
  );
}