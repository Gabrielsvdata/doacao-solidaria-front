import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './AdminLayout.module.scss';

export default function AdminLayout() {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Outlet />
      </div>
    </div>
  );
}
