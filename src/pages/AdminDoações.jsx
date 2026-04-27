import { useState, useEffect } from 'react';
import { getDoacoesValidacao, validarDoacao } from '../services/api';
import { getAuth } from '../services/auth';
import SearchBar from '../components/SearchBar';
import Botao from '../components/Botao';
import ModalNotificacao from '../components/ModalNotificacao';
import styles from './AdminDoações.module.scss';

// Motivos de rejeição
const MOTIVOS_REJEICAO = [
  "Fora da validade",
  "Embalagem violada",
  "Rasgado/Danificado",
  "Quantidade menor que declarado",
  "Não corresponde ao tipo",
  "Em mau estado de conservação",
  "Outro"
];

// Função para formatar datas
const formatarData = (dataString) => {
  if (!dataString) return 'N/A';
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  } catch {
    return 'N/A';
  }
};

// Função para formatar data e hora
const formatarDataHora = (dataString) => {
  if (!dataString) return 'N/A';
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'N/A';
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  } catch {
    return 'N/A';
  }
};

export default function AdminDoações() {
  const usuario = getAuth();
  const [doacoes, setDoacoes] = useState([]);
  const [abaSelecionada, setAbaSelecionada] = useState('AGENDADA');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [rejeicaoModal, setRejeicaoModal] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [contadoresGlobais, setContadoresGlobais] = useState({
    AGENDADA: 0,
    APROVADA: 0,
    REJEITADA: 0
  });
  
  // Estados para modal de notificação
  const [notificacao, setNotificacao] = useState({
    visivel: false,
    tipo: 'info',
    titulo: '',
    mensagem: '',
    botoes: []
  });
  
  const [doacaoParaAprovar, setDoacaoParaAprovar] = useState(null);

  // Filtros por abas
  const abas = [
    { label: '📋 Validar', valor: 'AGENDADA' },
    { label: '✓ Aprovadas', valor: 'APROVADA' },
    { label: '✗ Rejeitadas', valor: 'REJEITADA' }
  ];

  // Carregar contadores de TODAS as abas ao montar
  useEffect(() => {
    if (usuario?.id) {
      carregarContadores();
      carregarDoacoes();
    }
  }, []);

  // Carregar doações quando aba muda
  useEffect(() => {
    if (usuario?.id && !carregando) {
      carregarDoacoes();
    }
  }, [abaSelecionada, usuario?.id]);

  // Carrega contadores de TODAS as abas (paralelo)
  const carregarContadores = async () => {
    try {
      const token = usuario?.id;
      // Fazer 3 requisições paralelas para cada status
      const respostas = await Promise.all([
        getDoacoesValidacao({ status: 'AGENDADA' }, token).catch(() => ({ data: { doacoes: [] } })),
        getDoacoesValidacao({ status: 'APROVADA' }, token).catch(() => ({ data: { doacoes: [] } })),
        getDoacoesValidacao({ status: 'REJEITADA' }, token).catch(() => ({ data: { doacoes: [] } }))
      ]);

      const contadores = {
        AGENDADA: respostas[0].data?.doacoes?.length || 0,
        APROVADA: respostas[1].data?.doacoes?.length || 0,
        REJEITADA: respostas[2].data?.doacoes?.length || 0
      };

      setContadoresGlobais(contadores);
      console.log('Contadores carregados:', contadores);
    } catch (error) {
      console.error('Erro ao carregar contadores:', error);
    }
  };

  const carregarDoacoes = async () => {
    try {
      setCarregando(true);
      setErro('');
      const token = usuario?.id;
      console.log('Carregando doações com status:', abaSelecionada, 'e token:', token);
      const response = await getDoacoesValidacao({ status: abaSelecionada }, token);
      console.log('Resposta da API:', response.data);
      setDoacoes(response.data?.doacoes || []);
      
      // Atualizar contador global para esta aba
      setContadoresGlobais(prev => ({
        ...prev,
        [abaSelecionada]: response.data?.doacoes?.length || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      setErro('Erro ao carregar doações');
      setDoacoes([]);
    } finally {
      setCarregando(false);
    }
  };

  // Filtrar por busca
  const doacoesFiltradas = doacoes.filter(d => {
    const termo = busca.toLowerCase();
    return (
      d.doador_nome?.toLowerCase().includes(termo) ||
      d.doador_telefone?.toLowerCase().includes(termo) ||
      d.categoria?.toLowerCase().includes(termo) ||
      d.instituicao?.toLowerCase().includes(termo)
    );
  });

  // Validar se pode aprovar/rejeitar (data limite)
  const podeValidarDoacao = (dataAgendamento) => {
    const hoje = new Date();
    const dataPrevista = new Date(dataAgendamento);
    const diasPassados = Math.floor((hoje - dataPrevista) / (1000 * 60 * 60 * 24));
    return diasPassados <= 2; // Pode validar até 2 dias depois da data agendada
  };

  // Aprovar doação
  const handleAprovar = (doacao) => {
    // Validar data
    if (!podeValidarDoacao(doacao.data_agendamento)) {
      setNotificacao({
        visivel: true,
        tipo: 'erro',
        titulo: '⏰ Prazo Expirado',
        mensagem: `Prazo expirado para validar esta doação. Data agendada: ${formatarData(doacao.data_agendamento)}. Você tem até 2 dias após a data para validar.`,
        botoes: [
          { texto: 'Entendi', tipo: 'danger', fechar: true }
        ]
      });
      return;
    }

    // Mostrar confirmação
    setDoacaoParaAprovar(doacao);
    setNotificacao({
      visivel: true,
      tipo: 'info',
      titulo: '✅ Confirmar Aprovação',
      mensagem: `Deseja aprovar a doação de ${doacao.quantidade} ${doacao.unidade} de ${doacao.categoria}?`,
      botoes: [
        { 
          texto: 'Cancelar',
          tipo: 'secondary',
          acao: () => setDoacaoParaAprovar(null),
          fechar: true
        },
        { 
          texto: 'Aprovar',
          tipo: 'success',
          acao: () => confirmarAprovacao(doacao),
          fechar: false
        }
      ]
    });
  };

  // Executar aprovação
  const confirmarAprovacao = async (doacao) => {
    try {
      setProcessando(true);
      const token = usuario?.id;
      await validarDoacao(doacao.id, {
        usuario_id: usuario?.id,
        acao: 'APROVAR'
      }, token);

      setNotificacao({
        visivel: true,
        tipo: 'sucesso',
        titulo: '🎉 Doação Aprovada',
        mensagem: `Doação de ${doacao.quantidade} ${doacao.unidade} de ${doacao.categoria} foi aprovada com sucesso!`,
        botoes: [
          { 
            texto: 'OK',
            tipo: 'success',
            acao: async () => {
              await carregarContadores();
              await carregarDoacoes();
              setDoacaoParaAprovar(null);
            },
            fechar: true
          }
        ]
      });
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      setNotificacao({
        visivel: true,
        tipo: 'erro',
        titulo: '❌ Erro na Aprovação',
        mensagem: error.response?.data?.erro || 'Erro ao aprovar doação. Tente novamente.',
        botoes: [
          { texto: 'Fechar', tipo: 'danger', fechar: true }
        ]
      });
    } finally {
      setProcessando(false);
    }
  };

  // Rejeitar doação
  const handleRejeitar = (doacao) => {
    // Validar data
    if (!podeValidarDoacao(doacao.data_agendamento)) {
      setNotificacao({
        visivel: true,
        tipo: 'erro',
        titulo: '⏰ Prazo Expirado',
        mensagem: `Prazo expirado para validar esta doação. Data agendada: ${formatarData(doacao.data_agendamento)}. Você tem até 2 dias após a data para validar.`,
        botoes: [
          { texto: 'Entendi', tipo: 'danger', fechar: true }
        ]
      });
      return;
    }
    
    setRejeicaoModal(doacao);
    setMotivoRejeicao('');
  };

  // Confirmar rejeição
  const confirmarRejeicao = async () => {
    if (!motivoRejeicao) {
      setNotificacao({
        visivel: true,
        tipo: 'aviso',
        titulo: '⚠️ Motivo Obrigatório',
        mensagem: 'Selecione um motivo para rejeição antes de confirmar.',
        botoes: [
          { texto: 'OK', tipo: 'secondary', fechar: true }
        ]
      });
      return;
    }

    try {
      setProcessando(true);
      const token = usuario?.id;
      await validarDoacao(rejeicaoModal.id, {
        usuario_id: usuario?.id,
        acao: 'REJEITAR',
        motivo_rejeicao: motivoRejeicao
      }, token);

      setNotificacao({
        visivel: true,
        tipo: 'sucesso',
        titulo: '✓ Doação Rejeitada',
        mensagem: `Doação rejeitada. Motivo: ${motivoRejeicao}`,
        botoes: [
          { 
            texto: 'OK',
            tipo: 'success',
            acao: async () => {
              await carregarContadores();
              await carregarDoacoes();
              setRejeicaoModal(null);
              setMotivoRejeicao('');
            },
            fechar: true
          }
        ]
      });
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      setNotificacao({
        visivel: true,
        tipo: 'erro',
        titulo: '❌ Erro na Rejeição',
        mensagem: error.response?.data?.erro || 'Erro ao rejeitar doação. Tente novamente.',
        botoes: [
          { texto: 'Fechar', tipo: 'danger', fechar: true }
        ]
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleBusca = (e) => {
    setBusca(e.target.value);
  };

  // Usar contadores pré-carregados em vez de filtrar localmente
  const contadores = contadoresGlobais;

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando doações...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎁 Validação de Doações</h1>
        <p>Análise e aprovação de doações agendadas</p>
      </header>

      {erro && (
        <div className={styles.erro}>
          <p>{erro}</p>
        </div>
      )}

      {/* Abas */}
      <div className={styles.abas}>
        {abas.map(aba => (
          <button
            key={aba.valor}
            className={`${styles.abaBtn} ${abaSelecionada === aba.valor ? styles.abaAtiva : ''}`}
            onClick={() => setAbaSelecionada(aba.valor)}
          >
            {aba.label}
            <span className={styles.abaContador}>{contadores[aba.valor]}</span>
          </button>
        ))}
      </div>

      {/* Filtro de busca */}
      <div className={styles.filtros}>
        <SearchBar
          valor={busca}
          onChange={handleBusca}
          placeholder="Buscar por doador, telefone, categoria ou instituição..."
        />
      </div>

      {/* Resultado de busca */}
      <div className={styles.resultado}>
        <p className={styles.contador}>
          {doacoesFiltradas.length} de {doacoes.length} doações
        </p>
      </div>

      {/* Lista de doações */}
      {doacoesFiltradas.length > 0 ? (
        <div className={styles.doacoesList}>
          {doacoesFiltradas.map(doacao => (
            <div key={doacao.id} className={styles.doacaoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                  <h3>{doacao.doador_nome}</h3>
                  <p className={styles.telefone}>{doacao.doador_telefone}</p>
                </div>
                <div className={`${styles.statusBadge} ${styles[`status_${doacao.status}`.toLowerCase()]}`}>
                  {doacao.status}
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.linha}>
                  <span className={styles.label}>Categoria:</span>
                  <span className={styles.valor}>{doacao.categoria}</span>
                </div>

                <div className={styles.linha}>
                  <span className={styles.label}>Quantidade:</span>
                  <span className={styles.valor}>
                    {doacao.quantidade} {doacao.unidade}
                  </span>
                </div>

                <div className={styles.linha}>
                  <span className={styles.label}>Instituição:</span>
                  <span className={styles.valor}>{doacao.instituicao}</span>
                </div>

                <div className={styles.linha}>
                  <span className={styles.label}>Data agendada:</span>
                  <span className={styles.valor}>{formatarData(doacao.data_agendamento)}</span>
                </div>

                <div className={styles.linha}>
                  <span className={styles.label}>Criada em:</span>
                  <span className={styles.valor}>{formatarDataHora(doacao.data_criacao)}</span>
                </div>

                {doacao.data_validacao && (
                  <div className={styles.linha}>
                    <span className={styles.label}>Validada em:</span>
                    <span className={styles.valor}>{formatarDataHora(doacao.data_validacao)}</span>
                  </div>
                )}

                {doacao.motivo_rejeicao && (
                  <div className={styles.linha}>
                    <span className={styles.label}>Motivo rejeição:</span>
                    <span className={styles.valor}>{doacao.motivo_rejeicao}</span>
                  </div>
                )}
              </div>

              {/* Ações para abas específicas */}
              {doacao.status === 'AGENDADA' && (
                <div className={styles.cardFooter}>
                  <Botao
                    cor="success"
                    texto="✓ Aprovar"
                    onClick={() => handleAprovar(doacao)}
                    desabilitado={processando}
                    tamanho="pequeno"
                  />
                  <Botao
                    cor="danger"
                    texto="✕ Rejeitar"
                    onClick={() => handleRejeitar(doacao)}
                    desabilitado={processando}
                    tamanho="pequeno"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.vazio}>
          <p>Nenhuma doação encontrada em status "{abaSelecionada}".</p>
        </div>
      )}

      {/* Modal de rejeição */}
      {rejeicaoModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Rejeitar Doação</h3>
            <p>Doador: <strong>{rejeicaoModal.doador_nome}</strong></p>
            <p>Quantidade: <strong>{rejeicaoModal.quantidade} {rejeicaoModal.unidade}</strong></p>

            <div className={styles.modalForm}>
              <label>Motivo da rejeição:</label>
              <select
                value={motivoRejeicao}
                onChange={e => setMotivoRejeicao(e.target.value)}
                className={styles.select}
              >
                <option value="">Selecione um motivo...</option>
                {MOTIVOS_REJEICAO.map(motivo => (
                  <option key={motivo} value={motivo}>
                    {motivo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modalFooter}>
              <Botao
                cor="secondary"
                texto="Cancelar"
                onClick={() => {
                  setRejeicaoModal(null);
                  setMotivoRejeicao('');
                }}
                desabilitado={processando}
                tamanho="pequeno"
              />
              <Botao
                cor="danger"
                texto="Confirmar Rejeição"
                onClick={confirmarRejeicao}
                desabilitado={processando || !motivoRejeicao}
                tamanho="pequeno"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificação */}
      <ModalNotificacao
        visible={notificacao.visivel}
        tipo={notificacao.tipo}
        titulo={notificacao.titulo}
        mensagem={notificacao.mensagem}
        botoes={notificacao.botoes}
        onFechar={() => setNotificacao({ ...notificacao, visivel: false })}
      />
    </div>
  );
}
