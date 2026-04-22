import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getAuth } from '../services/auth';
import styles from './Sidebar.module.scss';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const usuario = getAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/doacoes', icon: '🎁', label: 'Doações' },
    { path: '/admin/distribuicoes', icon: '🚚', label: 'Distribuições' },
    { path: '/admin/estoque', icon: '📦', label: 'Estoque' },
    { path: '/admin/instituicoes', icon: '🏢', label: 'Instituições' },
    { path: '/admin/usuarios', icon: '👥', label: 'Usuários' }
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <button 
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Alternar sidebar"
        >
          ☰
        </button>
        {!collapsed && <h2>Doação Solidária</h2>}
      </div>

      <nav className={styles.nav}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        {!collapsed && usuario && (
          <div className={styles.userInfo}>
            <p className={styles.userName}>{usuario.nome}</p>
            <p className={styles.userEmail}>{usuario.email}</p>
          </div>
        )}
        <button 
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Sair"
        >
          {collapsed ? '🚪' : '🚪 Sair'}
        </button>
      </div>
    </aside>
  );
}
