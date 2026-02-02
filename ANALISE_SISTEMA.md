# Análise do Sistema de Gestão de Orçamentos (Budget Buddy)

## 1. Visão Geral do Estado Atual

O sistema encontra-se atualmente em estágio de **Protótipo Frontend**. A interface visual e os fluxos de usuário foram desenhados e implementados utilizando React, mas não há lógica de backend real nem persistência de dados.

*   **Frontend**: Implementado com React, Vite, Shadcn UI e Tailwind CSS. Possui telas para criação de orçamentos, listagem de fornecedores e gestão de instâncias WhatsApp. Utiliza dados fictícios (`mockData`) e simulações (ex: conexão WhatsApp via `setTimeout`).
*   **Backend**: Projeto Laravel recém-iniciado (estrutura básica). Não existem controllers, rotas API, ou regras de negócio implementadas.
*   **Banco de Dados**: Inexistente (apenas tabelas padrão do Laravel).

---

## 2. Análise de Features (Existentes vs. Necessárias)

| Feature | Estado Atual (Frontend) | Estado Atual (Backend) | O que falta para 100% |
| :--- | :--- | :--- | :--- |
| **Gestão de Fornecedores** | UI Pronta (Mock) | Inexistente | CRUD API, Tabela no DB, filtros reais. |
| **Criação de Orçamentos** | UI Pronta (Mock) | Inexistente | Salvar orçamento no DB, relacionar com fornecedores. |
| **Disparo WhatsApp** | Simulado (Cosmético) | Inexistente | Integração real (ex: Evolution API ou Baileys), Fila de envios. |
| **Gestão de Instâncias** | UI Pronta (Mock QRCode) | Inexistente | Endpoint para gerar QR Code real, Webhook para status. |
| **Dashboard** | UI Estática | Inexistente | Métricas reais (banco de dados). |
| **Autenticação** | Não integrada | Scaffolding básico | Login/Registro via API (Sanctum/JWT). |

---

## 3. Estrutura de Banco de Dados Proposta

Para suportar as funcionalidades desenhadas no frontend, o banco de dados deve seguir a seguinte estrutura relacional:

### Tabelas Principais

**1. users** (Padrão Laravel)
*   `id`, `name`, `email`, `password`, etc.

**2. suppliers** (Fornecedores)
*   `id` (UUID/BigInt)
*   `name` (String): Nome da empresa.
*   `phone` (String): WhatsApp (indispensável para o envio).
*   `category` (String/Enum): Ex: "Material de Construção", "Elétrica".
*   `city` (String): Cidade de atuação.
*   `state` (String): Estado.
*   `is_active` (Boolean).

**3. whatsapp_instances** (Instâncias de Conexão)
*   `id` (UUID)
*   `name` (String): Nome amigável (ex: "Comercial 1").
*   `api_key` (String): Se usar serviço externo.
*   `status` (Enum): 'CONNECTED', 'DISCONNECTED', 'QRCODE'.
*   `qr_code_base64` (Text): Para exibir no frontend.

**4. quotes** (Orçamentos)
*   `id` (UUID)
*   `title` (String): Título do pedido (ex: "Cimento e Areia").
*   `message` (Text): Mensagem base enviada.
*   `status` (Enum): 'DRAFT', 'SENDING', 'COMPLETED'.
*   `user_id` (FK): Quem criou.
*   `created_at`, `updated_at`.

**5. quote_supplier** (Tabela Pivô - Envio Individual)
*   `id`
*   `quote_id` (FK)
*   `supplier_id` (FK)
*   `status` (Enum): 'PENDING', 'SENT', 'FAILED', 'REPLIED'.
*   `sent_at` (Timestamp).
*   `response_text` (Text): Opicional, se capturar resposta.

---

## 4. O que falta para deixar 100% Funcional

Para transformar o protótipo em um produto funcional, é necessário seguir este roadmap:

### Fase 1: Backend Core (Laravel)
1.  **Modelagem de Dados**: Criar as migrations para as tabelas listadas acima.
2.  **API REST**: Desenvolver Controllers para:
    *   `/suppliers`: CRUD.
    *   `/quotes`: Criar e listar orçamentos.
    *   `/whatsapp`: Gerenciar instâncias.
3.  **Remover Mocks do Frontend**: Substituir chamadas ao `mockData` por chamadas reais via `axios` ou `fetch` para a API Laravel.

### Fase 2: Motor de WhatsApp
Esta é a parte crítica. O frontend "simula" um QR Code, mas o backend precisa gerar um real.
*   **Opção Recomendada (Self-hosted)**: Integrar com **Evolution API** ou **Baileys** via Node.js (ou container Docker auxiliar) que o Laravel consome.
*   **Fluxo**:
    1.  Laravel solicita "Nova Instância" à API de WhatsApp.
    2.  API de WhatsApp retorna QR Code (Base64).
    3.  Laravel envia QR Code ao Frontend via WebSocket ou Polling.
    4.  Frontend exibe QR Code.
    5.  Usuário escaneia.
    6.  Webhook da API avisa Laravel que conectou -> Frontend atualiza para "Conectado".

### Fase 3: Disparo de Orçamentos
1.  Ao clicar em "Disparar Orçamento" no frontend:
    *   Frontend envia JSON para Laravel: `{ title, message, supplier_ids }`.
    *   Laravel cria registro em `quotes` e `quote_supplier`.
    *   Laravel despacha **Job em Fila** (Queue) para o envio, para não travar a requisição.
2.  **Worker de Fila**:
    *   Pega cada fornecedor e envia a mensagem via API do WhatsApp.
    *   Atualiza status em `quote_supplier` para 'SENT'.

### Fase 4: Frontend Polish
1.  Implementar telas de Login/Registro reais.
2.  Tratamento de erros (ex: falha ao enviar, número inválido).
3.  Feedback visual de progresso de envio (Barra de progresso de disparos).

---

## 5. Próximos Passos Imediatos (Sugestão)

1.  **Configurar Banco de Dados**: Rodar migrations iniciais.
2.  **Implementar CRUD Fornecedores**: É a feature mais simples para conectar Front e Back e validar a arquitetura.
3.  **Escolher Solução WhatsApp**: Definir se usará API paga ou Open Source (Baileys/Evolution) para iniciar a implementação do motor de envio.
