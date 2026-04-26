import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, LogoutIcon } from './Icons';
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
          <img src="/images/fundo-social.png" alt="Fundo Social" className={styles.fundoSocial} />
          <div className={styles.divider}></div>
          <div className={styles.headerText}>
            <h1>Doação Solidária</h1>
            <p className={styles.subtitle}>ADMINISTRAÇÃO</p>
          </div>
        </Link>
        
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <UserIcon size={20} color="#fbbf24" />
            <span className={styles.userName}>{userName}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogoutIcon size={18} color="white" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
