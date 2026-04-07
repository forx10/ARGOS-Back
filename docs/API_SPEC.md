# API Specification - ARGOS Fase 1

## Base URL

**Desarrollo**: `http://localhost:3000`  
**Producción**: `https://tu-servicio.onrender.com` o `https://tu-servicio.railway.app`

Todos los endpoints retornan JSON con estructura:

```json
{
  "success": true,
  "data": { /* Datos específicos del endpoint */ },
  "message": "Descripción de la acción"
}
```

---

## 📋 Endpoints Disponibles

### 1. TURNOS ROTATIVOS

#### POST /api/turnos
**Crear un turno rotativo**

```bash
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "horaInicio": "06:00",
    "horaFin": "14:00",
    "tipo": "6AM-2PM",
    "fecha": "2026-04-07"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "turno_abc123",
    "usuarioId": "user123",
    "horaInicio": "06:00",
    "horaFin": "14:00",
    "tipo": "6AM-2PM",
    "createdAt": "2026-04-07T10:30:00Z"
  },
  "message": "Turno creado exitosamente"
}
```

---

#### GET /api/turnos/:usuarioId
**Obtener turnos próximos (30 días)**

```bash
curl http://localhost:3000/api/turnos/user123
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "turno_1",
      "horaInicio": "06:00",
      "horaFin": "14:00",
      "tipo": "6AM-2PM",
      "fecha": "2026-04-07"
    },
    {
      "id": "turno_2",
      "horaInicio": "14:00",
      "horaFin": "22:00",
      "tipo": "2PM-10PM",
      "fecha": "2026-04-08"
    }
  ],
  "message": "2 turnos encontrados"
}
```

---

#### GET /api/turnos/:usuarioId/analizar
**Analizar turnos + generar órdenes de bloqueo + calcular alarmas**

```bash
curl http://localhost:3000/api/turnos/user123/analizar
```

**Response**:
```json
{
  "success": true,
  "data": {
    "usuarioId": "user123",
    "turnoActual": {
      "tipo": "6AM-2PM",
      "horaInicio": "06:00",
      "activo": true
    },
    "proximoTurno": {
      "tipo": "2PM-10PM",
      "horaInicio": "14:00",
      "horasRestantes": 3.5
    },
    "alarmaProxima": {
      "timestamp": "2026-04-07T12:30:00Z",
      "minutosAntes": 90
    },
    "ordenesBloqueo": [
      {
        "trigger": "inicio_turno",
        "appsBloquear": ["com.instagram.android", "com.tiktok.android"],
        "sitiosBloquear": []
      }
    ]
  },
  "message": "Análisis completado"
}
```

---

### 2. BLOQUEOS (Apps & Sitios Web)

#### POST /api/bloqueo
**Crear bloqueo de apps o sitios web**

```bash
curl -X POST http://localhost:3000/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": [
      "com.instagram.android",
      "com.tiktok.android",
      "com.google.android.youtube"
    ],
    "sitiosBloquear": [
      "pornhub.com",
      "xvideos.com"
    ],
    "duracion": 3600,
    "razon": "Comando de voz"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "bloqueo_xyz789",
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android", "com.tiktok.android"],
    "sitiosBloquear": ["pornhub.com", "xvideos.com"],
    "tiempoInicio": "2026-04-07T10:30:00Z",
    "tiempoFin": "2026-04-07T11:30:00Z",
    "estado": "ACTIVO",
    "enviadoATasker": true,
    "taskerId": "task_12345"
  },
  "message": "Bloqueo creado y enviado a Tasker"
}
```

---

#### DELETE /api/bloqueo/:bloqueoId
**Desbloquear apps/sitios (completar bloqueo antes de tiempo)**

```bash
curl -X DELETE http://localhost:3000/api/bloqueo/bloqueo_xyz789
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "bloqueo_xyz789",
    "estado": "COMPLETADO",
    "tiempoActual": "2026-04-07T10:45:00Z",
    "tiempoRestante": 45,
    "razonFin": "Desbloqueo manual"
  },
  "message": "Bloqueo completado. Apps desbloqueadas."
}
```

---

#### GET /api/bloqueo/:usuarioId/activos
**Obtener bloqueos activos del usuario**

```bash
curl http://localhost:3000/api/bloqueo/user123/activos
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "bloqueo_1",
      "appsBloquear": ["com.instagram.android"],
      "sitiosBloquear": [],
      "tiempoInicio": "2026-04-07T10:30:00Z",
      "tiempoFin": "2026-04-07T11:30:00Z",
      "tiempoRestante": 45,
      "estado": "ACTIVO"
    }
  ],
  "message": "1 bloqueo activo"
}
```

---

### 3. WEBHOOKS (Tasker → Backend)

#### POST /api/webhook/tasker
**Webhook listener para eventos de Tasker**

Tasker envía órdenes al backend:

```bash
curl -X POST http://localhost:3000/api/webhook/tasker \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "evento": "comando_voz",
    "comando": "bloquear_instagram",
    "appsBloquear": ["com.instagram.android"],
    "duracion": 3600,
    "timestamp": "2026-04-07T10:30:00Z"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "procesado": true,
    "bloqueoCreado": "bloqueo_abc123",
    "ordenesEjecutadas": [
      "Bloquear Instagram",
      "Reproducir TTS confirmación"
    ]
  },
  "message": "Evento procesado exitosamente"
}
```

---

#### GET /api/webhook/tasker/estado/:bloqueoId
**Consultar estado de un bloqueo**

```bash
curl http://localhost:3000/api/webhook/tasker/estado/bloqueo_abc123
```

**Response**:
```json
{
  "success": true,
  "data": {
    "bloqueoId": "bloqueo_abc123",
    "estado": "ACTIVO",
    "tiempoRestante": 1800,
    "confirmacionTasker": true,
    "ultimaActualizacion": "2026-04-07T10:30:00Z"
  },
  "message": "Bloqueo en progreso"
}
```

---

### 4. ESTADO GENERAL

#### GET /api/estado/:usuarioId
**Obtener estado completo del usuario**

```bash
curl http://localhost:3000/api/estado/user123
```

**Response**:
```json
{
  "success": true,
  "data": {
    "usuarioId": "user123",
    "turnoActual": {
      "tipo": "6AM-2PM",
      "horaInicio": "06:00",
      "horaFin": "14:00",
      "activo": true
    },
    "bloqueos_activos": [
      {
        "id": "bloqueo_1",
        "apps": ["com.instagram.android"],
        "tiempoRestante": 1800
      }
    ],
    "proximoTurno": {
      "tipo": "2PM-10PM",
      "horaInicio": "14:00",
      "horasRestantes": 3.5
    },
    "alarmaProxima": {
      "timestamp": "2026-04-07T12:30:00Z",
      "tipo": "turno_siguiente"
    }
  },
  "message": "Estado completamente cargado"
}
```

---

#### GET /api/estado/:usuarioId/bloqueos
**Obtener solo bloqueos activos**

```bash
curl http://localhost:3000/api/estado/user123/bloqueos
```

---

#### GET /api/estado/:usuarioId/turnos
**Obtener turnos próximos (7 días)**

```bash
curl http://localhost:3000/api/estado/user123/turnos
```

---

#### GET /api/estado/sitios/bloqueados
**Obtener lista de sitios bloqueados por categoría**

```bash
curl http://localhost:3000/api/estado/sitios/bloqueados
```

**Response**:
```json
{
  "success": true,
  "data": {
    "por_categoria": {
      "porn": [
        "pornhub.com",
        "xvideos.com",
        "xnxx.com"
      ],
      "social": [
        "instagram.com",
        "tiktok.com"
      ]
    },
    "total": 5
  },
  "message": "Sitios bloqueados cargados"
}
```

---

## 🔐 Parámetros Comunes

### usuarioId
Identificador único del usuario. Recomendado: UUID o email.

### duracion (segundos)
- `3600` = 1 hora
- `1800` = 30 minutos
- `86400` = 1 día

### Razones de Bloqueo
```
"comando_voz"
"contexto_estudio"
"turno_rotativo"
"bloqueo_manual"
```

---

## ⚠️ Códigos de Error

| Código | Significado | Solución |
|--------|-------------|----------|
| 400 | Bad Request | Revisar JSON enviado |
| 404 | Not Found | ID de bloqueo/turno no existe |
| 500 | Server Error | Contactar soporte, revisar logs |

---

**Última actualización**: Abril 2026
