FROM node:18-alpine

# Habilitar Corepack para usar Yarn 4.x
RUN corepack enable

WORKDIR /app

# Copiar todo el proyecto nodejs_space
COPY nodejs_space ./

# Instalar dependencias
RUN yarn install

# Generar Prisma Client (ANTES de build)
RUN yarn prisma generate

# Construir aplicación
RUN yarn build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]