import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { setAuth } from '../services/auth';
import Botao from '../components/Botao';
import styles from './Login.module.scss';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !senha) {
      setErro('Por favor, preencha email e senha');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      const response = await login(email, senha);
      
      if (response.data && response.data.admin) {
        setAuth(response.data.admin);
        navigate('/admin/dashboard');
      } else {
        setErro('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErro(error.response?.data?.message || 'Credenciais inválidas');
      setSenha('');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Doação Solidária</h1>
            <p>Acesso Administrativo</p>
          </div>

          {erro && (
            <div className={styles.erro}>
              <p>{erro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={carregando}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={carregando}
                className={styles.input}
              />
            </div>

            <Botao 
              tipo="submit" 
              variante="primario" 
              tamanho="grande" 
              disabled={carregando}
              className={styles.botaoSubmit}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Botao>
          </form>

          <p className={styles.info}>
            Apenas administradores podem acessar esta área
          </p>

          <div className={styles.registro}>
            <p>Não tem conta? <Link to="/admin/registro">Criar nova conta</Link></p>
          </div>

          <div className={styles.voltar}>
            <Link to="/">← Voltar à home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}