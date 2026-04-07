# Arquitectura ARGOS - Fase 1

## Visión General

ARGOS es un sistema de asistencia personal que combina:

- **Backend Inteligente** (NestJS): Orquesta lógica, gestiona BD, expone APIs
- **Agente Ejecutor** (Tasker): Ejecuta bloqueos, envía notificaciones, accede a hardware
- **Canal Comunicación**: Webhooks via AutoRemote (HTTP REST)

## Flujo de Datos

```
Usuario (Comando de Voz/Contexto)
  ↓
Tasker (Detecta evento)
  ↓
AutoRemote Webhook → Backend ARGOS
  ↓
Backend Procesa (valida, BD, lógica)
  ↓
Backend → Tasker (HTTP respuesta con órdenes)
  ↓
Tasker Ejecuta (bloquea, TTS, accede archivos)
  ↓
Backend Registra (logging, estado BD)
```

## Componentes Fase 1

### 1. Backend NestJS

**Módulos**:
- **TurnosModule**: Gestión de turnos rotativos, cálculo de alarmas
- **BloqueoModule**: Lógica de bloqueos de apps y sitios web
- **WebhookModule**: Listener para eventos de Tasker
- **EstadoModule**: Queries de estado completo

**Base de Datos**:
```
turnos
├── id (UUID)
├── usuarioId (string)
├── horaInicio (time)
├── horaFin (time)
├── tipo (6AM-2PM, 2PM-10PM, 10PM-6AM)
├── fecha (date)
└── timestamps

bloqueos_activos
├── id (UUID)
├── usuarioId (string)
├── appsB loqueadas (array)
├── sitiosBloqueados (array)
├── tiempoInicio (datetime)
├── tiempoFin (datetime)
├── estado (ACTIVO, COMPLETADO)
└── timestamps

sitios_bloqueados
├── id (UUID)
├── patron (string - regex)
├── categoria (porn, social, etc)
└── timestamps
```

### 2. Tasker Integration

**AutoRemote Setup**:
1. Device ID: `YOUR_DEVICE_ID` (obtener de Tasker preferences)
2. Webhook URL base: `https://autoremote.rm.net/sendmessage`
3. Backend envía órdenes vía HTTP POST

**Profiles (Detección de Eventos)**:
- Profile "Comando Voz": Escucha comandos de voz → Envía a Backend
- Profile "App Study Abierta": Detecta que se abrió app de estudio → Activar bloqueo
- Profile "Mensaje Recibido": Intercepta chat → Backend procesa → TTS respuesta

**Tasks (Ejecución)**:
- Task "Bloquear Apps": Usa Device Admin para bloquear (Instagram, TikTok, YouTube)
- Task "Bloquear Sitios": Redirige DNS o configura hosts file
- Task "TTS Notification": Reproducir mensaje por voz
- Task "Acceso SD": Listar/reproducir archivos de almacenamiento

### 3. Flujos de Casos de Uso (Fase 1)

#### A. Bloqueo por Comando de Voz
```
Usuario: "Ok Google, ARGOS bloquea Instagram"
  ↓
Tasker (reconoce comando)
  ↓
Webhook → Backend: POST /api/bloqueo
  {
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android"],
    "duracion": 3600 (segundos)
  }
  ↓
Backend crea registro en BD
  ↓
Backend → Tasker: HTTP 200 + "orden ejecutada"
  ↓
Tasker ejecuta bloqueo
  ↓
TTS: "Instagram bloqueado por 1 hora"
```

#### B. Bloqueo por Contexto (App Estudio)
```
Usuario abre app de estudio (ej: Duolingo)
  ↓
Tasker detecta apertura
  ↓
Webhook → Backend: POST /api/bloqueo
  {
    "usuarioId": "user123",
    "trigger": "app_estudio",
    "appsBloquear": ["com.instagram.android", "com.tiktok.android"],
    "duracion": "session" (hasta cerrar Duolingo)
  }
  ↓
Backend crea bloqueo contextual
  ↓
Tasker bloquea apps
  ↓
TTS: "Modo estudio activado. Concentración máxima."
  ↓
Cuando Duolingo cierra → Tasker desbloquea
```

#### C. Notificación de Chat por Voz
```
Mensaje entra (WhatsApp, Telegram, etc)
  ↓
Tasker intercepta (usando Notification Listener)
  ↓
Webhook → Backend: POST /api/webhook/tasker
  {
    "evento": "mensaje_recibido",
    "remitente": "Juan Pérez",
    "app": "whatsapp",
    "preview": "¿Vienes hoy?"
  }
  ↓
Backend procesa y genera respuesta por voz
  ↓
Backend → Tasker: HTTP 200 + TTS
  {
    "tts": "Mensaje de Juan Pérez que dice: ¿Vienes hoy?",
    "accion": "reproducir"
  }
  ↓
Tasker ejecuta TTS
```

#### D. Acceso a Archivos SD
```
Usuario: "Ok Google, ARGOS toca una canción de mi playlist"
  ↓
Tasker escucha comando
  ↓
Webhook → Backend: POST /api/archivos/lista
  {
    "usuarioId": "user123",
    "tipo": "musica",
    "carpeta": "/Music"
  }
  ↓
Backend (o Tasker directamente) lista archivos
  ↓
Backend sugiere canciones
  ↓
Tasker reproduce con eSound/Pure Tuber
```

## Seguridad & Limitaciones

### Seguridad
- ✅ HTTPS para webhooks (AutoRemote usa HTTPS)
- ✅ Device ID + Secret en AutoRemote (autenticación básica)
- ✅ Validación de usuarioId en cada request
- ⚠️ **Próximas fases**: JWT + API keys para acceso robusto

### Limitaciones Android
- ❌ No se puede bloquear sin Device Admin (requiere permiso inicial)
- ❌ Tasker no ejecuta en background si Android mata el proceso (depende de versión + batería)
- ✅ AutoRemote despierta Tasker cuando llega webhook
- ✅ Bloqueo persistente posible con Device Admin + Accessibility Service

## Variables de Entorno Críticas

```bash
# Backend necesita:
DATABASE_URL          # Conexión a PostgreSQL
TASKER_WEBHOOK_URL    # URL AutoRemote (incluye Device ID + Secret)
APP_ORIGIN            # URL pública del backend (para logs y referencias)
NODE_ENV              # production | development
```

## Próximas Mejoras (Fase 2+)

- [ ] Web app React para control visual
- [ ] WebSockets en lugar de polling para estado real-time
- [ ] OAuth + JWT para autenticación robusta
- [ ] Soporte multi-dispositivo
- [ ] Estadísticas y reportes de bloqueos
- [ ] Integración Spotify/YouTube Music
- [ ] Sincronización de calendarios Google
