FROM node:18-alpine

WORKDIR /app

# Copiar código fuente
COPY nodejs_space ./nodejs_space

# Instalar dependencias
WORKDIR /app/nodejs_space
RUN yarn install --frozen-lockfile

# Construir aplicación
RUN yarn build

# Generar Prisma Client
RUN yarn prisma generate

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]
