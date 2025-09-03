# Usar Node.js 20 LTS para melhor compatibilidade
FROM node:20-alpine AS builder

# Instalar dependências do sistema necessárias
RUN apk add --no-cache python3 make g++ git

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências
RUN npm ci --include=dev

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine

# Instalar dependências do sistema para produção
RUN apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Diretório de trabalho
WORKDIR /app

# Copiar package.json para instalar dependências necessárias
COPY package*.json ./

# Instalar dependências necessárias incluindo algumas dev dependencies para produção
RUN npm ci --include=dev && npm cache clean --force

# Criar diretórios necessários com permissões corretas
RUN mkdir -p client node_modules/.vite && chown -R nodejs:nodejs node_modules

# Copiar arquivos construídos do estágio anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --from=builder --chown=nodejs:nodejs /app/vite.config.ts ./vite.config.ts
COPY --from=builder --chown=nodejs:nodejs /app/theme.json ./theme.json
COPY --from=builder --chown=nodejs:nodejs /app/client/theme.json ./client/theme.json

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000

# Garantir permissões corretas para diretórios que o Vite precisa escrever
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Usar dumb-init para lidar com sinais corretamente
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]