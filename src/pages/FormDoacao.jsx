import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Botao from '../components/Botao';
import { createDoacao, getCategorias } from '../services/api';
import styles from './FormDoacao.module.scss';

export default function FormDoacao() {
  const navigate = useNavigate();
  const { instituicaoId } = useParams();
  
  const [formData, setFormData] = useState({
    doador_nome: '',
    doador_telefone_raw: '',
    categoria_id: '',
    quantidade: '',
    unidade: 'kg',
    data_agendamento: '',
    instituicao_id: instituicaoId || ''
  });

  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Obter dados da instituição do localStorage
  const instituicaoData = instituicaoId ? JSON.parse(localStorage.getItem(`instituicao_${instituicaoId}`) || '{}') : {};

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const response = await getCategorias();
      // A API retorna { sucesso: true, categorias: [...] }
      const categoriasData = response.data.categorias || response.data || [];
      setCategorias(categoriasData);
      
      // Se houver instituição, usar a categoria dela
      if (instituicaoData.categoria_id) {
        setFormData(prev => ({
          ...prev,
          categoria_id: instituicaoData.categoria_id
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setErro('Erro ao carregar categorias');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.doador_nome.trim()) {
      setErro('Nome do doador é obrigatório');
      return false;
    }

    if (!formData.doador_telefone_raw.trim()) {
      setErro('Telefone é obrigatório');
      return false;
    }

    if (!formData.categoria_id) {
      setErro('Categoria é obrigatória');
      return false;
    }

    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      setErro('Quantidade deve ser maior que 0');
      return false;
    }

    if (!formData.unidade) {
      setErro('Unidade é obrigatória');
      return false;
    }

    if (!formData.data_agendamento) {
      setErro('Data de agendamento é obrigatória');
      return false;
    }

    if (!formData.instituicao_id) {
      setErro('Instituição é obrigatória');
      return false;
    }

    // Validar data (não pode ser no passado)
    const dataAgendamento = new Date(formData.data_agendamento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataAgendamento < hoje) {
      setErro('Data de agendamento não pode ser no passado');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!validarFormulario()) {
      return;
    }

    try {
      setEnviando(true);
      const response = await createDoacao(formData);
      
      // Extrair ID da doação da resposta
      const doacaoId = response.data?.doacao?.id || response.data?.id;
      
      setSucesso(true);
      setFormData({
        doador_nome: '',
        doador_telefone_raw: '',
        categoria_id: instituicaoData.categoria_id || '',
        quantidade: '',
        unidade: 'kg',
        data_agendamento: '',
        instituicao_id: instituicaoId || ''
      });

      // Redirecionar para página de confirmação após 1 segundo
      setTimeout(() => {
        if (doacaoId) {
          navigate(`/confirmacao/${doacaoId}`);
        } else {
          navigate('/doador');
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao criar doação:', error);
      setErro(
        error.response?.data?.erro ||
        'Erro ao registrar doação. Por favor, tente novamente.'
      );
      setSucesso(false);
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Carregando formulário...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <button onClick={() => navigate(-1)} className={styles.voltarBtn}>
          ← Voltar
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <h1>🎁 Fazer uma Doação</h1>
            <p>Preencha os dados abaixo para agendar sua doação</p>
          </div>

          {sucesso && (
            <div className={styles.sucesso}>
              <p>✅ Doação registrada com sucesso!</p>
              <p>Você será redirecionado em instantes...</p>
            </div>
          )}

          {erro && (
            <div className={styles.erro}>
              <p>⚠️ {erro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Seção: Informações Pessoais */}
            <fieldset className={styles.fieldset}>
              <legend>📝 Suas Informações</legend>

              <div className={styles.formGroup}>
                <label htmlFor="doador_nome">Nome Completo *</label>
                <input
                  type="text"
                  id="doador_nome"
                  name="doador_nome"
                  value={formData.doador_nome}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  disabled={enviando}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="doador_telefone_raw">Telefone *</label>
                <input
                  type="tel"
                  id="doador_telefone_raw"
                  name="doador_telefone_raw"
                  value={formData.doador_telefone_raw}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  disabled={enviando}
                  required
                />
                <small>Será usado para contato sobre sua doação</small>
              </div>
            </fieldset>

            {/* Seção: Detalhes da Doação */}
            <fieldset className={styles.fieldset}>
              <legend>📦 Detalhes da Doação</legend>

              <div className={styles.formGroup}>
                <label htmlFor="categoria_id">Categoria de Doação *</label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  disabled={enviando}
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="quantidade">Quantidade *</label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleChange}
                    placeholder="Ex: 30"
                    min="0.1"
                    step="0.1"
                    disabled={enviando}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="unidade">Unidade *</label>
                  <select
                    id="unidade"
                    name="unidade"
                    value={formData.unidade}
                    onChange={handleChange}
                    disabled={enviando}
                    required
                  >
                    <option value="un">Unidades (un)</option>
                    <option value="kg">Quilogramas (kg)</option>
                    <option value="L">Litros (L)</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Seção: Agendamento */}
            <fieldset className={styles.fieldset}>
              <legend>📅 Agendamento</legend>

              <div className={styles.formGroup}>
                <label htmlFor="data_agendamento">Data de Agendamento *</label>
                <input
                  type="date"
                  id="data_agendamento"
                  name="data_agendamento"
                  value={formData.data_agendamento}
                  onChange={handleChange}
                  disabled={enviando}
                  required
                />
                <small>Escolha a data em que você poderá entregar a doação</small>
              </div>

              {instituicaoData.nome && (
                <div className={styles.formGroup}>
                  <label>Instituição de Destino</label>
                  <div className={styles.instituicaoInfo}>
                    <strong>{instituicaoData.nome}</strong>
                    {instituicaoData.telefone && (
                      <p>Telefone: {instituicaoData.telefone}</p>
                    )}
                    {instituicaoData.horario && (
                      <p>Atendimento: {instituicaoData.horario}</p>
                    )}
                  </div>
                </div>
              )}
            </fieldset>

            {/* Observação */}
            <div className={styles.observacao}>
              <p>
                💡 <strong>Importante:</strong> Sua doação será agendada e um administrador entrará em contato 
                para confirmar os detalhes. Compareça na data marcada em horário comercial.
              </p>
            </div>

            {/* Botões */}
            <div className={styles.acoes}>
              <Botao
                tipo="submit"
                cor="success"
                texto="🎁 Confirmar Doação"
                desabilitado={enviando}
                tamanho="grande"
              />
              <Botao
                tipo="button"
                cor="secondary"
                texto="Cancelar"
                onClick={() => navigate(-1)}
                desabilitado={enviando}
                tamanho="grande"
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
