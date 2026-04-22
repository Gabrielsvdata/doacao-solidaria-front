import styles from './SearchBar.module.scss';

export default function SearchBar({ 
  valor, 
  onChange, 
  placeholder = "Buscar...",
  variante = "default"
}) {
  return (
    <div className={`${styles.searchBar} ${styles[variante]}`}>
      <input
        type="text"
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
      />
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </div>
  );
}
