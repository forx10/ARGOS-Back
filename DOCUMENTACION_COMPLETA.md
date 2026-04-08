# 📖 ARGOS Backend - Documentación Completa

## 🎯 Descripción General

ARGOS es un sistema híbrido de asistente de IA que combina:
- **Backend**: API REST en NestJS (este proyecto)
- **Frontend de Ejecución**: Tasker + AutoVoice en Android
- **Cerebro Lógico**: Abacus AI Agent (procesamiento de comandos de voz)

El backend proporciona **todas las funcionalidades de gestión** para que ARGOS pueda:
- Controlar bloqueos de apps y sitios web
- Gestionar turnos de trabajo
- Responder preguntas con búsqueda web
- Controlar música, alarmas, navegación
- Procesar notificaciones con voz
- Gestionar archivos y fotos

---

# 📚 Índice de Módulos

1. [Turnos Rotativos](#1-turnos-rotativos)
2. [Bloqueos de Apps y Sitios](#2-bloqueos-de-apps-y-sitios)
3. [Bloqueos INNEGABLES](#3-bloqueos-innegables)
4. [Filtro de Contenido Adulto](#4-filtro-de-contenido-adulto)
5. [Control de Música](#5-control-de-música)
6. [Alarmas](#6-alarmas)
7. [Inteligencia (AI Search & Chat)](#7-inteligencia-ai-search--chat)
8. [Navegación y Ubicación](#8-navegación-y-ubicación)
9. [Notificaciones de Voz](#9-notificaciones-de-voz)
10. [Archivos de Tarjeta SD](#10-archivos-de-tarjeta-sd)
11. [Control de Cámara](#11-control-de-cámara)
12. [Webhooks para Tasker](#12-webhooks-para-tasker)
13. [Estado del Sistema](#13-estado-del-sistema)

---

# 1. Turnos Rotativos

## 📋 Descripción
Gestiona turnos de trabajo rotativos (6AM-2PM, 2PM-10PM, 10PM-6AM) con bloqueos automáticos de apps durante el turno.

## 🔗 Endpoints

### `POST /api/v1/turnos/crear`
Crea un nuevo turno de trabajo.

**Request:**
```json
{
  "tipo_turno": "6AM-2PM",
  "fecha": "2026-04-10",
  "apps_bloqueadas": ["Instagram", "Facebook", "TikTok"],
  "sitios_bloqueados": ["facebook.com", "instagram.com"]
}
```

**Response:**
```json
{
  "success": true,
  "turno": {
    "id": 1,
    "tipo_turno": "6AM-2PM",
    "hora_inicio": "06:00",
    "hora_fin": "14:00",
    "fecha": "2026-04-10",
    "apps_bloqueadas": ["Instagram", "Facebook", "TikTok"]
  }
}
```

### `GET /api/v1/turnos/activo`
Obtiene el turno activo actual.

**Response:**
```json
{
  "turnoActivo": true,
  "turno": {
    "id": 1,
    "tipo_turno": "6AM-2PM",
    "apps_bloqueadas": ["Instagram", "Facebook"]
  }
}
```

### `GET /api/v1/turnos/listar`
Lista todos los turnos.

**Query Parameters:**
- `limit`: Número de turnos (default: 50)

---

# 2. Bloqueos de Apps y Sitios

## 📋 Descripción
Bloquea apps y sitios web durante períodos específicos.

## 🔗 Endpoints

### `POST /api/v1/bloqueos/crear`
Crea un bloqueo temporal.

**Request:**
```json
{
  "apps_bloqueadas": ["Instagram", "TikTok"],
  "sitios_bloqueados": ["facebook.com"],
  "tiempo_fin": "2026-04-08T20:00:00Z",
  "razon": "estudio"
}
```

**Response:**
```json
{
  "success": true,
  "bloqueo": {
    "id": 1,
    "apps_bloqueadas": ["Instagram", "TikTok"],
    "tiempo_inicio": "2026-04-08T14:00:00Z",
    "tiempo_fin": "2026-04-08T20:00:00Z",
    "estado": "activo"
  }
}
```

### `GET /api/v1/bloqueos/activos`
Obtiene todos los bloqueos activos.

### `POST /api/v1/bloqueos/:id/finalizar`
Finaliza un bloqueo manualmente.

---

# 3. Bloqueos INNEGABLES

## 📋 Descripción
🔒 **Característica especial de autocontrol**: Una vez activados, **NO se pueden desactivar** hasta que expire el tiempo establecido.

Perfecto para:
- Evitar distracciones durante estudio/trabajo
- Autocontrol en momentos de debilidad
- Bloqueos que no puedes cancelar impulsivamente

## 🔗 Endpoints

### `POST /api/v1/app-blocker/activate`
Bloquea apps de forma INNEGABLE.

**Request:**
```json
{
  "apps": ["Instagram", "Facebook", "TikTok"],
  "hours": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listo, 3 apps bloqueadas por 3 horas",
  "blockedApps": ["Instagram", "Facebook", "TikTok"],
  "blockedUntil": "2026-04-08T17:00:00Z",
  "unbreakable": true,
  "warning": "Este bloqueo NO se puede desactivar hasta que expire el tiempo"
}
```

### `POST /api/v1/app-blocker/deactivate`
Intenta desactivar el bloqueo (solo funciona si expiró).

**Si AÚN está bloqueado:**
```json
{
  "success": false,
  "blocked": true,
  "message": "No puedes desbloquear las apps aún, faltan 2 horas y 30 minutos",
  "remainingMinutes": 150,
  "canUnlockAt": "8/4/2026, 5:00:00 p. m."
}
```

**Si ya expiró:**
```json
{
  "success": true,
  "message": "Bloqueo de apps desactivado"
}
```

### `GET /api/v1/app-blocker/status`
Consulta el estado del bloqueo.

**Ejemplo de comando de voz:**
- "ARGOS bloquea Instagram, Facebook y TikTok por 2 horas"
- "ARGOS desbloquea las apps" → ❌ "No puedes aún, faltan 1 hora"

---

# 4. Filtro de Contenido Adulto

## 📋 Descripción
Bloquea sitios pornográficos de forma INNEGABLE. Incluye lista de 31 dominios comunes.

## 🌐 Dominios Bloqueados
```
pornhub.com, xvideos.com, xnxx.com, xhamster.com,
redtube.com, youporn.com, tube8.com, spankbang.com,
thisav.com, beeg.com, eporner.com, txxx.com,
hqporner.com, porn300.com, vjav.com, javhd.com,
pornhd.com, tnaflix.com, motherless.com, drtuber.com,
keezMovies.com, fapality.com, porntrex.com, hclips.com,
nuvid.com, porn.com, sex.com, adulttime.com,
brazzers.com, realitykings.com, naughtyamerica.com
```

## 🔗 Endpoints

### `POST /api/v1/content-filter/activate`
Activa el bloqueo INNEGABLE.

**Query Parameters:**
- `hours`: Horas de bloqueo (1-24, default: 1)

**Request:**
```bash
POST /api/v1/content-filter/activate?hours=2
```

**Response:**
```json
{
  "success": true,
  "message": "Listo, páginas bloqueadas por 2 horas",
  "blockedDomains": 31,
  "blockedUntil": "2026-04-08T16:00:00Z",
  "unbreakable": true,
  "warning": "Este bloqueo NO se puede desactivar hasta que expire el tiempo"
}
```

### `POST /api/v1/content-filter/deactivate`
Intenta desactivar (solo si expiró).

**Si aún bloqueado:**
```json
{
  "success": false,
  "message": "No puedes desbloquear aún, faltan 1 hora y 45 minutos",
  "remainingMinutes": 105
}
```

### `GET /api/v1/content-filter/status`
Estado del bloqueo.

### `GET /api/v1/content-filter/blocked-domains`
Lista de dominios bloqueados.

**Ejemplo de comando de voz:**
- "ARGOS bloquea páginas web" → Bloquea por 1 hora
- "ARGOS bloquea páginas pornográficas por 5 horas"
- "ARGOS desbloquea páginas" → ❌ "No puedes aún, faltan 3 horas"

---

# 5. Control de Música

## 📋 Descripción
Controla la reproducción de música en el dispositivo Android.

## 🔗 Endpoints

### `POST /api/v1/music/play`
Inicia reproducción.

**Response:**
```json
{
  "success": true,
  "action": "play",
  "message": "Música reproduciendo"
}
```

### `POST /api/v1/music/pause`
Pausa reproducción.

### `POST /api/v1/music/next`
Siguiente canción.

### `POST /api/v1/music/previous`
Canción anterior.

### `POST /api/v1/music/volume`
Ajusta volumen.

**Request:**
```json
{
  "level": 70
}
```

**Ejemplos de comandos de voz:**
- "ARGOS reproduce música"
- "ARGOS pausa la música"
- "ARGOS siguiente canción"
- "ARGOS sube el volumen a 80"

---

# 6. Alarmas

## 📋 Descripción
Gestiona alarmas en el dispositivo.

## 🔗 Endpoints

### `POST /api/v1/alarmas/crear`
Crea una alarma.

**Request:**
```json
{
  "hora": "07:30",
  "descripcion": "Despertador",
  "dias_semana": ["lunes", "martes", "miércoles", "jueves", "viernes"],
  "activa": true
}
```

**Response:**
```json
{
  "success": true,
  "alarma": {
    "id": 1,
    "hora": "07:30",
    "descripcion": "Despertador",
    "activa": true
  }
}
```

### `GET /api/v1/alarmas/listar`
Lista todas las alarmas.

### `DELETE /api/v1/alarmas/:id`
Elimina una alarma.

**Ejemplos de comandos de voz:**
- "ARGOS crea una alarma para las 7 de la mañana"
- "ARGOS muestra mis alarmas"
- "ARGOS elimina la alarma de las 7"

---

# 7. Inteligencia (AI Search & Chat)

## 📋 Descripción
Capacidades de IA para responder preguntas, buscar información en la web y chatear.

## 🔗 Endpoints

### `POST /api/v1/intelligence/search`
Busca información en la web.

**Request:**
```json
{
  "query": "últimas noticias de Colombia"
}
```

**Response:**
```json
{
  "query": "últimas noticias de Colombia",
  "results": [
    {
      "title": "Noticias Colombia hoy",
      "snippet": "Últimas noticias de Colombia...",
      "url": "https://..."
    }
  ],
  "summary": "Resumen de las noticias encontradas..."
}
```

### `POST /api/v1/intelligence/answer`
Responde preguntas con búsqueda opcional.

**Request:**
```json
{
  "question": "¿Cuál es la capital de Japón?",
  "useWebSearch": false
}
```

**Response:**
```json
{
  "question": "¿Cuál es la capital de Japón?",
  "answer": "La capital de Japón es Tokio.",
  "usedWebSearch": false
}
```

### `POST /api/v1/intelligence/chat`
Chat conversacional con contexto.

**Request:**
```json
{
  "message": "¿Qué tiempo hace en Bogotá?",
  "useWebSearch": true
}
```

**Ejemplos de comandos de voz:**
- "ARGOS busca información sobre el cambio climático"
- "ARGOS cuál es la capital de Francia"
- "ARGOS qué tiempo hace hoy"

---

# 8. Navegación y Ubicación

## 📋 Descripción
Navegación GPS, búsqueda de lugares y lugares cercanos.

## 🔗 Endpoints

### `POST /api/v1/location/save-current`
Guarda ubicación actual.

**Request:**
```json
{
  "latitude": 4.7110,
  "longitude": -74.0721,
  "nombre": "Mi Casa"
}
```

### `POST /api/v1/location/navigate`
Navega a un destino.

**Request:**
```json
{
  "destination": "Parque Nacional Bogotá"
}
```

**Response:**
```json
{
  "destination": "Parque Nacional Bogotá",
  "googleMapsUrl": "https://www.google.com/maps/dir/?api=1&destination=Parque+Nacional+Bogot%C3%A1",
  "message": "Abre este enlace en Google Maps para navegar"
}
```

### `GET /api/v1/location/search`
Busca lugares.

**Query:**
```
GET /api/v1/location/search?query=restaurantes+italianos
```

### `GET /api/v1/location/nearby`
Lugares cercanos.

**Query:**
```
GET /api/v1/location/nearby?type=restaurant&radius=1000
```

**Tipos disponibles:**
- restaurant, cafe, gas_station, pharmacy, hospital, bank, atm, supermarket, gym, parking

**Ejemplos de comandos de voz:**
- "ARGOS llévame al Parque Nacional"
- "ARGOS busca restaurantes italianos cerca"
- "ARGOS dónde hay una farmacia cerca"
- "ARGOS muéstrame gasolineras cercanas"

---

# 9. Notificaciones de Voz

## 📋 Descripción
Convierte notificaciones de WhatsApp, Telegram y otras apps en mensajes de voz.

## 📱 Apps Soportadas
- WhatsApp / WhatsApp Business
- Telegram
- Signal
- Messenger
- Instagram
- Twitter / X

## 🔗 Endpoints

### `POST /api/v1/notifications/receive`
Recibe notificación desde Tasker.

**Request:**
```json
{
  "app": "WhatsApp",
  "title": "Juan Pérez",
  "text": "Hola, cómo estás?",
  "sender": "Juan Pérez"
}
```

**Response:**
```json
{
  "success": true,
  "voiceAnnouncement": true,
  "voiceMessage": "Tienes un mensaje de Juan Pérez en WhatsApp"
}
```

### `GET /api/v1/notifications/unannounced`
Notificaciones pendientes de anunciar.

**Response:**
```json
{
  "count": 2,
  "notifications": [
    {
      "id": 1,
      "app": "WhatsApp",
      "sender": "Juan Pérez",
      "voiceMessage": "Tienes un mensaje de Juan Pérez en WhatsApp"
    },
    {
      "id": 2,
      "app": "Telegram",
      "sender": "María",
      "voiceMessage": "Mensaje de María en Telegram"
    }
  ]
}
```

### `POST /api/v1/notifications/announce/:id`
Marca notificación como anunciada.

### `POST /api/v1/notifications/configure-voice-apps`
Configura qué apps generan voz.

**Request:**
```json
{
  "apps": ["WhatsApp", "Telegram", "Signal"]
}
```

### `GET /api/v1/notifications/history`
Historial de notificaciones.

**Mensajes de voz generados:**
- WhatsApp: "Tienes un mensaje de [nombre] en WhatsApp"
- Llamada perdida: "Llamada perdida de [nombre] en WhatsApp"
- Telegram: "Mensaje de [nombre] en Telegram"
- Signal: "Mensaje de [nombre] en Signal"

---

# 10. Archivos de Tarjeta SD

## 📋 Descripción
Indexa, busca y gestiona archivos de la tarjeta SD del dispositivo.

## 📂 Tipos de Archivos Soportados
- **Imágenes**: jpg, jpeg, png, gif, bmp, webp, svg
- **Videos**: mp4, avi, mkv, mov, wmv, flv, webm
- **Audio**: mp3, wav, aac, flac, ogg, m4a
- **Documentos**: pdf, doc, docx, txt, xls, xlsx, ppt, pptx

## 🔗 Endpoints

### `POST /api/v1/sd-files/index`
Indexa archivos desde Tasker.

**Request:**
```json
{
  "files": [
    {
      "nombre": "foto_vacaciones.jpg",
      "rutaCompleta": "/sdcard/DCIM/Camera/foto_vacaciones.jpg",
      "tipo": "imagen",
      "tamanoBytes": 2048576,
      "extension": ".jpg",
      "fechaModificacion": "2026-04-01T10:00:00Z"
    },
    {
      "nombre": "video_cumpleaños.mp4",
      "rutaCompleta": "/sdcard/DCIM/Camera/video_cumpleaños.mp4",
      "tipo": "video",
      "tamanoBytes": 15728640
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 archivos indexados",
  "count": 2
}
```

### `GET /api/v1/sd-files/search`
Busca archivos por nombre.

**Query:**
```
GET /api/v1/sd-files/search?query=vacaciones&tipo=imagen
```

**Response:**
```json
{
  "count": 3,
  "files": [
    {
      "id": 1,
      "nombre": "foto_vacaciones.jpg",
      "ruta": "/sdcard/DCIM/Camera/foto_vacaciones.jpg",
      "tipo": "imagen",
      "tamano": 2048576
    }
  ]
}
```

### `GET /api/v1/sd-files/list-by-type`
Lista archivos por tipo.

**Query:**
```
GET /api/v1/sd-files/list-by-type?tipo=video&limit=20
```

### `GET /api/v1/sd-files/statistics`
Estadísticas de archivos.

**Response:**
```json
{
  "total": 156,
  "byType": [
    {"tipo": "imagen", "count": 89},
    {"tipo": "video", "count": 34},
    {"tipo": "audio", "count": 23},
    {"tipo": "documento", "count": 10}
  ]
}
```

### `DELETE /api/v1/sd-files/clear`
Limpia el índice.

**Ejemplos de comandos de voz:**
- "ARGOS busca fotos de vacaciones"
- "ARGOS muestra mis videos"
- "ARGOS cuántos archivos tengo"

---

# 11. Control de Cámara

## 📋 Descripción
Registra fotos tomadas con la cámara del dispositivo.

## 🔗 Endpoints

### `POST /api/v1/camera/register-photo`
Registra una foto tomada.

**Request:**
```json
{
  "rutaArchivo": "/sdcard/DCIM/Camera/IMG_20260408_140530.jpg",
  "camara": "trasera",
  "resolucion": "4000x3000",
  "descripcion": "Foto del paisaje",
  "rutaCloud": "https://i.ytimg.com/vi/sFepDOXOW3E/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAHJ_awvUECrqV06nYV9mAb_jU27Q"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Foto registrada correctamente",
  "photo": {
    "id": 1,
    "ruta": "/sdcard/DCIM/Camera/IMG_20260408_140530.jpg",
    "camara": "trasera",
    "timestamp": "2026-04-08T14:05:30Z"
  }
}
```

### `GET /api/v1/camera/recent-photos`
Fotos recientes.

**Query:**
```
GET /api/v1/camera/recent-photos?limit=10
```

### `GET /api/v1/camera/statistics`
Estadísticas de fotos.

**Response:**
```json
{
  "total": 245,
  "byCamera": [
    {"camara": "trasera", "count": 198},
    {"camara": "frontal", "count": 47}
  ]
}
```

### `DELETE /api/v1/camera/:id`
Elimina registro de foto.

**Ejemplos de comandos de voz:**
- "ARGOS toma una foto"
- "ARGOS muestra mis últimas fotos"
- "ARGOS cuántas fotos he tomado"

---

# 12. Webhooks para Tasker

## 📋 Descripción
Sistema de webhooks para que Tasker pueda enviar y recibir datos.

## 🔗 Endpoints

### `POST /api/v1/webhooks/registrar`
Registra un webhook.

**Request:**
```json
{
  "nombre": "notificacion_whatsapp",
  "url": "https://autoremotejoaomgcd.appspot.com/sendmessage",
  "evento": "notificacion_recibida"
}
```

### `POST /api/v1/webhooks/ejecutar/:nombre`
Ejecuta un webhook.

**Request:**
```json
{
  "data": {
    "message": "Tienes un mensaje de Juan"
  }
}
```

### `GET /api/v1/webhooks/listar`
Lista webhooks registrados.

### `DELETE /api/v1/webhooks/:id`
Elimina webhook.

---

# 13. Estado del Sistema

## 📋 Descripción
Consulta el estado general del sistema ARGOS.

## 🔗 Endpoints

### `GET /api/v1/estado/general`
Estado general del sistema.

**Response:**
```json
{
  "sistema": "ARGOS",
  "estado": "operativo",
  "timestamp": "2026-04-08T14:00:00Z",
  "turnoActivo": true,
  "bloqueosActivos": 2,
  "alarmasActivas": 3
}
```

### `GET /api/v1/estado/bloqueos-activos`
Bloqueos activos ahora mismo.

**Response:**
```json
{
  "count": 2,
  "bloqueos": [
    {
      "tipo": "apps",
      "items": ["Instagram", "Facebook"],
      "expiraEn": "2 horas y 15 minutos"
    },
    {
      "tipo": "sitios",
      "items": ["31 sitios pornográficos"],
      "expiraEn": "45 minutos"
    }
  ]
}
```

---

# 📊 Resumen de Funcionalidades

| Módulo | Endpoints | Funcionalidad Principal |
|--------|-----------|-------------------------|
| Turnos | 4 | Gestión de turnos rotativos |
| Bloqueos | 5 | Bloqueos temporales de apps/sitios |
| Bloqueos Innegables | 3 | Bloqueos que no se pueden cancelar |
| Contenido Adulto | 4 | Bloqueo de 31 sitios pornográficos |
| Música | 5 | Control de reproducción |
| Alarmas | 3 | Gestión de alarmas |
| Inteligencia | 3 | AI Search, respuestas, chat |
| Navegación | 4 | GPS, navegación, lugares cercanos |
| Notificaciones | 5 | Conversión a voz de notificaciones |
| Archivos SD | 5 | Indexación y búsqueda de archivos |
| Cámara | 4 | Registro de fotos |
| Webhooks | 4 | Integración con Tasker |
| Estado | 2 | Monitoreo del sistema |

**Total: 51 endpoints activos**

---

# 🎤 Ejemplos de Comandos de Voz Completos

## Bloqueos
```
"ARGOS bloquea Instagram por 2 horas"
"ARGOS bloquea páginas pornográficas por 5 horas"
"ARGOS bloquea Instagram, Facebook y TikTok por 3 horas"
"ARGOS desbloquea las apps" → "No puedes aún, faltan 1 hora"
```

## Música
```
"ARGOS reproduce música"
"ARGOS pausa la música"
"ARGOS siguiente canción"
"ARGOS sube el volumen a 80"
```

## Navegación
```
"ARGOS llévame al Parque Nacional"
"ARGOS busca restaurantes italianos cerca"
"ARGOS dónde hay una gasolinera cerca"
```

## Inteligencia
```
"ARGOS busca información sobre el cambio climático"
"ARGOS cuál es la capital de Japón"
"ARGOS qué tiempo hace en Bogotá"
```

## Alarmas
```
"ARGOS crea una alarma para las 7 de la mañana"
"ARGOS muestra mis alarmas"
```

## Archivos
```
"ARGOS busca fotos de vacaciones"
"ARGOS muestra mis videos"
"ARGOS cuántos archivos tengo"
```

## Cámara
```
"ARGOS toma una foto"
"ARGOS muestra mis últimas fotos"
```

---

# 🔧 Configuración Técnica

## Variables de Entorno
```env
DATABASE_URL=postgresql://...
ABACUSAI_API_KEY=tu_api_key
APP_ORIGIN=https://tu-dominio.com/
NODE_ENV=production
```

## Base de Datos
- **Motor**: PostgreSQL
- **ORM**: Prisma
- **Tablas**: 13 tablas principales
- **Índices**: Optimizados para consultas rápidas

## Estructura de Tablas
1. `turno` - Turnos de trabajo
2. `bloqueo_activo` - Bloqueos temporales
3. `sitio_bloqueado` - Sitios bloqueados
4. `alarma` - Alarmas del usuario
5. `comandos_voz` - Historial de comandos
6. `notificacion` - Notificaciones recibidas
7. `configuracion` - Configuración del usuario
8. `archivo_sd` - Índice de archivos SD
9. `foto_camara` - Fotos tomadas
10. `webhook` - Webhooks registrados
11. Y más...

---

# 🚀 Despliegue

## Render.com
Configurado en `render.yaml` con:
- Build automático desde Git
- Base de datos PostgreSQL incluida
- Variables de entorno gestionadas

## Railway.app
Configurado en `railway.json` como alternativa.

---

# 📝 Notas Importantes

## Bloqueos INNEGABLES
⚠️ **CRÍTICO**: Los bloqueos innegables NO se pueden desactivar antes de tiempo. Esta es una característica de seguridad para autocontrol.

## Integración con Tasker
El backend está diseñado para trabajar con Tasker en Android:
1. Tasker captura eventos (notificaciones, ubicación, etc.)
2. Envía datos al backend vía HTTP
3. Backend procesa y almacena
4. Backend responde con acciones a ejecutar
5. Tasker ejecuta las acciones

## Seguridad
- Todas las rutas requieren `userId` (default: `usuario_1`)
- En producción, agregar autenticación API Key
- HTTPS obligatorio en producción

---

# 🆘 Soporte

Para consultas técnicas:
- Revisa los logs en `/api/v1/estado/general`
- Consulta la documentación Swagger en `/api-docs`
- Repositorio: https://github.com/forx10/ARGOS-Back.git

---

**Versión**: 2.0.0  
**Última actualización**: 2026-04-08  
**Estado**: ✅ Producción Ready
