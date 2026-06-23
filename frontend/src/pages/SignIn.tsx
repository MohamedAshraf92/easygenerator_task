import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { signIn, getMe } from '../api/auth';
import { useAuth } from '../context/useAuth';
import { signInSchema, type SignInFormData } from '../validation/auth.schemas';
import PasswordInput from '../components/PasswordInput';
import styles from './Auth.module.css';

export default function SignIn() {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema), mode: 'onTouched' });

  async function onSubmit(data: SignInFormData) {
    setServerError('');
    setLoading(true);
    try {
      const { data: res } = await signIn(data.email, data.password);
      localStorage.setItem('token', res.accessToken);
      const { data: user } = await getMe();
      login(res.accessToken, user);
      navigate('/app');
    } catch (err) {
      const axiosErr = err as AxiosError<{ errors: string[] }>;
      const messages = axiosErr.response?.data?.errors;
      setServerError(messages?.join(', ') || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to continue</p>

        {serverError && <div className={styles.error}>{serverError}</div>}

        <label className={styles.label}>
          Email
          <input
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            type="email"
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </label>

        <label className={styles.label}>
          Password
          <PasswordInput
            inputClassName={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            {...register('password')}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
        </label>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className={styles.link}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
