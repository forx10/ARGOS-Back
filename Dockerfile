FROM node:18-alpine

WORKDIR /app

# Copiar archivos raíz
COPY package.json yarn.lock ./
COPY nodejs_space ./nodejs_space

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Construir aplicación
RUN cd nodejs_space && yarn build

# Generar Prisma Client
RUN cd nodejs_space && yarn prisma generate

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "nodejs_space/dist/main"]
