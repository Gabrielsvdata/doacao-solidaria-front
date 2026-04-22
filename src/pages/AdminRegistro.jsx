import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUsuario, getInstituicoes } from '../services/api';
import { getAuth } from '../services/auth';
import Botao from '../components/Botao';
import styles from './AdminRegistro.module.scss';

export default function AdminRegistro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmaSenha: '',
    instituicao_id: ''
  });
  const [instituicoes, setInstituicoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    carregarInstituicoes();
  }, []);

  const carregarInstituicoes = async () => {
    try {
      const token = getAuth()?.id;
      if (!token) {
        // Se não autenticado, usar uma lista vazia ou valores padrão
        setInstituicoes([]);
        return;
      }
      const response = await getInstituicoes(token);
      setInstituicoes(response.data?.instituicoes || []);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
      setInstituicoes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    if (!formData.nome || !formData.email || !formData.senha) {
      setErro('Por favor, preencha nome, email e senha');
      return false;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.senha !== formData.confirmaSenha) {
      setErro('As senhas não coincidem');
      return false;
    }

    if (!formData.email.includes('@')) {
      setErro('E-mail inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    try {
      setCarregando(true);
      setErro('');
      setSucesso('');

      const token = getAuth()?.id;
      
      await createUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        instituicao_id: formData.instituicao_id || null
      }, token);

      setSucesso('Usuário cadastrado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setErro(error.response?.data?.erro || 'Erro ao cadastrar usuário');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.registroPage}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Cadastro de Usuário</h1>
            <p>Registre um novo administrador</p>
          </div>

          {erro && (
            <div className={styles.erro}>
              <p>{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className={styles.sucesso}>
              <p>{sucesso}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="nome">Nome *</label>
              <input
                id="nome"
                type="text"
                placeholder="Digite o nome completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                disabled={carregando}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail *</label>
              <input
                id="email"
                type="email"
                placeholder="usuario@email.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={carregando}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="instituicao">Instituição (Opcional)</label>
              <select
                id="instituicao"
                name="instituicao_id"
                value={formData.instituicao_id}
                onChange={handleChange}
                disabled={carregando || instituicoes.length === 0}
                className={styles.select}
              >
                <option value="">Selecione uma instituição</option>
                {instituicoes.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="senha">Senha *</label>
              <input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                disabled={carregando}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmaSenha">Confirmar Senha *</label>
              <input
                id="confirmaSenha"
                type="password"
                placeholder="Confirme a senha"
                name="confirmaSenha"
                value={formData.confirmaSenha}
                onChange={handleChange}
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
              {carregando ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </Botao>
          </form>

          <div className={styles.links}>
            <Link to="/admin/login">← Voltar ao login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
