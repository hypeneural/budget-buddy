# Budget Buddy - Sistema de Orçamentos com WhatsApp

Sistema completo para gestão de orçamentos e fornecedores com integração WhatsApp via Z-API.

## 🏗 Arquitetura do Projeto (Monorepo)

O projeto está organizado em um monorepo para facilitar o desenvolvimento fullstack:

- **`apps/api`**: Backend em Laravel 10 (API REST).
- **`apps/web`**: Frontend em React 18 + Vite.
- **`packages/shared`**: Tipagens compartilhadas (se necessário).

### Stack Tecnológico

**Frontend (`apps/web`)**
- **Core**: React 18, TypeScript, Vite
- **UI Lib**: Shadcn/ui (TailwindCSS + Radix UI)
- **State**: Zustand (Gerenciamento de estado global)
- **Icons**: Lucide React
- **HTTP**: Axios (com interceptors para Auth)

**Backend (`apps/api`)**
- **Core**: Laravel 10 (PHP 8.2+)
- **Auth**: Laravel Sanctum (Token-based)
- **Database**: MySQL / MariaDB
- **Queue**: Database Driver (Jobs assíncronos)
- **Integration**: Z-API (WhatsApp Service)

---

## ⚡ Setup e Instalação

### Pré-requisitos
- PHP 8.2+ e Composer
- Node.js 18+ e NPM
- Banco de dados MySQL/MariaDB

### 1. Backend Setup
```bash
cd apps/api
composer install
cp .env.example .env
# Configure o banco de dados e Z-API no .env
php artisan key:generate
php artisan migrate
php artisan db:seed # (Opcional)
php artisan serve
```

### 2. Frontend Setup
```bash
cd apps/web
npm install
npm run dev
```

O frontend rodará em `http://localhost:5173` e proxyará requisições `/api` para `http://localhost:8000`.

### 3. Build de Produção
Para hospedar tudo junto (Laravel servindo o React):
```bash
# Na raiz do web
npm run build
# Os arquivos gerados vão para apps/api/public/app
```

---

## 🚀 Principais Funcionalidades e Fluxos

### 1. Gestão de Orçamentos (Quotes)
Fluxo completo de criação e envio:
1. **Criação**: Usuário define título, mensagem e seleciona uma Categoria.
2. **Filtro Inteligente**: O sistema filtra Cidades que possuem fornecedores naquela Categoria (`SupplierController@citiesByCategory`).
3. **Seleção**: Usuário seleciona os fornecedores.
4. **Envio**: O orçamento é criado com status `open` e fornecedores entram como `waiting`.

### 2. Fila de WhatsApp (Queue System)
Sistema robusto para envio de mensagens em massa sem bloquear o servidor.

**Fluxo de Envio:**
1. Usuário clica em "Enviar" no Frontend.
2. Backend cria registros em `whatsapp_messages` com status `queued`.
3. Tabela Pivot `quote_supplier` é atualizada para `message_status: queued`.

**Processamento da Fila:**
A fila pode ser processada de três formas:
- **Worker (Ideal)**: `php artisan queue:work`
- **Cron (Hospedagem Compartilhada)**: `GET /api/v1/queue/cron?token=SEU_TOKEN`
- **Manual Trigger**: Botão "Processar Fila" no painel WhatsApp (chama `/api/v1/queue/work`).

### 3. Integração Z-API
- Gerenciamento de Instâncias (Conectar/Desconectar).
- Leitura de QR Code em tempo real.
- Webhooks para receber respostas (configurado em `routes/api.php`).

---

## 🗄 Banco de Dados (Schema Simplificado)

### `quotes`
- `id`, `title`, `message`, `user_id`, `status` (open/closed), `winner_supplier_id`

### `suppliers`
- `id`, `name`, `whatsapp`, `category_id`, `city_id`, `is_active`

### `quote_supplier` (Pivot)
Relaciona orçamentos e fornecedores com rastreamento detalhado:
- `status`: waiting / responded / winner
- `message_status`: pending / queued / sent / failed
- `value`, `notes`: Proposta do fornecedor
- `zapi_message_id`: Rastreamento externo

### `whatsapp_messages`
Fila interna para controlar envios e evitar rate-limit:
- `status`: queued / sent / failed
- `phone`, `message`, `sent_at`, `error_message`

---

## 📡 Endpoints API Principais

### Quotes
- `GET /quotes` - Lista orçamentos
- `POST /quotes` - Cria novo
- `POST /quotes/{id}/broadcast` - Envia para fila do WhatsApp
- `POST /quotes/{id}/close` - Fecha e define vencedor

### Queue / WhatsApp
- `GET /queue/status` - Status da fila (pendentes, erros)
- `POST /queue/work` - Processa fila manualmente (síncrono)
- `GET /queue/cron` - Endpoint público para Cron Jobs
- `GET /whatsapp-instances` - Gerencia instâncias

---

## 💡 Sugestões de Melhorias e Próximos Passos

### Imediatos (Alta Prioridade)
- [x] **Correção Bug `sent_at`**: Coluna adicionada para rastreamento preciso de envio.
- [x] **Polling da Fila**: Frontend agora verifica a cada 20s.
- [ ] **Validação de Telefone**: Garantir formato E.164 (5511999999999) rigoroso no cadastro de fornecedor.

### Médio Prazo
- **Rate Limiting no Backend**: Implementar `Throttle` nos endpoints de envio para evitar bloqueios do WhatsApp.
- **Tipagem Automática**: Usar `spatie/laravel-typescript-transformer` para gerar tipos TS a partir dos Models PHP.
- **Tratamento de Erros Z-API**: Melhorar o parse de erros específicos (ex: número inválido vs instância desconectada).

### Longo Prazo
- **Webhooks Reais**: Implementar processamento real-time de respostas dos fornecedores (Bot que lê "Minha proposta é 100" e salva no banco).
- **Dashboard Analytics**: Gráficos de conversão (Orçamentos Enviados vs Respondidos).

---

## 🔧 Manutenção e Deploy

### Configuração do Cron (Hospedagem sem SSH)
Adicione esta tarefa para rodar a cada 2 minutos:
```bash
curl -s "https://SEU_DOMINIO/api/v1/queue/cron?token=TOKEN_DEFINIDO_NO_ENV" > /dev/null
```
*Token configurado em `config/app.php` via `QUEUE_CRON_TOKEN`.*
