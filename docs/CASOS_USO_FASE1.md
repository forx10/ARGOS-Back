# Casos de Uso - ARGOS Fase 1

Guía práctica de cómo funcionan los 4 tipos de bloqueo implementados en ARGOS.

---

## 1️⃣ BLOQUEO POR COMANDO DE VOZ

**Scenario**: El usuario dice "Ok Google, ARGOS bloquea Instagram 1 hora"

### Flujo Detallado

```
Usuario habla
  ↓
Google Assistant reconoce comando
  ↓
Tasker Profile escucha (via AutoRemote o Google Assistant integration)
  ↓
Tasker extrae:
  - comando: "bloquea Instagram 1 hora"
  - apps a bloquear: ["com.instagram.android"]
  - duración: 3600 (segundos)
  ↓
Tasker envía al Backend:
```

### Request al Backend

```bash
curl -X POST http://BACKEND_URL/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android"],
    "sitiosBloquear": [],
    "duracion": 3600,
    "trigger": "comando_voz",
    "comandoVoz": "bloquea Instagram 1 hora"
  }'
```

### Response del Backend

```json
{
  "success": true,
  "data": {
    "bloqueo": {
      "id": 1,
      "usuario_id": "user123",
      "apps_bloqueadas": ["com.instagram.android"],
      "sitios_bloqueados": [],
      "tiempo_inicio": "2026-04-07T10:30:00Z",
      "tiempo_fin": "2026-04-07T11:30:00Z",
      "estado": "activo",
      "razon": "comando_voz"
    },
    "taskerStatus": "enviado"
  },
  "message": "Bloqueo creado y comando enviado a Tasker"
}
```

### Acción en Tasker

1. **Recibe respuesta del backend** (bloqueoId = 1)
2. **Ejecuta Task "Bloquear_Apps"**:
   - Abre Device Admin
   - Bloquea Instagram (no se puede abrir)
   - Reproducir TTS: "Instagram bloqueado por 1 hora. Ahora a trabajar."
   - Guarda `%BLOQUEO_ID` = 1 (para desbloqueo posterior)
3. **Inicia temporizador**: Cada 5 minutos verifica si el bloqueo debe terminar
4. **Cuando termina el tiempo**:
   - Ejecuta Task "Desbloquear_Apps"
   - Desactiva Device Admin
   - TTS: "Desbloqueo completado."
   - DELETE al backend: `/api/bloqueo/1`

---

## 2️⃣ BLOQUEO POR CONTEXTO (App Abierta)

**Scenario**: El usuario abre Duolingo (app de estudio) → Bloqueamos Instagram y TikTok automáticamente

### Flujo Detallado

```
Usuario abre Duolingo (com.duolingo.android)
  ↓
Tasker Profile: "App Abierta" detecta (App Launch event)
  ↓
Tasker envía al Backend:
  - app que se abrió: "com.duolingo.android"
  - apps a bloquear: ["com.instagram.android", "com.tiktok.android"]
  - duración: "session" (hasta cerrar Duolingo)
  ↓
Backend crea bloqueo contextual
```

### Request al Backend

```bash
curl -X POST http://BACKEND_URL/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android", "com.tiktok.android"],
    "sitiosBloquear": [],
    "duracion": 28800,
    "trigger": "contexto_estudio",
    "appTrigger": "com.duolingo.android",
    "razon": "Duolingo abierto - sesión de estudio"
  }'
```

**Nota**: `duracion` = 28800 segundos (8 horas) como máximo. Tasker desactivará el bloqueo cuando Duolingo cierre.

### Response del Backend

```json
{
  "success": true,
  "data": {
    "bloqueo": {
      "id": 2,
      "usuario_id": "user123",
      "apps_bloqueadas": ["com.instagram.android", "com.tiktok.android"],
      "tiempo_fin": "2026-04-07T18:30:00Z",
      "estado": "activo",
      "razon": "contexto_estudio"
    },
    "taskerStatus": "enviado"
  }
}
```

### Acción en Tasker

1. **Recibe respuesta** (bloqueoId = 2)
2. **Ejecuta Task "Bloquear_Apps_Contexto"**:
   - Bloquea Instagram + TikTok
   - TTS: "Modo estudio activado. Instagram y TikTok bloqueados hasta que cierres Duolingo."
   - Guarda: `%BLOQUEO_CONTEXTUAL_ID` = 2
   - Guarda: `%APP_TRIGGER_MONITOREAR` = "com.duolingo.android"

3. **Monitorea cierre de Duolingo**:
   - Profile: "App Cerrada" escucha "com.duolingo.android"
   - Cuando detecta cierre:
     - DELETE `/api/bloqueo/2` (desbloquea en backend)
     - Ejecuta Task "Desbloquear_Apps"
     - TTS: "Duolingo cerrado. Bloques removidos."

---

## 3️⃣ BLOQUEO POR TURNO ROTATIVO

**Scenario**: Usuario tiene turno 6AM-2PM → Backend detecta inicio del turno → Bloquea automáticamente distracciones

### Flujo Detallado

```
Backend verifica turnos cada hora (via cron)
  ↓
Backend detecta: Turno 6AM-2PM comienza a las 6AM
  ↓
A las 4:30AM (1.5h antes):
  - Backend calcula alarma
  - Envía orden a Tasker: "Preparar para turno"
  ↓
A las 6AM (inicio del turno):
  - Backend envía orden: Bloquear apps distractoras
  - Tasker ejecuta bloqueo automático
  ↓
A las 2PM (fin del turno):
  - Backend envía orden: Desbloquear
  - Tasker desbloquea automáticamente
```

### Request al Backend (Generado automáticamente por Backend)

```bash
curl -X POST http://BACKEND_URL/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android", "com.tiktok.android", "com.google.android.youtube"],
    "sitiosBloquear": ["pornhub.com", "xvideos.com"],
    "duracion": 28800,
    "trigger": "turno_rotativo",
    "razon": "Turno 6AM-2PM"
  }'
```

### Response del Backend

```json
{
  "success": true,
  "data": {
    "bloqueo": {
      "id": 3,
      "usuario_id": "user123",
      "apps_bloqueadas": ["com.instagram.android", "com.tiktok.android", "com.google.android.youtube"],
      "sitios_bloqueados": ["pornhub.com", "xvideos.com"],
      "tiempo_fin": "2026-04-07T14:00:00Z",
      "estado": "activo",
      "razon": "turno_rotativo"
    }
  }
}
```

### Acción en Tasker

1. **A las 4:30AM**: Recibe orden de alarma
   - TTS: "Tu turno comienza en 1.5 horas. Prepárate."
   - Configura alarma para 6AM

2. **A las 6AM**: Alarma suena → Ejecuta "Bloquear_Apps_Turno"
   - Bloquea Instagram, TikTok, YouTube
   - Bloquea sitios web (pornografía)
   - TTS: "Turno iniciado. Distracciones bloqueadas hasta las 2PM."
   - Muestra notification permanente: "En turno: 6AM-2PM | Bloques activos"

3. **A las 2PM**: Backend envía orden de desbloqueo
   - Ejecuta Task "Desbloquear_Turno"
   - Desactiva Device Admin
   - TTS: "Turno completado. Buen trabajo."
   - Ofrece opción: "¿Descansar 30min o continuar trabajando?"

---

## 4️⃣ BLOQUEO MANUAL

**Scenario**: Usuario abre app de ARGOS (Fase 2) y hace click en "Bloquear Instagram 30min"

### Request al Backend

```bash
curl -X POST http://BACKEND_URL/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android"],
    "sitiosBloquear": [],
    "duracion": 1800,
    "trigger": "bloqueo_manual",
    "razon": "Usuario activó desde app"
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "bloqueo": {
      "id": 4,
      "estado": "activo",
      "tiempo_fin": "2026-04-07T11:00:00Z"
    }
  }
}
```

### Acción en Tasker

1. Ejecuta bloqueo inmediato
2. Muestra countdown timer
3. Usuario puede hacer click en "Desbloquear ahora" para terminar antes

---

## 📱 Integración Tasker - Ejemplos Prácticos

### Instalación AutoRemote en Tasker

```
1. Abrir Tasker
2. Ir a: Preferences > Tasker > Plugins
3. Buscar "AutoRemote"
4. Instalar
5. Volver a: Preferences > AutoRemote
6. Obtener Device ID: "15d3c4f987a2b"
7. Obtener Secret: "mySecret123"
8. URL webhook: https://autoremote.rm.net/sendmessage?secretOrPassword=mySecret123&to=15d3c4f987a2b&message=%s
```

### Profile #1: Escuchar Órdenes del Backend

```
Profile: "Recibir Orden Backend"
Event: Plugin > AutoRemote
  Filter: "bloqueo" (cualquier mensaje que contenga "bloqueo")

Task: "Procesar_Orden"
  1. Variable Set:
     %BLOQUEO_JSON = %evtprm1 (el JSON del backend)
  2. Toast: Mostrar orden recibida
  3. Ejecutar Task basada en trigger:
     IF %TRIGGER = "comando_voz"
       THEN Bloquear_Apps
     ELSE IF %TRIGGER = "contexto_estudio"
       THEN Bloquear_Apps_Contexto
```

### Profile #2: Detectar Apertura de App Estudio

```
Profile: "App Estudio Abierta"
Event: App > App Launch
  App: Duolingo (com.duolingo.android)

Task: "Activar Bloqueo Contexto"
  1. HTTP Post:
     URL: http://BACKEND_URL/api/bloqueo
     JSON: {
       "usuarioId": "user123",
       "appsBloquear": ["com.instagram.android", "com.tiktok.android"],
       "duracion": 28800,
       "trigger": "contexto_estudio",
       "appTrigger": "com.duolingo.android"
     }
  2. Esperar respuesta
  3. Ejecutar Task "Bloquear_Apps"
```

---

## ⏱️ Variables Tasker Recomendadas

```
%BLOQUEO_ID                   # ID del bloqueo activo
%USUARIO_ID                   # user123
%APPS_BLOQUEADAS              # Lista separada por comas
%BLOQUEO_TRIGGER              # comando_voz, contexto_estudio, etc
%BLOQUEO_TIEMPO_FIN           # Timestamp de fin
%BLOQUEO_ACTIVO               # 1 o 0
%BACKEND_URL                  # URL del backend (https://...)
```

---

## 🔧 Testing Rápido

### Test 1: Bloqueo por Voz (sin Google Assistant)

```bash
# Simular comando de voz en Tasker
# Task: HTTP Post
curl -X POST http://localhost:3000/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "test_user",
    "appsBloquear": ["com.instagram.android"],
    "sitiosBloquear": [],
    "duracion": 300,
    "trigger": "comando_voz",
    "comandoVoz": "prueba"
  }'

# Response esperado: bloqueo ID 1
# Tasker debe bloquear Instagram por 5 minutos
```

### Test 2: Bloqueo por Contexto

```bash
curl -X POST http://localhost:3000/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "test_user",
    "appsBloquear": ["com.tiktok.android"],
    "duracion": 600,
    "trigger": "contexto_estudio",
    "appTrigger": "com.duolingo.android"
  }'
```

### Test 3: Ver Bloqueos Activos

```bash
curl http://localhost:3000/api/bloqueo/test_user/activos
```

### Test 4: Desbloquear

```bash
curl -X DELETE http://localhost:3000/api/bloqueo/1
```

---

## 📊 Diagrama de Estados

```
┌──────────────┐
│   INACTIVO   │
│              │
│ Sin bloqueos │
└──────┬───────┘
       │ Usuario activa bloqueo
       │ (voz, contexto, turno)
       ↓
┌──────────────────┐
│  ACTIVO          │
│                  │
│ Apps bloqueadas  │
│ Countdown activo │
└──────┬───────────┘
       │ Tiempo agotado O
       │ Usuario desbloquea manualmente
       ↓
┌──────────────────┐
│  COMPLETADO      │
│                  │
│ Bloqueos removidos│
└──────────────────┘
```

---

## 🚀 Próximas Fases

**Fase 2**:
- Web app visual con countdown timers
- Control de música (eSound/Pure Tuber)
- Notificaciones de chat por voz

**Fase 3**:
- Hardware diagnostics
- Auto-cleanup de archivos
- Sincronización multi-dispositivo

---

**Última actualización**: Abril 2026
