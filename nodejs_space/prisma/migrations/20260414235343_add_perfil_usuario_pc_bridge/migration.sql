-- CreateTable
CREATE TABLE "perfil_usuario" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "nombre_usuario" VARCHAR(255) NOT NULL,
    "nombre_asistente" VARCHAR(255) NOT NULL DEFAULT 'ARGOS',
    "wake_word" VARCHAR(255) NOT NULL DEFAULT 'ARGOS',
    "genero_voz" VARCHAR(10) NOT NULL DEFAULT 'mujer',
    "idioma" VARCHAR(10) NOT NULL DEFAULT 'es',
    "saludo_personalizado" TEXT,
    "personalidad" VARCHAR(50) NOT NULL DEFAULT 'profesional',
    "configurado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_conexion" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "nombre_pc" VARCHAR(255) NOT NULL,
    "pc_id" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'desconectado',
    "ultimo_ping" TIMESTAMP(3),
    "ip_local" VARCHAR(50),
    "sistema_operativo" VARCHAR(100),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pc_conexion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitio_habitual" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "categoria" VARCHAR(100) NOT NULL DEFAULT 'general',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "abrir_al_inicio" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitio_habitual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comando_pc" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "pc_id" VARCHAR(255) NOT NULL,
    "tipo_comando" VARCHAR(100) NOT NULL,
    "parametros" JSONB NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    "resultado" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ejecutado_en" TIMESTAMP(3),

    CONSTRAINT "comando_pc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfil_usuario_usuario_id_key" ON "perfil_usuario"("usuario_id");

-- CreateIndex
CREATE INDEX "perfil_usuario_usuario_id_idx" ON "perfil_usuario"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "pc_conexion_pc_id_key" ON "pc_conexion"("pc_id");

-- CreateIndex
CREATE INDEX "pc_conexion_usuario_id_idx" ON "pc_conexion"("usuario_id");

-- CreateIndex
CREATE INDEX "pc_conexion_pc_id_idx" ON "pc_conexion"("pc_id");

-- CreateIndex
CREATE INDEX "sitio_habitual_usuario_id_idx" ON "sitio_habitual"("usuario_id");

-- CreateIndex
CREATE INDEX "sitio_habitual_categoria_idx" ON "sitio_habitual"("categoria");

-- CreateIndex
CREATE INDEX "comando_pc_usuario_id_idx" ON "comando_pc"("usuario_id");

-- CreateIndex
CREATE INDEX "comando_pc_pc_id_idx" ON "comando_pc"("pc_id");

-- CreateIndex
CREATE INDEX "comando_pc_estado_idx" ON "comando_pc"("estado");
