-- AlterTable
ALTER TABLE "perfil_usuario" ADD COLUMN     "voz_id" VARCHAR(50) NOT NULL DEFAULT 'jarvis',
ALTER COLUMN "genero_voz" SET DEFAULT 'hombre';
