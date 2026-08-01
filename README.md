# SIGRM — Expo + React Native Web

Port completo do sistema SIGRM (Sistema Integrado de Gestão de Requisições de
Materiais) para **Expo + React Native**, usando **React Native Web** para que
o mesmo código-fonte rode como **PWA instalável direto do navegador**
(computador, Android e iPhone, sem baixar nada de loja de app), gere um
**APK Android** nativo, e, no futuro, uma versão **Desktop para Windows**
(via Electron — veja `desktop/README.md`).

## O que foi portado

Todas as funcionalidades do protótipo web original:

- Login por usuário/senha (Administrador cadastra login, senha e perfil de cada um)
- 4 perfis com permissões diferentes: Técnico de Materiais, Planejamento, Logística, Administrador
- Painel com contagem de requisições por status
- Importação de RM (RF001): seleciona um arquivo `.xlsx` real (parser de verdade,
  via `xlsx`) ou `.pdf` (extração simulada, igual ao protótipo web, já que não
  existe parser de PDF disponível em nenhuma plataforma aqui)
- Categoria de prioridade (Normal/Médio/Urgente) na criação da requisição
- Fluxo completo de status da requisição, atualizado automaticamente a partir
  do status dos itens (Aberta → Em Atendimento → Aguardando Retirada)
- Atualização de itens em lote pela Logística
- Registro de retirada por item (quem retira + quantidade), com suporte a
  múltiplas retiradas em períodos diferentes até completar a quantidade localizada
- Cancelamento de requisição/item pelo Técnico, restrito a antes do início da localização
- Notificações para a Logística (novas requisições e cancelamentos)
- Exportação da requisição em **PDF real**, gerado por um construtor de PDF
  próprio (sem dependências externas) — no navegador baixa o arquivo direto;
  no Android/iOS salva o arquivo e abre a folha de compartilhar/salvar nativa
- Administração de usuários (cadastrar, editar, ativar/desativar, remover)
- Cores do sistema: verde alface, azul escuro e branco
- PWA instalável (manifesto, ícones, service worker com suporte offline básico, tags específicas para iPhone)

## Principais incompatibilidades corrigidas na migração

A versão anterior era uma página web usando APIs de navegador (`<table>`,
`<select>`, `<input type="file">`, `window.print`, `Blob`/`URL.createObjectURL`
puros, CSS `@media`, fontes via `@import` do Google Fonts). Nenhuma dessas
APIs existe da mesma forma em React Native, então foram substituídas por:

| Web original | Versão Expo/RN |
|---|---|
| `<table>` | Cards com `View`/`Text` (RN não tem tabelas nativas) |
| `<select>` | `@react-native-picker/picker` |
| `<input type="file">` | `expo-document-picker` |
| Leitura de arquivo via `FileReader` | `expo-file-system` (nativo) / `fetch().arrayBuffer()` (web) |
| `window.print()` | Removido — trocado direto por exportação em PDF real |
| `Blob` + link de download | Mantido no **web** (roda em navegador de verdade via React Native Web); no **nativo** usa `expo-file-system` + `expo-sharing` |
| CSS `@media (max-width)` | `useWindowDimensions()` + layout condicional |
| Google Fonts via `@import` | `expo-font` + pacotes `@expo-google-fonts/*`, com tela de carregamento até as fontes ficarem prontas |
| Ícones `lucide-react` | `lucide-react-native` (mesmo conjunto de ícones, compatível com RN e RN Web) |
| Menu lateral em `<aside>` com CSS | Sidebar customizada com `View`/`Animated`, abre em drawer nas telas estreitas |

O gerador de PDF (feito na mão, sem biblioteca) é puro JavaScript e não usa
nenhuma API de navegador — por isso funciona **igual** nas três plataformas.

## ⚠️ Importante sobre este entrega

Este código foi escrito e revisado **sem acesso à internet** neste ambiente —
não foi possível rodar `npm install`, o Metro bundler, nem testar o build
real do Android ou o `expo start`. O código foi organizado seguindo os
padrões oficiais do Expo/RN e a sintaxe de cada arquivo foi verificada, mas
**a primeira coisa a fazer é rodar os passos abaixo na sua máquina** para
confirmar que tudo instala e builda como esperado. Se aparecer algum erro de
versão de dependência, rode `npx expo install --fix` para o Expo corrigir
automaticamente as versões compatíveis com o SDK instalado.

## Como rodar

Este app agora depende de um backend (pasta `sigrm-server`, entregue à parte)
para login e dados reais compartilhados entre os usuários. Rode o backend
primeiro:

```bash
cd sigrm-server
npm install
cp .env.example .env
npm start          # sobe em http://localhost:4000
```

Depois, configure o app pra apontar pra esse backend e rode:

```bash
cp .env.example .env
# edite o .env e coloque o IP do seu computador na rede (não "localhost")
# em EXPO_PUBLIC_API_URL — veja o comentário dentro do próprio arquivo

npm install
npx expo install --fix   # garante que as versões batem com o SDK do Expo
npx expo start
```

Isso abre o Metro bundler — aperte `w` para abrir no navegador, ou escaneie o
QR code com o app Expo Go no celular (Android/iOS) para testar sem gerar APK.
Celular e computador precisam estar na mesma rede Wi-Fi para o app conseguir
falar com o backend rodando localmente.

## Gerar o APK Android

Usando o [EAS Build](https://docs.expo.dev/build/introduction/) (gratuito
para uso básico, requer conta Expo):

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

O perfil `preview` (definido em `eas.json`) já está configurado para gerar
um `.apk` direto (em vez de `.aab`), pronto para instalar manualmente no
aparelho.

## Rodar/publicar a versão Web

```bash
npx expo start --web        # desenvolvimento
npx expo export --platform web   # gera build estático de produção
```

## PWA — instalar direto do navegador, sem baixar nada

O projeto já está configurado como um **PWA (Progressive Web App)** de
verdade: tem manifesto de instalação, ícones próprios, service worker (dá
pra abrir mesmo sem internet depois da primeira visita) e as tags que o
iPhone precisa (o Safari não segue o padrão comum de PWA e exige
configuração separada — já está feita em `public/index.html`).

Isso funciona em **computador, Android e iPhone**, sempre pelo navegador —
ninguém precisa instalar Expo Go, app nenhum, nem gerar APK. A pessoa só
abre o link e, se quiser, adiciona à tela inicial.

1. Gere o build web (na pasta do projeto):
   ```
   npx expo export --platform web
   ```
   Isso cria uma pasta `dist/` com o site pronto — incluindo o manifesto,
   os ícones e o service worker (tudo dentro de `public/` é copiado
   automaticamente pra dentro de `dist/`).

2. Publique essa pasta em algum lugar acessível por link. Sem precisar
   programar nada, o mais simples é o **Netlify Drop**:
   - Acesse https://app.netlify.com/drop no navegador do computador
   - Arraste a pasta `dist/` pra dentro da página
   - Em poucos segundos ele te dá um link público (tipo `nome-aleatorio.netlify.app`)

   (Qualquer outra hospedagem de arquivos estáticos serve também — Vercel,
   GitHub Pages, etc. — desde que sirva a pasta `dist/` inteira via HTTPS.)

3. Abra esse link no navegador de qualquer aparelho — computador, Android
   ou iPhone.

4. Para instalar (opcional, mas recomendado):
   - **Android (Chrome):** vai aparecer um aviso de "Instalar app" sozinho,
     ou toque nos três pontinhos (⋮) → "Instalar app" / "Adicionar à tela inicial"
   - **iPhone (Safari):** toque no ícone de compartilhar (□ com uma seta) →
     "Adicionar à Tela de Início"
   - **Computador (Chrome/Edge):** clique no ícone de instalar que aparece
     do lado direito da barra de endereço

Depois de instalado, o SIGRM abre em tela cheia, com ícone próprio, como
um app de verdade — mas continua sendo o mesmo site, só que "fixado".

Como o app agora fala com o backend (`sigrm-server`), todo mundo que acessar
o mesmo link vê os mesmos dados (login, requisições) — diferente da versão
anterior, que ficava tudo isolado por sessão local.

## Versão Desktop (Windows)

Veja `desktop/README.md` — o caminho preparado usa Electron para empacotar o
próprio build web (nenhum código precisa ser reescrito).

## Estrutura do projeto

```
App.js                     # entrada: carrega fontes, provê estado global
src/
  theme/                   # cores e fontes
  data/                    # constantes de domínio + dados de exemplo (seed do PDF)
  api/                     # cliente HTTP + chamadas ao backend (sigrm-server)
  utils/                   # PDF, parser de planilha, lógica de status/retirada
  state/AppState.js        # estado global (sessão, usuários, requisições, notificações)
  components/              # componentes reutilizáveis (Card, Button, Stamp...)
  screens/                 # telas (Login, Painel, Requisições, Administração...)
public/                    # PWA: manifest.json, ícones e service worker (copiados pro build web)
desktop/                   # wrapper Electron para o futuro Desktop Windows
assets/                    # ícone/splash do app nativo (Android) — placeholders, troque antes de publicar
```

## Usuários de teste

Vêm do backend (`sigrm-server`), que já sobe com esses usuários semeados:

| Login | Senha | Perfil |
|---|---|---|
| Administrador | Administrador | Administrador |
| roselane | 1234 | Técnico de Materiais |
| rafael | 1234 | Planejamento |
| diego | 1234 | Logística |

Os dados agora ficam persistidos pelo **backend** (`sigrm-server`), então
são os mesmos para todo mundo que acessar — reiniciar o app não apaga mais
nada. A sessão de login também fica salva no aparelho (via
`@react-native-async-storage/async-storage`), então abrir o app de novo não
pede login toda vez.
