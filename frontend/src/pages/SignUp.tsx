import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';
import styles from './Auth.module.css';

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain at least one letter';
  if (!/\d/.test(pw)) return 'Password must contain at least one number';
  if (!/[@$!%*#?&^_\-]/.test(pw)) return 'Password must contain at least one special character';
  return null;
}

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (name.length < 3) return setError('Name must be at least 3 characters');
    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);

    setLoading(true);
    try {
      const { data } = await signUp(email, name, password);
      login(data.accessToken);
      navigate('/app');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join us today</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label className={styles.label}>
          Name
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min 8 chars, letter, number, symbol"
          />
        </label>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>

        <p className={styles.link}>
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
