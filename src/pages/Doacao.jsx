import React, { useState, useEffect } from 'react';
import Botao from '../components/Botao';
import CardInstituicao from '../components/CardInstituicao';
import { getCategorias, getRecomendacao } from '../services/api';
import { aplicarFiltros } from '../services/recomendacoes';
import { obterMensagemAleatoria } from '../services/dicasDoacao';
import styles from './Doacao.module.scss';

const Doacao = () => {
  const [categorias, setCategorias] = useState([]);
  const [instituicoes, setInstituicoes] = useState([]);
  const [categoriaSelected, setCategoriaSelected] = useState('todos');
  const [ordem, setOrdem] = useState('recomendacao');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const cats = await getCategorias();
        setCategorias(cats);
        
        if (cats.length > 0) {
          const recomendacoes = await getRecomendacao(1, cats[0].id);
          setInstituicoes(recomendacoes);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const handleCategoriaChange = async (e) => {
    const categoria = e.target.value;
    setCategoriaSelected(categoria);
    
    if (categoria !== 'todos') {
      try {
        const recomendacoes = await getRecomendacao(1, categoria);
        setInstituicoes(recomendacoes);
      } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
      }
    }
  };

  const handleDoacionar = (instituicaoId) => {
    setMensagem(obterMensagemAleatoria());
    setTimeout(() => setMensagem(''), 3000);
  };

  const instituicoesFiltradas = aplicarFiltros(instituicoes, {
    categoria: categoriaSelected === 'todos' ? null : categoriaSelected,
    ordem
  });

  if (carregando) {
    return <div className={styles.doacaoContainer}><p>Carregando...</p></div>;
  }

  return (
    <div className={styles.doacaoContainer}>
      <h1>Escolha sua Instituição</h1>

      <div className={styles.filtrosSecao}>
        <div className={styles.filtroGrupo}>
          <label htmlFor="categoria">Categoria:</label>
          <select
            id="categoria"
            value={categoriaSelected}
            onChange={handleCategoriaChange}
            className={styles.selectFiltro}
          >
            <option value="todos">Todas as Categorias</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
        </div>

        <div className={styles.filtroGrupo}>
          <label htmlFor="ordem">Ordenar por:</label>
          <select
            id="ordem"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className={styles.selectFiltro}
          >
            <option value="recomendacao">Recomendação</option>
            <option value="nome">Nome</option>
            <option value="categoria">Categoria</option>
            <option value="recente">Mais Recente</option>
          </select>
        </div>
      </div>

      {mensagem && <div className={styles.mensagemMotivacao}>{mensagem}</div>}

      <div className={styles.instituicoesGrid}>
        {instituicoesFiltradas.map(inst => (
          <CardInstituicao
            key={inst.id}
            instituicao={inst}
            onDoacionar={handleDoacionar}
          />
        ))}
      </div>

      {instituicoesFiltradas.length === 0 && (
        <div className={styles.semResultados}>
          <p>Nenhuma instituição encontrada para os critérios selecionados.</p>
        </div>
      )}
    </div>
  );
};

export default Doacao;