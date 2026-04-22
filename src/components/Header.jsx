import { Link } from 'react-router-dom';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoArea}>
          <img src="/images/brasao.png" alt="Brasão São Vicente" className={styles.brasao} />
          <img src="/images/fundo-social.png" alt="Fundo Social" className={styles.fundoSocialLogo} />
          <div className={styles.divider}></div>
          <div className={styles.headerText}>
            <h1>Doação Solidária</h1>
            <p className={styles.subtitle}>FUNDO SOCIAL DE SÃO VICENTE</p>
          </div>
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/doador" className={styles.navLink}>Doador</Link>
          <Link to="/admin/login" className={styles.navLink}>Admin</Link>
        </nav>
      </div>
    </header>
  );
}