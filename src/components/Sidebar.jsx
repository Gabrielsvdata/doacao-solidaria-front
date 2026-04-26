import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getAuth } from '../services/auth';
import { 
  BarChartIcon, GiftIcon, TruckIcon, BoxIcon, 
  BuildingIcon, UsersIcon, MenuIcon, XIcon, LogoutIcon 
} from './Icons';
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
    { path: '/admin/dashboard', Icon: BarChartIcon, label: 'Dashboard' },
    { path: '/admin/doacoes', Icon: GiftIcon, label: 'Doações' },
    { path: '/admin/distribuicoes', Icon: TruckIcon, label: 'Distribuições' },
    { path: '/admin/estoque', Icon: BoxIcon, label: 'Estoque' },
    { path: '/admin/instituicoes', Icon: BuildingIcon, label: 'Instituições' },
    { path: '/admin/usuarios', Icon: UsersIcon, label: 'Usuários' }
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <button 
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Alternar sidebar"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <MenuIcon size={24} color="white" /> : <XIcon size={24} color="white" />}
        </button>
        {!collapsed && <h2>Menu</h2>}
      </div>

      <nav className={styles.nav}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <item.Icon size={22} color="currentColor" />
            </span>
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
          <LogoutIcon size={20} color="white" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
