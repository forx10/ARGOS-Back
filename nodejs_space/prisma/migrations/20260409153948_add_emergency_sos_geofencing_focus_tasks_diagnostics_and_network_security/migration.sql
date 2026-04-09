-- CreateTable
CREATE TABLE "contacto_emergencia" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacto_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidente_sos" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "tipo_emergencia" VARCHAR(100) NOT NULL,
    "contactos_contactados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "llamadas_realizadas" INTEGER NOT NULL DEFAULT 0,
    "mensajes_enviados" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(50) NOT NULL,
    "grabacion_audio" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resuelto_en" TIMESTAMP(3),

    CONSTRAINT "incidente_sos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofence" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "radio" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "recordatorios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tipo_bloqueo" VARCHAR(100),
    "duracion_bloqueo" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geofence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesion_focus" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_fin" TIMESTAMP(3) NOT NULL,
    "apps_bloqueadas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sitios_bloqueados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "motivo" VARCHAR(255),
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "estadisticas" JSONB,

    CONSTRAINT "sesion_focus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarea" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "titulo" VARCHAR(500) NOT NULL,
    "descripcion" TEXT,
    "prioridad" VARCHAR(50) NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "ubicacion" VARCHAR(255),
    "fecha_vencimiento" TIMESTAMP(3),
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completada_en" TIMESTAMP(3),

    CONSTRAINT "tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostico_dispositivo" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ram_total_mb" INTEGER,
    "ram_disponible_mb" INTEGER,
    "cpu_porcentaje" DOUBLE PRECISION,
    "temperatura" DOUBLE PRECISION,
    "bateria_porcent" DOUBLE PRECISION,
    "almacenamiento_libre_mb" BIGINT,
    "problemas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recomendaciones" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "diagnostico_dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitor_red" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre_wifi" VARCHAR(255),
    "seguridad_wifi" VARCHAR(100),
    "es_seguro" BOOLEAN NOT NULL DEFAULT false,
    "sitio_visitado" VARCHAR(500),
    "es_phishing" BOOLEAN NOT NULL DEFAULT false,
    "recomendacion" TEXT,

    CONSTRAINT "monitor_red_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacto_emergencia_usuario_id_idx" ON "contacto_emergencia"("usuario_id");

-- CreateIndex
CREATE INDEX "contacto_emergencia_tipo_idx" ON "contacto_emergencia"("tipo");

-- CreateIndex
CREATE INDEX "incidente_sos_usuario_id_idx" ON "incidente_sos"("usuario_id");

-- CreateIndex
CREATE INDEX "incidente_sos_estado_idx" ON "incidente_sos"("estado");

-- CreateIndex
CREATE INDEX "incidente_sos_creado_en_idx" ON "incidente_sos"("creado_en");

-- CreateIndex
CREATE INDEX "geofence_usuario_id_idx" ON "geofence"("usuario_id");

-- CreateIndex
CREATE INDEX "geofence_nombre_idx" ON "geofence"("nombre");

-- CreateIndex
CREATE INDEX "sesion_focus_usuario_id_idx" ON "sesion_focus"("usuario_id");

-- CreateIndex
CREATE INDEX "sesion_focus_hora_inicio_idx" ON "sesion_focus"("hora_inicio");

-- CreateIndex
CREATE INDEX "sesion_focus_completado_idx" ON "sesion_focus"("completado");

-- CreateIndex
CREATE INDEX "tarea_usuario_id_idx" ON "tarea"("usuario_id");

-- CreateIndex
CREATE INDEX "tarea_completada_idx" ON "tarea"("completada");

-- CreateIndex
CREATE INDEX "tarea_prioridad_idx" ON "tarea"("prioridad");

-- CreateIndex
CREATE INDEX "diagnostico_dispositivo_usuario_id_idx" ON "diagnostico_dispositivo"("usuario_id");

-- CreateIndex
CREATE INDEX "diagnostico_dispositivo_timestamp_idx" ON "diagnostico_dispositivo"("timestamp");

-- CreateIndex
CREATE INDEX "monitor_red_usuario_id_idx" ON "monitor_red"("usuario_id");

-- CreateIndex
CREATE INDEX "monitor_red_timestamp_idx" ON "monitor_red"("timestamp");
