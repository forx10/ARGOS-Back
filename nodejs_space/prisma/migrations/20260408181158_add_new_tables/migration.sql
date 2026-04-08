-- CreateTable
CREATE TABLE "turno" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "tipo_turno" VARCHAR(50) NOT NULL,
    "fecha" DATE NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueo_activo" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "apps_bloqueadas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sitios_bloqueados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tiempo_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tiempo_fin" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "razon" VARCHAR(255) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloqueo_activo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitio_bloqueado" (
    "id" SERIAL NOT NULL,
    "patron_url" VARCHAR(500) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitio_bloqueado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alarmas" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "mensaje" TEXT,
    "metadata" JSONB,
    "ejecutada" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alarmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comandos_voz" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "texto" TEXT NOT NULL,
    "audio_base64" TEXT,
    "parsed_data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comandos_voz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "titulo" VARCHAR(500) NOT NULL,
    "texto" TEXT NOT NULL,
    "remitente" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anunciada" BOOLEAN NOT NULL DEFAULT false,
    "voz_habilitada" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "clave" VARCHAR(255) NOT NULL,
    "valor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivo_sd" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(500) NOT NULL,
    "ruta_completa" TEXT NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "tamano_bytes" BIGINT,
    "extension" VARCHAR(50) NOT NULL,
    "fecha_creacion" TIMESTAMP(3),
    "fecha_modificacion" TIMESTAMP(3),
    "indexado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivo_sd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto_camara" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "ruta_cloud" TEXT,
    "descripcion" TEXT,
    "camara" VARCHAR(50) NOT NULL,
    "resolucion" VARCHAR(50),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foto_camara_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "turno_usuario_id_idx" ON "turno"("usuario_id");

-- CreateIndex
CREATE INDEX "turno_fecha_idx" ON "turno"("fecha");

-- CreateIndex
CREATE INDEX "bloqueo_activo_usuario_id_idx" ON "bloqueo_activo"("usuario_id");

-- CreateIndex
CREATE INDEX "bloqueo_activo_estado_idx" ON "bloqueo_activo"("estado");

-- CreateIndex
CREATE INDEX "bloqueo_activo_tiempo_fin_idx" ON "bloqueo_activo"("tiempo_fin");

-- CreateIndex
CREATE INDEX "sitio_bloqueado_categoria_idx" ON "sitio_bloqueado"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "sitio_bloqueado_patron_url_key" ON "sitio_bloqueado"("patron_url");

-- CreateIndex
CREATE INDEX "alarmas_usuario_id_idx" ON "alarmas"("usuario_id");

-- CreateIndex
CREATE INDEX "alarmas_timestamp_idx" ON "alarmas"("timestamp");

-- CreateIndex
CREATE INDEX "alarmas_ejecutada_idx" ON "alarmas"("ejecutada");

-- CreateIndex
CREATE INDEX "comandos_voz_usuario_id_idx" ON "comandos_voz"("usuario_id");

-- CreateIndex
CREATE INDEX "comandos_voz_timestamp_idx" ON "comandos_voz"("timestamp");

-- CreateIndex
CREATE INDEX "notificacion_usuario_id_idx" ON "notificacion"("usuario_id");

-- CreateIndex
CREATE INDEX "notificacion_app_idx" ON "notificacion"("app");

-- CreateIndex
CREATE INDEX "notificacion_anunciada_idx" ON "notificacion"("anunciada");

-- CreateIndex
CREATE INDEX "notificacion_timestamp_idx" ON "notificacion"("timestamp");

-- CreateIndex
CREATE INDEX "configuracion_usuario_id_idx" ON "configuracion"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_usuario_id_clave_key" ON "configuracion"("usuario_id", "clave");

-- CreateIndex
CREATE INDEX "archivo_sd_usuario_id_idx" ON "archivo_sd"("usuario_id");

-- CreateIndex
CREATE INDEX "archivo_sd_tipo_idx" ON "archivo_sd"("tipo");

-- CreateIndex
CREATE INDEX "archivo_sd_extension_idx" ON "archivo_sd"("extension");

-- CreateIndex
CREATE INDEX "foto_camara_usuario_id_idx" ON "foto_camara"("usuario_id");

-- CreateIndex
CREATE INDEX "foto_camara_timestamp_idx" ON "foto_camara"("timestamp");
