import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminHeader.module.scss';

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const user = localStorage.getItem('user');
  const userName = user ? JSON.parse(user).nome || 'Administrador' : 'Administrador';

  return (
    <header className={styles.adminHeader}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoArea}>
          <img src="/images/brasao.png" alt="Brasão São Vicente" className={styles.brasao} />
          <div className={styles.headerText}>
            <h1>Doação Solidária</h1>
            <p className={styles.subtitle}>ADMINISTRAÇÃO</p>
          </div>
        </Link>
        
        <div className={styles.userSection}>
          <span className={styles.userName}>👤 {userName}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
