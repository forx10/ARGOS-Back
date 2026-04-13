FROM node:18-alpine

# Habilitar Corepack para usar Yarn 4.x
RUN corepack enable

WORKDIR /app

# Copiar todo el proyecto nodejs_space
COPY nodejs_space ./

# Eliminar symlink roto de yarn.lock y crear archivo vacío si no existe
RUN rm -f yarn.lock; test -f yarn.lock || touch yarn.lock

# Configurar Yarn para Docker (sin global cache)
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

# Instalar dependencias
RUN yarn install

# Corregir output path de Prisma para Docker (puede venir con path absoluto)
RUN sed -i 's|output.*=.*"/home/ubuntu.*"|output = "../node_modules/.prisma/client"|' prisma/schema.prisma

# Generar Prisma Client con DATABASE_URL temporal (solo para build, no se persiste)
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" yarn prisma generate

# Construir aplicación
RUN yarn build

# Exponer puerto
EXPOSE 3000

# Comando de inicio - migrar BD y arrancar (DATABASE_URL viene de Render env vars)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]