import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Botao from '../components/Botao';
import { getDoacaoDetalhes } from '../services/api';
import { getAuth } from '../services/auth';
import { formatarData, formatarTelefone } from '../utils/dateUtils';
import styles from './ConfirmacaoDoacao.module.scss';

export default function ConfirmacaoDoacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doacao, setDoacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDoacao();
  }, [id]);

  const carregarDoacao = async () => {
    try {
      setCarregando(true);
      setErro('');
      const token = getAuth()?.token;
      const response = await getDoacaoDetalhes(id, token);
      
      // A API pode retornar em diferentes formatos
      const doacaoData = response.data.doacao || response.data;
      
      if (!doacaoData) {
        setErro('Doação não encontrada');
        return;
      }
      
      setDoacao(doacaoData);
    } catch (error) {
      console.error('Erro ao carregar doação:', error);
      // Mostrar erro ao usuário em vez de falhar silenciosamente
      const mensagemErro = error.response?.data?.erro || 
                          'Erro ao carregar os detalhes da doação. Por favor, tente novamente.';
      setErro(mensagemErro);
      // Ainda assim tentar continuar com dados mínimos para UX aceitável
      setDoacao({ id: parseInt(id), status: 'AGENDADA' });
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Processando sua doação...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.erro}>
          <p>{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.card}>
          {/* Ícone de Sucesso */}
          <div className={styles.successIcon}>
            <span>✅</span>
          </div>

          {/* Mensagem de Sucesso */}
          <div className={styles.successMessage}>
            <h1>Doação Agendada com Sucesso!</h1>
            <p>Muito obrigado pela sua generosidade!</p>
          </div>

          {/* Detalhes da Doação */}
          <div className={styles.detalhes}>
            <h2>📋 Detalhes da Sua Doação</h2>

            <div className={styles.grid}>
              {/* Coluna 1: Informações do Doador */}
              <section className={styles.secao}>
                <h3>👤 Suas Informações</h3>
                <div className={styles.item}>
                  <span className={styles.label}>Nome:</span>
                  <span className={styles.valor}>{doacao?.doador_nome || 'N/A'}</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>Telefone:</span>
                  <span className={styles.valor}>{formatarTelefone(doacao?.doador_telefone) || 'N/A'}</span>
                </div>
              </section>

              {/* Coluna 2: Detalhes da Doação */}
              <section className={styles.secao}>
                <h3>📦 Detalhes da Doação</h3>
                <div className={styles.item}>
                  <span className={styles.label}>Categoria:</span>
                  <span className={styles.valor}>{doacao?.categoria || 'N/A'}</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>Quantidade:</span>
                  <span className={styles.valor}>
                    {doacao?.quantidade || 'N/A'} {doacao?.unidade || ''}
                  </span>
                </div>
              </section>

              {/* Coluna 3: Informações da Instituição */}
              <section className={styles.secao}>
                <h3>🏢 Instituição de Destino</h3>
                <div className={styles.item}>
                  <span className={styles.label}>Nome:</span>
                  <span className={styles.valor}>{doacao?.instituicao || 'N/A'}</span>
                </div>
              </section>

              {/* Coluna 4: Agendamento */}
              <section className={styles.secao}>
                <h3>📅 Agendamento</h3>
                <div className={styles.item}>
                  <span className={styles.label}>Data Prevista:</span>
                  <span className={styles.valor}>{formatarData(doacao?.data_agendamento)}</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>Status:</span>
                  <span className={`${styles.valor} ${styles[`status_${doacao?.status?.toLowerCase()}`]}`}>
                    {doacao?.status || 'AGENDADA'}
                  </span>
                </div>
              </section>
            </div>
          </div>

          {/* Informações Importantes */}
          <div className={styles.informacoes}>
            <h2>ℹ️ Informações Importantes</h2>
            
            <div className={styles.infoBox}>
              <p>
                <strong>⏰ Prazo de Validação:</strong> Sua doação será analisada em até <strong>2 dias úteis</strong>. 
                Você receberá um contato para confirmar os detalhes.
              </p>
            </div>

            <div className={styles.infoBox}>
              <p>
                <strong>📞 Entrega:</strong> Compareça na instituição na <strong>{formatarData(doacao?.data_agendamento)}</strong> durante o horário comercial para entregar sua doação.
              </p>
            </div>

            <div className={styles.infoBox}>
              <p>
                <strong>🙏 Impacto:</strong> Sua doação de <strong>{doacao?.quantidade} {doacao?.unidade}</strong> de 
                <strong> {doacao?.categoria}</strong> vai fazer uma diferença real na vida de muitas famílias!
              </p>
            </div>
          </div>

          {/* Código de Rastreamento */}
          <div className={styles.tracking}>
            <h3>🔍 Código de Rastreamento</h3>
            <div className={styles.trackingCode}>#{doacao?.id || 'N/A'}</div>
            <p>Guarde este número para consultar o status de sua doação</p>
          </div>

          {/* Botões de Ação */}
          <div className={styles.acoes}>
            <Botao
              cor="success"
              texto="🎁 Fazer Outra Doação"
              onClick={() => navigate('/doador')}
              tamanho="grande"
            />
            <Botao
              cor="secondary"
              texto="← Voltar à Home"
              onClick={() => navigate('/')}
              tamanho="grande"
            />
          </div>

          {/* Rodapé */}
          <div className={styles.rodape}>
            <p>Obrigado por contribuir com a Doação Solidária!</p>
            <p className={styles.gratidao}>Juntos fazemos a diferença! ❤️</p>
          </div>
        </div>
      </main>
    </div>
  );
}
