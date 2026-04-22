import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

export default function Home() {
  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <h1 className={styles.logo}>Doação Solidária</h1>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroConteudo}>
            <h2 className={styles.heroTitulo}>Doação Solidária</h2>
            <p className={styles.heroSubtitulo}>Sistema de doações para situações de emergência em São Vicente</p>
            
            <div className={styles.descricao}>
              <p>Conectamos doadores com instituições que mais precisam de ajuda. Conhecemos diariamente as instituições que cuidam de famílias vítimas das enchentes.</p>
              <p>Somos rápidos, transparentes e seguros em cada doação que você realiza.</p>
            </div>

            <div className={styles.pergunta}>
              <h3>O que você deseja fazer?</h3>
              
              <div className={styles.acoesContainer}>
                <Link to="/doador" className={styles.acaoBtn}>
                  <button className={styles.btnLaranja}>Quero Doar</button>
                </Link>
                
                <Link to="/admin/login" className={styles.acaoBtn}>
                  <button className={styles.btnAzul}>Sou Administrador</button>
                </Link>
              </div>
            </div>
          </div>

          <aside className={styles.imagemApresentacao}>
            <img src="/images/telaInicial.jpeg" alt="Itens que podem ser doados" className={styles.telaInicialImg} />
          </aside>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Doação Solidária — São Vicente, SP | Projeto acadêmico</p>
      </footer>
    </div>
  );
}