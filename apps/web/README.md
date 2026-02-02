# 🚀 OrçaZap

> Dashboard web mobile-first para gerenciamento de leilões manuais de orçamentos via WhatsApp.

![Status](https://img.shields.io/badge/status-MVP-yellow)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-teal)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Stack Tecnológica](#-stack-tecnológica)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Arquitetura](#-arquitetura)
- [Como Executar](#-como-executar)
- [Roadmap](#-roadmap)
- [Melhorias Técnicas](#-melhorias-técnicas)
- [Sugestões de Features](#-sugestões-de-features)

---

## 📖 Sobre o Projeto

O **OrçaZap** é uma solução para empresas e profissionais que precisam solicitar orçamentos de múltiplos fornecedores simultaneamente via WhatsApp, transformando um processo manual e desorganizado em um sistema visual e eficiente.

### 🎯 Problema Resolvido

- Enviar mensagens de orçamento para dezenas de fornecedores manualmente
- Perder controle de quem já respondeu
- Dificuldade em comparar preços e escolher o melhor fornecedor
- Falta de histórico e organização

### 💡 Solução

Um dashboard intuitivo que permite:
- Criar orçamentos em menos de 30 segundos
- Acompanhar respostas em tempo real
- Comparar valores lado a lado
- Fechar negociações com um clique

---

## 🛠 Stack Tecnológica

### Core

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React** | 18.3 | Biblioteca UI |
| **Vite** | 5.x | Build tool e dev server |
| **TypeScript** | 5.x | Tipagem estática |
| **TailwindCSS** | 4.x | Framework CSS utility-first |

### UI & Componentes

| Tecnologia | Descrição |
|------------|-----------|
| **shadcn/ui** | Componentes acessíveis e customizáveis |
| **Radix UI** | Primitivos headless para componentes |
| **Lucide Icons** | Biblioteca de ícones moderna |
| **Sonner** | Sistema de notificações toast |
| **Vaul** | Drawer/modal para mobile |

### Estado & Formulários

| Tecnologia | Descrição |
|------------|-----------|
| **Zustand** | Gerenciamento de estado global leve |
| **React Hook Form** | Formulários performáticos |
| **Zod** | Validação de schemas |

### Roteamento & Data Fetching

| Tecnologia | Descrição |
|------------|-----------|
| **React Router DOM** | Roteamento SPA |
| **TanStack Query** | Cache e sincronização de dados (preparado) |

### Utilitários

| Tecnologia | Descrição |
|------------|-----------|
| **date-fns** | Manipulação de datas |
| **clsx / tailwind-merge** | Merge de classes CSS |
| **class-variance-authority** | Variantes de componentes |

---

## ✅ Funcionalidades Implementadas

### 📊 Dashboard
- [x] Cards de estatísticas (orçamentos abertos, aguardando, fechados)
- [x] Lista de orçamentos em aberto com preview
- [x] Barra de progresso de respostas
- [x] FAB (Floating Action Button) para novo orçamento
- [x] Navegação rápida para detalhes

### 📝 Orçamentos
- [x] Listagem com tabs (Em orçamento / Fechados)
- [x] Filtros por categoria e cidade
- [x] Criação em 2 passos (Segmentação → Mensagem)
- [x] Seleção múltipla de cidades
- [x] Contador de fornecedores encontrados
- [x] Mensagem pré-preenchida editável

### 🎯 Detalhe do Orçamento (Leilão)
- [x] Badge de status visual (EM ORÇAMENTO / FECHADO)
- [x] Mensagem colapsável
- [x] Campo de observação geral editável
- [x] Lista de fornecedores com status individual
- [x] Drawer lateral para edição rápida
- [x] Campos: valor, observação, status
- [x] Botão "Abrir WhatsApp" por fornecedor
- [x] Modal de encerramento com seleção de vencedor
- [x] Destaque visual do vencedor

### 👥 Fornecedores
- [x] CRUD completo
- [x] Busca por nome ou WhatsApp
- [x] Filtros por categoria e cidade
- [x] Drawer lateral para criar/editar
- [x] Campos: nome, categoria, cidade, endereço, WhatsApp, observações
- [x] Confirmação antes de excluir

### 📱 WhatsApp Instâncias
- [x] Cards de instâncias
- [x] Status de conexão visual
- [x] Modal de QR Code (mock)
- [x] Criar/excluir instâncias
- [x] Simular conexão/desconexão

### 🎨 UI/UX
- [x] Design mobile-first
- [x] Bottom Navigation (mobile)
- [x] Sidebar (desktop)
- [x] Tema personalizado (paleta teal)
- [x] Animações suaves
- [x] Estados vazios com CTAs
- [x] Feedback visual em todas as ações
- [x] Responsividade completa

---

## 🏗 Arquitetura

```
src/
├── components/
│   ├── layout/           # AppLayout, BottomNav, Sidebar
│   ├── ui/               # Componentes shadcn/ui
│   ├── CardStat.tsx      # Card de estatísticas
│   ├── ConfirmModal.tsx  # Modal de confirmação
│   ├── EmptyState.tsx    # Estado vazio
│   ├── FloatingActionButton.tsx
│   ├── ListItemClickable.tsx
│   ├── MultiSelect.tsx   # Seleção múltipla
│   ├── QuickDrawer.tsx   # Drawer lateral
│   └── StatusBadge.tsx   # Badges de status
├── data/
│   └── mockData.ts       # Dados mockados
├── hooks/
│   ├── use-mobile.tsx    # Detecção mobile
│   └── use-toast.ts      # Sistema de toasts
├── pages/
│   ├── Dashboard.tsx
│   ├── QuotesList.tsx
│   ├── QuoteDetail.tsx
│   ├── NewQuote.tsx
│   ├── SuppliersList.tsx
│   └── WhatsAppInstances.tsx
├── stores/
│   ├── quoteStore.ts     # Estado de orçamentos
│   ├── supplierStore.ts  # Estado de fornecedores
│   └── whatsappStore.ts  # Estado de instâncias
├── types/
│   └── index.ts          # Tipagens TypeScript
└── lib/
    └── utils.ts          # Utilitários
```

### Padrões Utilizados

- **Zustand Stores**: Estado global separado por domínio
- **Componentes Compostos**: UI modular e reutilizável
- **Mobile-First**: CSS pensado primeiro para mobile
- **Tipagem Forte**: TypeScript em todo o projeto

---

## 🚀 Como Executar

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>

# Entre no diretório
cd <YOUR_PROJECT_NAME>

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

---

## 🗺 Roadmap

### Fase 1: Backend & Persistência 🔴 Próximo
- [ ] Integrar Lovable Cloud (PostgreSQL)
- [ ] Migrar dados mock para banco de dados
- [ ] Implementar autenticação (login/senha)
- [ ] Criar RLS policies para multi-tenancy

### Fase 2: Integração WhatsApp 🟡
- [ ] Integrar Evolution API ou Z-API
- [ ] Envio real de mensagens
- [ ] Recebimento de respostas
- [ ] Webhook para atualização automática
- [ ] Templates de mensagem

### Fase 3: Relatórios & Analytics 🟢
- [ ] Dashboard de relatórios
- [ ] Gráficos de economia
- [ ] Tempo médio de resposta
- [ ] Ranking de fornecedores
- [ ] Exportação para Excel/PDF

### Fase 4: Automação 🔵
- [ ] Notificações push
- [ ] Lembretes automáticos
- [ ] Follow-up para não respondidos
- [ ] Agendamento de orçamentos
- [ ] IA para análise de respostas

---

## 🔧 Melhorias Técnicas

### Performance
- [ ] Implementar lazy loading nas rotas
- [ ] Adicionar React.memo em listas grandes
- [ ] Virtualização de listas longas (react-window)
- [ ] Otimizar re-renders com useMemo/useCallback
- [ ] Service Worker para PWA offline

### Qualidade de Código
- [ ] Aumentar cobertura de testes (Vitest)
- [ ] Adicionar testes E2E (Playwright)
- [ ] Implementar Storybook para componentes
- [ ] Configurar Husky + lint-staged
- [ ] Documentação de componentes com JSDoc

### Acessibilidade
- [ ] Auditar com axe-core
- [ ] Melhorar navegação por teclado
- [ ] Adicionar skip links
- [ ] Melhorar contraste em alguns elementos
- [ ] Suporte a screen readers

### DevOps
- [ ] CI/CD com GitHub Actions
- [ ] Preview deployments por PR
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics de uso (Posthog)

---

## 💡 Sugestões de Features

### Alta Prioridade
1. **Multi-usuário com permissões**
   - Admin, Comprador, Visualizador
   - Orçamentos por equipe/departamento

2. **Histórico de preços**
   - Comparar preços do mesmo fornecedor ao longo do tempo
   - Alertas de variação de preço

3. **Categorias e cidades dinâmicas**
   - CRUD para gerenciar categorias
   - Importação de cidades por estado

### Média Prioridade
4. **Anexos em orçamentos**
   - Upload de especificações técnicas
   - Fotos de produtos
   - Documentos PDF

5. **Avaliação de fornecedores**
   - Sistema de estrelas
   - Comentários internos
   - Tempo médio de resposta

6. **Templates de mensagem**
   - Salvar mensagens frequentes
   - Variáveis dinâmicas ({nome_fornecedor}, {prazo})

### Baixa Prioridade (Nice to Have)
7. **Modo escuro**
   - Toggle dark/light mode
   - Respeitar preferência do sistema

8. **Exportação de dados**
   - Relatórios em PDF
   - Planilhas Excel
   - Integração com ERPs

9. **App nativo (PWA)**
   - Instalável no celular
   - Funcionar offline
   - Notificações push nativas

10. **Integração com mapas**
    - Visualizar fornecedores no mapa
    - Calcular distância/frete

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

<p align="center">
  Feito com 💚 usando <a href="https://lovable.dev">Lovable</a>
</p>
