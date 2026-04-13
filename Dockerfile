FROM node:18-alpine

# Habilitar Corepack para usar Yarn 4.x
RUN corepack enable

WORKDIR /app

# Copiar archivos del proyecto
COPY nodejs_space/package.json nodejs_space/yarn.lock nodejs_space/.yarnrc.yml ./
COPY nodejs_space/.yarn ./.yarn
COPY nodejs_space/prisma ./prisma
COPY nodejs_space/src ./src
COPY nodejs_space/nest-cli.json nodejs_space/tsconfig.json nodejs_space/tsconfig.build.json ./

# Instalar dependencias
RUN yarn install --immutable

# Generar Prisma Client (ANTES de build)
RUN yarn prisma generate

# Ejecutar migraciones
RUN yarn prisma migrate deploy || echo "Migrations will run at startup"

# Construir aplicación
RUN yarn build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]