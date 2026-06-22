import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AppPage.module.css';

export default function AppPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/signin');
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.message}>Welcome to the application.</h1>
        <button className={styles.button} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
