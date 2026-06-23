import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './AppPage.module.css';

export default function AppPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/signin');
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.message}>
          Welcome{user?.name ? `, ${user.name}` : ''} to the application.
        </h1>
        <button className={styles.button} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
