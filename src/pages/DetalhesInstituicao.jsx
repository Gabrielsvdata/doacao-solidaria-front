import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { obterExemplosCategoria } from '../utils/categoriasExemplos';
import styles from './DetalhesInstituicao.module.scss';

export default function DetalhesInstituicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instituicao, setInstituicao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    // Carregar dados da instituição do localStorage (passado pela rota anterior)
    const dados = localStorage.getItem(`instituicao_${id}`);
    if (dados) {
      try {
        const instituicaoData = JSON.parse(dados);
        setInstituicao(instituicaoData);
        setCarregando(false);
      } catch (error) {
        console.error('Erro ao parsear dados:', error);
        setErro('Erro ao carregar detalhes da instituição');
        setCarregando(false);
      }
    } else {
      setErro('Dados da instituição não encontrados');
      setCarregando(false);
    }
  }, [id]);

  // Função para obter status
  const obterStatusBadge = (percentual) => {
    if (percentual === 0) return { status: 'falta', label: 'FALTA', severidade: 'crítica' };
    if (percentual < 20) return { status: 'critico', label: 'CRÍTICO', severidade: 'crítica' };
    if (percentual < 50) return { status: 'baixo', label: 'BAIXO', severidade: 'alta' };
    if (percentual < 80) return { status: 'medio', label: 'MÉDIO', severidade: 'normal' };
    if (percentual <= 100) return { status: 'bom', label: 'BOM', severidade: 'normal' };
    return { status: 'excesso', label: 'EXCESSO', severidade: 'info' };
  };

  const obterCorStatus = (percentual) => {
    if (percentual === 0) return '#7f1d1d';
    if (percentual < 20) return '#dc2626';
    if (percentual < 50) return '#f97316';
    if (percentual < 80) return '#eab308';
    if (percentual <= 100) return '#10b981';
    return '#8b5cf6';
  };

  const obterMensagem = (status, categoria, percentual) => {
    const mensagens = {
      "FALTA": `🚨 ALERTA: SEM estoque de ${categoria}. Doação urgente necessária!`,
      "CRÍTICO": `⚠️ CRÍTICO: Nível crítico de ${categoria}. Doação importante!`,
      "BAIXO": `⚠️ AVISO: Nível baixo de ${categoria}. Doação bem-vinda!`,
      "MÉDIO": `ℹ️ Nível moderado de ${categoria}. Toda ajuda é bem-vinda!`,
      "BOM": `✅ Bom estoque de ${categoria} no momento.`,
      "EXCESSO": `📦 Excesso de ${categoria}. Foco em outras categorias!`
    };
    return mensagens[status] || "Status desconhecido";
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  if (erro || !instituicao) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.erro}>
          <p>{erro}</p>
          <button onClick={() => navigate(-1)} className={styles.voltarBtn}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const percentual = instituicao.percentual || 0;
  const statusInfo = obterStatusBadge(percentual);

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <button onClick={() => navigate(-1)} className={styles.voltarBtn}>
          ← Voltar
        </button>

        <div className={styles.header}>
          <div>
            <h1>{instituicao.nome}</h1>
            <span className={`${styles.badge} ${styles[`badge--${statusInfo.status}`]}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className={styles.gridPrincipal}>
          {/* Coluna Esquerda: Informações de Contato e Localização */}
          <section className={styles.secaoContacto}>
            <h2>📍 Informações de Contato</h2>

            <div className={styles.infoBox}>
              <h3>Localização</h3>
              <p className={styles.endereco}>
                {instituicao.endereco}
                {instituicao.numero && ` ${instituicao.numero}`}
                {instituicao.complemento && ` - ${instituicao.complemento}`}
              </p>
              <p className={styles.bairro}>
                {instituicao.bairro && `${instituicao.bairro}, `}
                {instituicao.cidade}
                {instituicao.estado && ` - ${instituicao.estado}`}
              </p>
              {instituicao.cep && (
                <p className={styles.cep}>CEP: {instituicao.cep}</p>
              )}
            </div>

            <div className={styles.infoBox}>
              <h3>Contato</h3>
              {instituicao.telefone && (
                <p className={styles.telefone}>
                  <strong>Telefone:</strong> {instituicao.telefone}
                </p>
              )}
              {instituicao.horario && (
                <p className={styles.horario}>
                  <strong>Horário de Funcionamento:</strong> {instituicao.horario}
                </p>
              )}
            </div>
          </section>

          {/* Coluna Direita: Status do Estoque */}
          <section className={styles.secaoEstoque}>
            <h2>📦 Status do Estoque</h2>

            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span className={styles.categoria}>{instituicao.categoria || 'Categoria'}</span>
                <span className={`${styles.badge} ${styles[`badge--${statusInfo.status}`]}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className={styles.statusContent}>
                <div className={styles.quantidade}>
                  <span className={styles.label}>Quantidade Atual</span>
                  <span className={styles.valor}>{instituicao.quantidade_atual || 0}</span>
                </div>

                <div className={styles.capacidade}>
                  <span className={styles.label}>Capacidade Máxima</span>
                  <span className={styles.valor}>{instituicao.capacidade_maxima || 0}</span>
                </div>

                <div className={styles.percentual}>
                  <span className={styles.label}>Preenchimento</span>
                  <span className={styles.valor}>{percentual.toFixed(1)}%</span>
                </div>
              </div>

              <div className={styles.barraContainer}>
                <div className={styles.barraProgresso}>
                  <div
                    className={styles.fill}
                    style={{
                      width: `${Math.min(percentual, 100)}%`,
                      backgroundColor: obterCorStatus(percentual)
                    }}
                  ></div>
                </div>
                <span className={styles.percentualLabel}>{percentual.toFixed(1)}%</span>
              </div>

              <p className={styles.mensagem}>
                {obterMensagem(statusInfo.label, instituicao.categoria, percentual)}
              </p>
            </div>

            {/* Recomendação de Doação */}
            <div className={styles.recomendacaoBox}>
              <h3>💡 Recomendação de Doação</h3>
              {(() => {
                const exemplos = obterExemplosCategoria(instituicao.categoria);
                return (
                  <>
                    {statusInfo.severidade === 'crítica' && (
                      <div>
                        <p className={styles.textoCritico}>
                          Esta instituição está em situação crítica e precisa urgentemente de doações de <strong>{exemplos.nome}</strong>.
                        </p>
                        {exemplos.exemplos.length > 0 && (
                          <p className={styles.exemplosTexto}>
                            Exemplos: {exemplos.exemplos.slice(0, 5).join(', ')}{exemplos.exemplos.length > 5 ? ' e mais.' : '.'}
                          </p>
                        )}
                      </div>
                    )}
                    {statusInfo.severidade === 'alta' && (
                      <div>
                        <p className={styles.textoAlta}>
                          Esta instituição tem nível baixo de <strong>{exemplos.nome}</strong>. Suas doações serão muito bem-vindas.
                        </p>
                        {exemplos.exemplos.length > 0 && (
                          <p className={styles.exemplosTexto}>
                            Exemplos: {exemplos.exemplos.slice(0, 5).join(', ')}{exemplos.exemplos.length > 5 ? ' e mais.' : '.'}
                          </p>
                        )}
                      </div>
                    )}
                    {statusInfo.severidade === 'normal' && (
                      <div>
                        <p className={styles.textoNormal}>
                          Esta instituição está em situação estável de <strong>{exemplos.nome}</strong>. Qualquer doação é bem-vinda!
                        </p>
                        {exemplos.exemplos.length > 0 && (
                          <p className={styles.exemplosTexto}>
                            Exemplos: {exemplos.exemplos.slice(0, 5).join(', ')}{exemplos.exemplos.length > 5 ? ' e mais.' : '.'}
                          </p>
                        )}
                      </div>
                    )}
                    {statusInfo.severidade === 'info' && (
                      <div>
                        <p className={styles.textoInfo}>
                          Esta instituição tem estoque suficiente de <strong>{exemplos.nome}</strong> no momento. Considere outras instituições.
                        </p>
                        {exemplos.exemplos.length > 0 && (
                          <p className={styles.exemplosTexto}>
                            Exemplos: {exemplos.exemplos.slice(0, 5).join(', ')}{exemplos.exemplos.length > 5 ? ' e mais.' : '.'}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}

              <div className={styles.acoes}>
                <button className={styles.botaoPrincipal} onClick={() => navigate(`/doacao/${id}`)}>
                  🎁 Fazer Doação
                </button>
                <button className={styles.botaoSecundario} onClick={() => navigate('/doador')}>
                  ← Voltar às Recomendações
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Seção de Estatísticas */}
        <section className={styles.estatisticas}>
          <h2>📊 Resumo Rápido</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Status Atual</span>
              <span className={styles.statValor}>{statusInfo.label}</span>
              <span className={styles.statDescricao}>{statusInfo.severidade}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Espaço Disponível</span>
              <span className={styles.statValor}>{(instituicao.capacidade_maxima || 0) - (instituicao.quantidade_atual || 0)}</span>
              <span className={styles.statDescricao}>itens</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Percentual Preenchido</span>
              <span className={styles.statValor}>{percentual.toFixed(0)}%</span>
              <span className={styles.statDescricao}>da capacidade</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
