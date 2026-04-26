import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import Sidebar from '../components/Sidebar';
import styles from './AdminLayout.module.scss';

export default function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <div className={styles.adminLayout}>
        <Sidebar />
        <div className={styles.mainContent}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
