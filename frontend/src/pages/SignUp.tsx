import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { signUp } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { signUpSchema, type SignUpFormData } from '../validation/auth.schemas';
import PasswordInput from '../components/PasswordInput';
import styles from './Auth.module.css';

export default function SignUp() {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema), mode: 'onTouched' });

  async function onSubmit(data: SignUpFormData) {
    setServerError('');
    setLoading(true);
    try {
      const { data: res } = await signUp(data.email, data.name, data.password);
      login(res.accessToken);
      navigate('/app');
    } catch (err) {
      const axiosErr = err as AxiosError<{ errors: string[] }>;
      const messages = axiosErr.response?.data?.errors;
      setServerError(messages?.join(', ') || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join us today</p>

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
          Name
          <input
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            type="text"
            placeholder="Your name"
            {...register('name')}
          />
          {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
        </label>

        <label className={styles.label}>
          Password
          <PasswordInput
            inputClassName={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Min 8 chars, letter, number, symbol"
            {...register('password')}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
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
