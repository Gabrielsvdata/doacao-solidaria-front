import { Link } from 'react-router-dom';
import styles from './AdminHeader.module.scss';

export default function AdminHeader() {
  return (
    <header className={styles.adminHeader}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoArea}>
          <img src="/images/brasao.png" alt="Brasão São Vicente" className={styles.brasao} />
          <img src="/images/fundo-social.png" alt="Fundo Social" className={styles.fundoSocial} />
          <div className={styles.divider}></div>
          <div className={styles.headerText}>
            <h1>Doação Solidária</h1>
            <p className={styles.subtitle}>ADMINISTRAÇÃO</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
