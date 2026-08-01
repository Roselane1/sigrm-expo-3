# SIGRM Desktop (Windows) — via Electron

O jeito mais simples de ter uma versão Desktop para Windows é empacotar o
próprio build web do Expo (React Native Web) dentro de um shell Electron.
O mesmo código do app roda sem alterações — não é necessário reescrever nada.

## Passo a passo

1. Gere o build web na raiz do projeto:
   ```
   cd ..
   npx expo export --platform web
   ```
   Isso cria a pasta `dist/` (ou `web-build/`, dependendo da versão do Expo)
   na raiz do projeto.

2. Copie o conteúdo gerado para dentro de `desktop/web`:
   ```
   cd desktop
   mkdir web
   cp -r ../dist/* web/        # ou ../web-build/*, conforme o passo 1
   ```

3. Instale as dependências do wrapper Electron:
   ```
   npm install
   ```

4. Teste localmente:
   ```
   npm start
   ```

5. Gere o instalador `.exe` para Windows:
   ```
   npm run dist
   ```
   O instalador fica em `desktop/dist/` (pasta gerada pelo electron-builder,
   diferente da pasta `web/` do passo 2).

## Observações

- Troque `desktop/icon.ico` por um ícone de verdade antes de gerar o instalador
  (o electron-builder exige um `.ico` válido para Windows).
- Como o app roda 100% em JavaScript/React Native Web, qualquer funcionalidade
  nova adicionada ao projeto principal (`src/`) aparece automaticamente na
  versão desktop na próxima vez que você repetir os passos 1 e 2.
- Build no Windows precisa ser feito em uma máquina Windows (ou via CI com
  runner Windows) — o electron-builder não cria `.exe` a partir de Linux/Mac
  sem configuração adicional (wine, etc.).
