# Etapa 1: Build
FROM node:18-alpine AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Instala dependências
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Compila o projeto para produção
RUN npm run build

# Etapa 2: Servir com NGINX
FROM nginx:stable-alpine

# Remove configurações padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos buildados da etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia um arquivo customizado de configuração do NGINX (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta
EXPOSE 80

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]
