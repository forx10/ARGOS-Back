# 🤖 ARGOS Backend

**Sistema Híbrido de Asistente de IA** para Android con control por voz.

## 📊 Resumen Rápido

**51 endpoints activos** | **13 módulos** | **PostgreSQL** | **NestJS + TypeScript**

---

## ✨ Características Principales

### 🔒 Bloqueos INNEGABLES
La funcionalidad estrella: bloqueos que **NO se pueden desactivar** hasta que expire el tiempo.

```bash
# Bloquear apps por 3 horas (innegable)
POST /api/v1/app-blocker/activate
{"apps": ["Instagram", "TikTok"], "hours": 3}

# Intentar desbloquear antes de tiempo
POST /api/v1/app-blocker/deactivate
→ ❌ "No puedes desbloquear aún, faltan 2 horas y 30 minutos"
```

### 🌐 Filtro de Contenido Adulto
31 dominios pornográficos bloqueados de forma innegable.

```bash
POST /api/v1/content-filter/activate?hours=5
→ ✅ "Listo, páginas bloqueadas por 5 horas"
```

### 🎤 Comandos de Voz (Ejemplos)

```
“ARGOS bloquea Instagram por 2 horas”
“ARGOS bloquea páginas pornográficas por 5 horas”
“ARGOS reproduce música”
“ARGOS llévame al Parque Nacional”
“ARGOS busca restaurantes italianos cerca”
“ARGOS qué tiempo hace en Bogotá”
“ARGOS crea una alarma para las 7 AM”
```

---

## 📚 Módulos Disponibles

| Módulo | Funcionalidad | Endpoints |
|--------|---------------|----------|
| 🔒 **Bloqueos Innegables** | Apps y sitios que NO se pueden desbloquear | 6 |
| 🌐 **Contenido Adulto** | Bloqueo de 31 sitios pornográficos | 4 |
| 🔄 **Turnos** | Turnos rotativos con bloqueos automáticos | 4 |
| 🎵 **Música** | Play, pause, next, prev, volumen | 5 |
| ⏰ **Alarmas** | Crear, listar, eliminar | 3 |
| 🧠 **Inteligencia** | AI Search, respuestas, chat | 3 |
| 📍 **Navegación** | GPS, Google Maps, lugares cercanos | 4 |
| 📢 **Notificaciones** | WhatsApp, Telegram a voz | 5 |
| 📁 **Archivos SD** | Indexar, buscar archivos | 5 |
| 📸 **Cámara** | Registro de fotos | 4 |
| 🔗 **Webhooks** | Integración con Tasker | 4 |
| 📊 **Estado** | Monitoreo del sistema | 2 |

**Total: 51 endpoints**

---

## 🚀 Quick Start

### Instalación

```bash
cd nodejs_space
yarn install
yarn prisma migrate dev
yarn build
```

### Desarrollo

```bash
yarn start:dev
```

Servidor: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`

### Producción
```bash
yarn build
yarn start:prod
```

---

## 🔧 Configuración

### Variables de Entorno (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/argos"
ABACUSAI_API_KEY="tu_api_key"
APP_ORIGIN="https://tu-dominio.com/"
NODE_ENV="production"
```

---

## 📝 Documentación

- **Documentación Completa**: Ver `DOCUMENTACION_COMPLETA.md`
- **Swagger API**: `/api-docs` (cuando el servidor está corriendo)
- **Repositorio**: https://github.com/forx10/ARGOS-Back.git

---

## 🎯 Ejemplos de Uso

### 1. Bloqueo INNEGABLE de Apps

```bash
curl -X POST http://localhost:3000/api/v1/app-blocker/activate \
  -H "Content-Type: application/json" \
  -d '{"apps": ["Instagram", "Facebook"], "hours": 2}'

# Respuesta:
{
  "success": true,
  "message": "Listo, 2 apps bloqueadas por 2 horas",
  "unbreakable": true
}
```

### 2. Bloqueo de Páginas Pornográficas

```bash
curl -X POST "http://localhost:3000/api/v1/content-filter/activate?hours=3"

# Respuesta:
{
  "message": "Listo, páginas bloqueadas por 3 horas",
  "blockedDomains": 31,
  "unbreakable": true
}
```

### 3. Control de Música

```bash
# Reproducir
curl -X POST http://localhost:3000/api/v1/music/play

# Siguiente canción
curl -X POST http://localhost:3000/api/v1/music/next

# Volumen a 70%
curl -X POST http://localhost:3000/api/v1/music/volume \
  -H "Content-Type: application/json" \
  -d '{"level": 70}'
```

### 4. Navegación GPS

```bash
curl -X POST http://localhost:3000/api/v1/location/navigate \
  -H "Content-Type: application/json" \
  -d '{"destination": "Parque Nacional Bogotá"}'

# Respuesta:
{
  "googleMapsUrl": "https://www.google.com/maps/dir/?api=1&destination=..."
}
```

### 5. Búsqueda con IA

```bash
curl -X POST http://localhost:3000/api/v1/intelligence/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "¿Qué tiempo hace en Bogotá?", "useWebSearch": true}'
```

### 6. Notificaciones de Voz

```bash
curl -X POST http://localhost:3000/api/v1/notifications/receive \
  -H "Content-Type: application/json" \
  -d '{
    "app": "WhatsApp",
    "title": "Juan Pérez",
    "text": "Hola, cómo estás?",
    "sender": "Juan Pérez"
  }'

# Respuesta:
{
  "voiceMessage": "Tienes un mensaje de Juan Pérez en WhatsApp"
}
```

---

## 📊 Estado del Proyecto

✅ **Fase 1**: Turnos, Bloqueos, Webhooks  
✅ **Fase 2**: Música, Alarmas, Navegación, Notificaciones, Archivos, Cámara  
✅ **Fase 2.5**: Bloqueos INNEGABLES  
✅ **Producción Ready**

---

## 🛡️ Seguridad

### Bloqueos INNEGABLES
⚠️ **IMPORTANTE**: Los bloqueos innegables son una característica de **autocontrol**. Una vez activados:
- **NO** se pueden desactivar antes de tiempo
- **NO** se pueden modificar
- **SOLO** expiran cuando se cumple el tiempo establecido

Perfecto para:
- Evitar distracciones durante estudio/trabajo
- Control parental
- Autocontrol en momentos de debilidad

---

## 🧑‍💻 Arquitectura

```
ARGOS Sistema Híbrido
│
├── Backend (Este proyecto)
│   ├── NestJS + TypeScript
│   ├── PostgreSQL + Prisma ORM
│   └── 51 Endpoints REST
│
├── Frontend de Ejecución
│   ├── Tasker (Android Automation)
│   └── AutoVoice (Voice Recognition)
│
└── Cerebro Lógico
    └── Abacus AI Agent (LLM)
```

---

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.6
- **Runtime**: Node.js 18+
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma 6.7
- **Package Manager**: Yarn 4.x
- **Documentación**: Swagger/OpenAPI
- **Despliegue**: Render.com / Railway.app

---

## 💻 Scripts Disponibles

```bash
# Desarrollo
yarn start:dev          # Servidor con hot-reload

# Producción
yarn build             # Compilar TypeScript
yarn start:prod        # Iniciar en producción

# Base de Datos
yarn prisma migrate dev    # Crear migración
yarn prisma studio         # GUI para DB
yarn prisma generate       # Generar cliente Prisma

# Testing
yarn test              # Unit tests
yarn test:e2e          # End-to-end tests

# Linting
yarn lint              # ESLint
yarn format            # Prettier
```

---

## 🔗 Enlaces Útiles

- **Repositorio**: https://github.com/forx10/ARGOS-Back.git
- **Swagger Docs**: `/api-docs` (cuando el servidor corre)
- **Documentación Completa**: `DOCUMENTACION_COMPLETA.md`

---

## 💬 Comandos de Voz Soportados

### Bloqueos
- "ARGOS bloquea Instagram por 2 horas"
- "ARGOS bloquea páginas pornográficas por 5 horas"
- "ARGOS desbloquea las apps" (solo si expiró)

### Música
- "ARGOS reproduce música"
- "ARGOS pausa la música"
- "ARGOS siguiente canción"
- "ARGOS sube el volumen a 80"

### Navegación
- "ARGOS llévame al Parque Nacional"
- "ARGOS busca restaurantes cerca"
- "ARGOS dónde hay una farmacia"

### Inteligencia
- "ARGOS qué tiempo hace en Bogotá"
- "ARGOS busca información sobre el cambio climático"
- "ARGOS cuál es la capital de Japón"

### Alarmas
- "ARGOS crea una alarma para las 7 AM"
- "ARGOS muestra mis alarmas"

### Archivos
- "ARGOS busca fotos de vacaciones"
- "ARGOS muestra mis videos"

---

## ✨ Autor

**ARGOS Backend v2.0**  
Sistema Híbrido de Asistente de IA  
© 2026 - Construido con ❤️ usando NestJS

---

## 📝 Licencia

Este proyecto es de uso privado.
