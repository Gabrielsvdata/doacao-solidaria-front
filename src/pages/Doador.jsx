import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CardInstituicao from '../components/CardInstituicao';
import { getCategorias, getRecomendacao } from '../services/api';
import styles from './Doador.module.scss';

export default function Doador() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [todas, setTodas] = useState([]);
  const [categoriaSelected, setCategoriaSelected] = useState(null);
  const [filtro, setFiltro] = useState('recomendadas'); // 'recomendadas' ou 'todas'
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      setErro('');
      const response = await getCategorias();
      const cats = response.data?.categorias || response.data || [];
      setCategorias(cats);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setErro('Erro ao carregar categorias. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const buscarRecomendacoes = async (categoriaId) => {
    try {
      setCarregando(true);
      setErro('');
      setCategoriaSelected(categoriaId);
      setFiltro('recomendadas'); // Reseta para recomendadas ao buscar
      const response = await getRecomendacao(categoriaId);
      
      // Novo formato: recomendacoes e todas
      const recomendacoes_dados = response.data?.recomendacoes || [];
      const todas_dados = response.data?.todas || recomendacoes_dados;
      
      setRecomendacoes(recomendacoes_dados);
      setTodas(todas_dados);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      setErro('Erro ao buscar instituições. Tente novamente.');
      setRecomendacoes([]);
      setTodas([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleVerDetalhes = (instituicao) => {
    // Guardar dados da instituição no localStorage
    localStorage.setItem(`instituicao_${instituicao.id || instituicao.instituicao_id}`, JSON.stringify(instituicao));
    // Navegar para página de detalhes
    navigate(`/instituicao/${instituicao.id || instituicao.instituicao_id}`);
  };

  if (carregando && categorias.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  const categoriaNome = categorias.find(c => c.id === categoriaSelected)?.nome || '';

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <section className={styles.heroSecao}>
          <h1>Ajude as Instituições que Mais Precisam</h1>
          <p>Escolha uma categoria de doação e veja as instituições que precisam mais</p>
        </section>

        {!categoriaSelected ? (
          <section className={styles.selectorSecao}>
            <h2>Selecione uma categoria:</h2>
            <div className={styles.categoriasGrid}>
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  className={styles.categoriaCard}
                  onClick={() => buscarRecomendacoes(cat.id)}
                >
                  <span className={styles.categoriaNome}>{cat.nome || cat}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className={styles.backSecao}>
              <button 
                className={styles.voltarBtn}
                onClick={() => { 
                  setCategoriaSelected(null); 
                  setRecomendacoes([]);
                  setTodas([]);
                  setFiltro('recomendadas');
                }}
              >
                ← Voltar às categorias
              </button>
            </section>

            {erro && (
              <div className={styles.erro}>
                <p>{erro}</p>
              </div>
            )}

            {!carregando && (
              <section className={styles.recomendacao}>
                {/* Filtro de visualização */}
                <div className={styles.filtroContainer}>
                  <button
                    className={`${styles.filtroBtn} ${filtro === 'recomendadas' ? styles.ativo : ''}`}
                    onClick={() => setFiltro('recomendadas')}
                  >
                    ⭐ Recomendadas ({recomendacoes.length})
                  </button>
                  <button
                    className={`${styles.filtroBtn} ${filtro === 'todas' ? styles.ativo : ''}`}
                    onClick={() => setFiltro('todas')}
                  >
                    📋 Todas as Instituições ({todas.length})
                  </button>
                </div>

                {/* Mensagem informativa */}
                <div className={styles.msgRecomendacao}>
                  {filtro === 'recomendadas' ? (
                    <p>🎯 Estas instituições têm maior necessidade desta categoria. Sua doação fará muita diferença!</p>
                  ) : (
                    <p>📊 Aqui estão todas as instituições que trabalham com esta categoria, independente do nível de estoque.</p>
                  )}
                </div>

                {/* Lista de cards */}
                {(filtro === 'recomendadas' ? recomendacoes : todas).length > 0 ? (
                  <div className={styles.cardsContainer}>
                    {(filtro === 'recomendadas' ? recomendacoes : todas).map(inst => (
                      <CardInstituicao
                        key={inst.instituicao_id}
                        instituicao={{
                          id: inst.instituicao_id,
                          nome: inst.nome,
                          endereco: inst.endereco,
                          numero: inst.numero,
                          complemento: inst.complemento,
                          bairro: inst.bairro,
                          cidade: inst.cidade,
                          estado: inst.estado,
                          cep: inst.cep,
                          telefone: inst.telefone,
                          horario: inst.horario_funcionamento,
                          percentual: inst.percentual_preenchido || 0,
                          quantidade_atual: inst.quantidade_atual,
                          capacidade_maxima: inst.capacidade_maxima,
                          categoria: categoriaNome,
                          status_estoque: inst.status_estoque,
                          instituicao_id: inst.instituicao_id
                        }}
                        onVerDetalhes={handleVerDetalhes}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.vazio}>
                    <p>Nenhuma instituição encontrada para esta categoria.</p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
