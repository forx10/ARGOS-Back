# ARGOS - Sistema de Asistencia Personal Inteligente

**ARGOS** es un ecosistema híbrido de productividad que combina un backend inteligente (NestJS) con automatización en Android (Tasker) para control de bloqueos, turnos rotativos, notificaciones de voz y gestión de contenido.

## 🏗️ Arquitectura

```
ARGOS/
├── backend (NestJS + TypeScript)
│   ├── API REST para gestión de turnos, bloqueos, webhooks
│   └── Integración con Tasker vía AutoRemote
├── tasker (Android Automation)
│   ├── Profiles: Recepción de órdenes
│   ├── Tasks: Ejecución de bloqueos, TTS, acceso a archivos
│   └── Variables: Estado sincronizado
└── docs (Guías de instalación y configuración)
```

## 📋 Requisitos Previos

- **Node.js** 18+
- **PostgreSQL** 14+
- **Android** con Tasker + AutoRemote instalados
- **Cuenta en Render.com o Railway.app** (despliegue en nube)

## 🚀 Instalación Local

### 1. Clonar y Configurar

```bash
git clone <tu-repo-github>
cd argos_backend/nodejs_space
yarn install
```

### 2. Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Completar con tus valores
# DATABASE_URL=postgresql://user:pass@localhost:5432/argos
# TASKER_WEBHOOK_URL=https://tu-autoremote-endpoint
# APP_ORIGIN=http://localhost:3000
```

### 3. Base de Datos

```bash
# Crear BD y correr migraciones
yarn prisma db push
```

### 4. Ejecutar Localmente

```bash
# Modo desarrollo
yarn start:dev

# Acceder a API docs
http://localhost:3000/api-docs
```

## 📡 Despliegue en Render.com

### 1. Crear Servicio Web

1. Ir a [Render.com](https://render.com)
2. Crear nuevo **Web Service**
3. Conectar con tu repositorio GitHub
4. Build Command: `cd nodejs_space && yarn install`
5. Start Command: `cd nodejs_space && yarn start:prod`

### 2. Variables de Entorno en Render

En el dashboard de Render, agregar:

```
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<dbname>
TASKER_WEBHOOK_URL=https://tu-autoremote-endpoint
NODE_ENV=production
APP_ORIGIN=https://tu-servicio.onrender.com/
```

### 3. PostgreSQL en Render

1. Crear **PostgreSQL database** en Render
2. Copiar DATABASE_URL a tu Web Service
3. Conectar automáticamente

## 🔌 Integración con Tasker

### AutoRemote Webhook URL

1. En Tasker, ir a: **Tasker > Preferences > AutoRemote**
2. Anotar tu **Device ID**
3. La URL será: `https://autoremote.rm.net/sendmessage?secretOrPassword=YOUR_SECRET&to=YOUR_DEVICE_ID&message=%s`
4. Pegar en variable de entorno `TASKER_WEBHOOK_URL`

### Primer Test

```bash
# Terminal - Enviar evento a Tasker
curl -X POST http://localhost:3000/api/webhook/tasker \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": "user123", "evento": "bloquear", "apps": ["com.instagram.android"]}'

# Tasker debe recibir y procesar la orden
```

## 📝 API Endpoints (Fase 1)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/turnos` | POST | Crear turno rotativo |
| `/api/turnos/:usuarioId` | GET | Obtener turnos próximos |
| `/api/turnos/:usuarioId/analizar` | GET | Analizar turnos + generar alarmas |
| `/api/bloqueo` | POST | Crear bloqueo de apps/sitios |
| `/api/bloqueo/:bloqueoId` | DELETE | Desbloquear |
| `/api/bloqueo/:usuarioId/activos` | GET | Bloqueos activos |
| `/api/webhook/tasker` | POST | Webhook listener (Tasker → Backend) |
| `/api/estado/:usuarioId` | GET | Estado completo del usuario |

## 🎯 Próximas Fases

- **Fase 2**: Web app React + Control de música + WhatsApp por voz
- **Fase 3**: Diagnostics de hardware + Limpieza automática
- **Fase 4**: Modo Invitado + Sincronización multi-dispositivo

## 📚 Documentación

- [ARQUITECTURA.md](./docs/ARQUITECTURA.md) - Diseño técnico
- [TASKER_SETUP.md](./docs/TASKER_SETUP.md) - Guía paso a paso Tasker
- [API_SPEC.md](./docs/API_SPEC.md) - Especificación de endpoints

## 🛠️ Troubleshooting

**Problema**: Tasker no recibe órdenes del backend
- Verificar `TASKER_WEBHOOK_URL` en variables de entorno
- Comprobar que AutoRemote esté activo en Tasker
- Revisar logs en `/logs`

**Problema**: PostgreSQL no conecta
- Verificar `DATABASE_URL` está correcta
- Asegurar que BD está creada en Render

## 📞 Soporte

Para issues técnicos, revisar logs en Render dashboard o ejecutar localmente con `yarn start:dev`.

---

**Última actualización**: Abril 2026
