# 🎨 Doação Solidária - Front-end (Interface do Usuário)

> Aplicação React moderna e responsiva para conectar doadores com instituições que precisam

---

## 📋 Visão Geral

Este é o **front-end do Sistema de Recomendação de Doações**. A interface é dividida em **duas grandes seções**:

1. **Seção Doador** - Interface pública para descobrir instituições
2. **Seção Admin** - Dashboard privado para gerenciar estoques

---

## 🎯 Principais Funcionalidades

### 👤 Área do Doador

#### 🏠 Home (`/`)
- Apresentação da plataforma
- Chamada à ação para iniciar doação
- Explicação do funcionamento

#### 💚 Página de Recomendações (`/doador`)

**Fluxo:**
1. Seleciona categoria (dropdown)
2. Sistema carrega recomendações
3. Visualiza cards de instituições

**Cards mostram:**
- 🏢 Nome da instituição
- 📍 Endereço e cidade
- 📊 Status visual (badge com cor)
- 📈 Percentual de preenchimento
- 🔢 Quantidade: "120 de 1000 itens"
- 📝 Mensagem contextualizada
- 🔗 Botão "Ver Detalhes"

**Filtros:**
- ⭐ "Recomendadas" (TOP 3 prioritárias)
- 📋 "Todas" (10 instituições ordenadas)

#### 🔍 Página de Detalhes (`/instituicao/:id`)

**Seção 1: Informações de Contato**
```
Localização
├─ 📍 Endereço completo
├─ 📱 Telefone
└─ 🕐 Horário de funcionamento

Doação
└─ 🎁 Botão "Fazer Doação"
```

**Seção 2: Status do Estoque**
```
Status Atual
├─ 📊 Gráfico de progresso visual
├─ 🎨 Badge colorido (CRÍTICO, BOM, etc)
├─ ℹ️ Mensagem explicativa
├─ 🔢 "120 de 1000 itens (12%)"
└─ 📌 Recomendação de doação
```

**Responsividade:**
- Desktop: 2 colunas lado a lado
- Mobile: 1 coluna empilhada

---

### 🔐 Área do Admin

#### 🔑 Login (`/admin/login`)

**Campos:**
- Email (validação)
- Senha (encriptada)

**Segurança:**
- Token JWT armazenado em localStorage
- Redirecionamento automático se não autenticado
- Logout clear de dados

#### 📊 Dashboard (`/admin`)

**Cards de Estatísticas:**
- Total de instituições
- Total de categorias
- Estoque crítico (instituições com <20%)
- Últimas doações

**Abas/Seções:**

1. **Estoques** 
   - Tabela com todos os estoques
   - Busca e filtro por categoria
   - Botão "Atualizar" para cada item
   - Modal de edição com validação

2. **Doações Recebidas**
   - Lista de todas as entradas
   - Data, quantidade, categoria
   - Instituição beneficiada

3. **Instituições**
   - Criar nova instituição
   - Editar dados
   - Deletar instituição
   - Modal de formulário

4. **Usuários**
   - Criar novo admin
   - Editar permissões
   - Deletar conta

5. **Distribuições**
   - Registrar saída de doações
   - Transferência entre instituições
   - Tipo de saída (família, instituição, descarte)

---

## 🏗️ Estrutura do Projeto

```
doacao-solidaria-frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Botao.jsx
│   │   ├── CardInstituicao.jsx
│   │   ├── Header.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SearchBar.jsx
│   │   └── Sidebar.jsx
│   │
│   ├── pages/               # Páginas principais
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminDistribuicoes.jsx
│   │   ├── AdminDoacoes.jsx
│   │   ├── AdminEstoque.jsx
│   │   ├── AdminInstituicoes.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── AdminRegistro.jsx
│   │   ├── AdminUsuarios.jsx
│   │   ├── DetalhesInstituicao.jsx
│   │   ├── Doacao.jsx
│   │   ├── Doador.jsx
│   │   ├── Home.jsx
│   │   └── Login.jsx
│   │
│   ├── services/            # Lógica de API
│   │   ├── api.js           # Requisições HTTP
│   │   ├── auth.js          # Gerenciamento de autenticação
│   │   └── dicasDoacao.js   # Dicas motivacionais (removido)
│   │
│   ├── App.jsx              # Componente raiz + Routing
│   ├── main.jsx             # Ponto de entrada
│   └── index.css            # Estilos globais
│
├── public/
│   └── images/              # Imagens do projeto
│
├── package.json
├── vite.config.js
└── index.html
```

---

## 🎨 Sistema de Cores e Status

### Status Visual (6 Níveis)

```
FALTA (0%)
├─ Cor: 🔴 #7f1d1d (vermelho escuro)
├─ Badge: 🚨
├─ Mensagem: "SEM estoque"
└─ Prioridade: CRÍTICA

CRÍTICO (1-20%)
├─ Cor: 🔴 #dc2626 (vermelho)
├─ Badge: ⚠️
├─ Mensagem: "Nível crítico"
└─ Prioridade: MUY ALTA

BAIXO (21-50%)
├─ Cor: 🟠 #f97316 (laranja)
├─ Badge: ⚠️
├─ Mensagem: "Nível baixo"
└─ Prioridade: ALTA

MÉDIO (51-80%)
├─ Cor: 🟡 #eab308 (amarelo)
├─ Badge: ℹ️
├─ Mensagem: "Nível moderado"
└─ Prioridade: NORMAL

BOM (81-100%)
├─ Cor: 🟢 #10b981 (verde)
├─ Badge: ✅
├─ Mensagem: "Bom estoque"
└─ Prioridade: BAIXA

EXCESSO (>100%)
├─ Cor: 🟣 #8b5cf6 (roxo)
├─ Badge: 📦
├─ Mensagem: "Excesso"
└─ Prioridade: IGNORAR
```

---

## 🔌 Integração com Backend

### Pontos de Conexão (API Calls)

**Arquivo**: `src/services/api.js`

#### Doador (Sem autenticação)
```javascript
// Buscar categorias
getCategorias() 
  GET /doador/categorias

// Buscar recomendações
getRecomendacao(categoriaId)
  POST /doador/recomendacao
  Body: { categoria_id: 1 }

// Buscar instituição específica
getInstituicao(id)
  GET /instituicoes/:id
```

#### Admin (Com token JWT)
```javascript
// Login
login(email, senha)
  POST /admin/login

// Estoque
getEstoque(token)
  GET /admin/estoque

updateEstoque(id, data, token)
  PUT /admin/estoque/:id

// Análise
getAnalise(token)
  GET /admin/analise

// Doações
getDoacoes(token)
  GET /admin/doacoes

// Instituições
getInstituicoes(token)
  GET /admin/instituicoes

// Distribuições
createDistribuicao(data, token)
  POST /admin/distribuicoes

getDistribuicoes(token)
  GET /admin/distribuicoes
```

---

## 🧩 Componentes Principais

### CardInstituicao
**Propósito**: Exibir card de instituição com status

**Props:**
```javascript
{
  instituicao: {
    id, nome, endereco, cidade,
    telefone, horario, 
    percentual, quantidade_atual,
    capacidade_maxima, categoria, 
    status_estoque
  },
  onVerDetalhes: (instituicao) => {}  // Callback
}
```

**Elementos:**
- Header com nome + badge
- Mensagem contextualizada
- Info box (endereço, telefone)
- Barra de progresso
- Botão "Ver Detalhes"

### AdminLayout
**Propósito**: Layout wrapper para todas as páginas admin

**Componentes:**
- Header com logout
- Sidebar com navegação
- Conteúdo principal (children)
- Responsive menu mobile

---

## 🎯 Fluxos de Interação

### Fluxo 1: Doador Busca Doação
```
Home
  └─ Clica em "Começar a Ajudar"
     └─ Vai para /doador
        └─ Seleciona categoria
           └─ Carrega recomendações
              └─ Visualiza cards
                 └─ Clica "Ver Detalhes"
                    └─ Vai para /instituicao/123
                       └─ Vê informações completas
                          └─ Clica "Fazer Doação"
                             └─ Registra intenção (hoje: alert)
```

### Fluxo 2: Admin Registra Doação
```
Login (/admin/login)
  └─ Email + Senha
     └─ Recebe token JWT
        └─ Vai para /admin (Dashboard)
           └─ Clica em "Estoque"
              └─ Encontra instituição
                 └─ Clica "Atualizar"
                    └─ Modal abre
                       └─ Digita quantidade
                          └─ Confirma
                             └─ Estoque atualiza em tempo real
                                └─ Card visual muda de cor ✅
```

---

## 🔒 Segurança & Autenticação

### Sistema de Autenticação
```javascript
// Auth Flow
Email + Senha
  ↓
Backend valida (bcrypt)
  ↓
Retorna token JWT
  ↓
Frontend armazena em localStorage
  ↓
Cada requisição adiciona header:
Authorization: Bearer {token}
  ↓
Backend valida token
  ↓
Acesso concedido ✅
```

### ProtectedRoute
**Componente**: `src/components/ProtectedRoute.jsx`

```javascript
// Uso
<Route 
  path="/admin" 
  element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
/>

// Lógica
- Verifica se autenticado
- Se NÃO: redireciona para /admin/login
- Se SIM: renderiza componente
```

---

## 📱 Responsividade

### Breakpoints
```scss
Desktop    (1200px+) - Layout completo com 2 colunas
Tablet     (768px-1199px) - Layout adaptado
Mobile     (<768px) - 1 coluna, menu colapsável
```

### CSS Modules
**Padrão**: Cada página tem `.module.scss`
```
Doador.jsx + Doador.module.scss
AdminLayout.jsx + AdminLayout.module.scss
...
```

**Benefício**: Estilos isolados, sem conflitos

---

## 🚀 Como Executar

### Instalação
```bash
cd doacao-solidaria-frontend
npm install
```

### Desenvolvimento
```bash
npm run dev
# Abre em http://localhost:5173
# Hot reload automático
```

### Build para Produção
```bash
npm run build
# Cria pasta 'dist' otimizada
```

### Preview
```bash
npm run preview
# Visualiza build em localhost
```

---

## 📊 Stack Tecnológico

| Tecnologia | Versão | Uso | Status |
|-----------|--------|-----|--------|
| React | 19.0.0 | UI components | ✅ |
| Vite | 6.0.0 | Build tool | ✅ |
| React Router DOM | 7.1.0 | Navegação | ✅ |
| Axios | 1.7.0 | HTTP client | ✅ |
| SASS | 1.77.0 | Estilização avançada | ✅ |
| Recharts | 3.8.1 | Gráficos | ✅ |
| @vitejs/plugin-react | 4.3.0 | Plugin React Vite | ✅ |

---

## 🎨 Padrões de Código

### Componentes
```javascript
// Componente Funcional
export default function CardInstituicao({ instituicao, onVerDetalhes }) {
  const obterStatusBadge = (percentual) => {
    if (percentual === 0) return { status: 'FALTA', ... };
    if (percentual < 20) return { status: 'CRÍTICO', ... };
    // ...
  };

  return (
    <div className={styles.card}>
      {/* JSX */}
    </div>
  );
}
```

### Estilos
```scss
// BEM naming convention
.card {
  &__header { }
  &__body { }
  &__footer { }
  
  &:hover { }
  @media (max-width: 768px) { }
}
```

### Hooks
```javascript
const [filtro, setFiltro] = useState('recomendadas');
const navigate = useNavigate();

useEffect(() => {
  buscarDados();
}, [categoriaId]);
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Backend não responde" | Verificar se `npm start` no backend está rodando |
| "CORS error" | Verificar se CORS está configurado em server.js |
| "Token expirado" | Fazer login novamente |
| "Página em branco" | Abrir DevTools → Console e verificar erros |
| "Estilo quebrado" | Verificar se SASS está compilando |

---

## 📈 Performance

- **Vite**: Build 10x mais rápido que webpack
- **React 19**: Virtual DOM otimizado
- **CSS Modules**: Apenas estilos necessários carregados
- **Lazy Loading**: Rotas carregam sob demanda (com React Router)

---

## 🔮 Melhorias Futuras

- [ ] Modo escuro (Dark mode)
- [ ] Múltiplos idiomas (i18n)
- [ ] PWA (funciona offline)
- [ ] WebSocket (atualização em tempo real)
- [ ] Notificações push
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Storybook (documentação de componentes)

---

## 📞 Referências

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Axios Docs**: https://axios-http.com
- **SASS**: https://sass-lang.com

---

**Desenvolvido com ❤️ e React**

**Data**: 22 de Abril de 2026  
**Status**: 🟢 Pronto para Produção  
**Versão**: 1.0.0

#   d o a c a o - s o l i d a r i a - f r o n t  
 