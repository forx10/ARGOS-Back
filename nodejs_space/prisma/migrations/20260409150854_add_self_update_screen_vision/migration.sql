-- CreateTable
CREATE TABLE "solicitud_actualizacion" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "tipo_comando" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "razon" TEXT NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "opcion_seleccionada" VARCHAR(255),
    "notas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitud_actualizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captura_pantalla" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(255) NOT NULL,
    "imagen_base64" TEXT NOT NULL,
    "contexto" TEXT,
    "analizada" BOOLEAN NOT NULL DEFAULT false,
    "analisis" TEXT,
    "sugerencias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "capturada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analizada_en" TIMESTAMP(3),

    CONSTRAINT "captura_pantalla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitud_actualizacion_usuario_id_idx" ON "solicitud_actualizacion"("usuario_id");

-- CreateIndex
CREATE INDEX "solicitud_actualizacion_estado_idx" ON "solicitud_actualizacion"("estado");

-- CreateIndex
CREATE INDEX "solicitud_actualizacion_creado_en_idx" ON "solicitud_actualizacion"("creado_en");

-- CreateIndex
CREATE INDEX "captura_pantalla_usuario_id_idx" ON "captura_pantalla"("usuario_id");

-- CreateIndex
CREATE INDEX "captura_pantalla_analizada_idx" ON "captura_pantalla"("analizada");

-- CreateIndex
CREATE INDEX "captura_pantalla_capturada_en_idx" ON "captura_pantalla"("capturada_en");
