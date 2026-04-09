# ARGOS Phase 3 - Documentación Completa

## Seguridad, Productividad y Optimización

**Fecha:** Abril 9, 2026  
**Versión:** 3.0.0  
**Total de Endpoints:** 29 nuevos (58+ totales)  
**Módulos:** 6 nuevos (21 totales)

---

## 🚨 1. EMERGENCY SOS MODULE

### Descripción
Sistema de emergencia crítico que garantiza que NUNCA se bloquean las llamadas, incluso en Focus Mode. Activa SOS inmediato, llama a contactos, envía WhatsApp con ubicación.

### Endpoints

#### 1.1 Agregar Contacto de Emergencia
```
POST /api/v1/emergency/contact/add
Content-Type: application/json

Body:
{
  "userId": "usuario_1",
  "nombre": "Manuel",
  "telefono": "+573001234567",
  "tipo": "familia"
}

Response:
{
  "success": true,
  "message": "✅ Manuel agregado como contacto de emergencia",
  "contacto": {
    "id": 1,
    "nombre": "Manuel",
    "telefono": "+573001234567"
  }
}
```

**Comandos de Voz:**
- "ARGOS agregar a Manuel como contacto de emergencia"
- "ARGOS agregar a mi mamá como contacto de emergencia"

---

#### 1.2 ACTIVAR SOS (CRÍTICO)
```
POST /api/v1/emergency/sos/activate
Content-Type: application/json

Body:
{
  "userId": "usuario_1",
  "latitud": 4.7110,
  "longitud": -74.0721,
  "tipoEmergencia": "robo"
}

Response INMEDIATA:
{
  "success": true,
  "message": "🚨 SOS ACTIVADO",
  "acciones": [
    "📞 Llamando a contactos de emergencia...",
    "💬 Si no contestan, enviaré WhatsApp automáticamente",
    "📍 Ubicación compartida: https://maps.google.com/?q=4.7110,-74.0721",
    "🎙️ Grabando audio para seguridad"
  ]
}
```

**Comandos de Voz:**
- "ARGOS emergencia"
- "ARGOS ayuda"
- "ARGOS policía"

**Flujo Automático:**
1. Llamada a Manuel (máx 30 segundos)
2. Si no contesta → Llamada a Mamá
3. Si no contesta → WhatsApp a ambos con ubicación
4. Reintentos cada 1 minuto
5. Audio grabado en background
6. Pantalla con botones de emergencia visible

---

## 📍 2. GEOFENCING + LOCATION-BASED REMINDERS

### Descripción
Detecta automáticamente cuando llegas a una ubicación y genera recordatorios personalizados.

#### Crear Geofence
```
POST /api/v1/geofencing/create
Content-Type: application/json

Body:
{
  "userId": "usuario_1",
  "nombre": "Casa",
  "latitud": 4.7110,
  "longitud": -74.0721,
  "recordatorios": ["comer", "organizarte", "estudiar"],
  "radio": 500,
  "tipoBloqueo": "focus",
  "duracionBloqueo": 60
}

Response:
{
  "success": true,
  "message": "📍 Geofence Casa creado exitosamente"
}
```

#### Detectar Ubicación
```
POST /api/v1/geofencing/detect
Content-Type: application/json

Body:
{
  "userId": "usuario_1",
  "latitud": 4.7115,
  "longitud": -74.0720
}

Response:
{
  "success": true,
  "detectado": true,
  "mensaje": "📍 Hola, veo que llegaste a tu CASA 🏠",
  "recordatorios": ["comer", "organizarte", "estudiar"],
  "acciones": [
    "✅ Recuerda: comer, organizarte, estudiar",
    "💪 ¿Quieres que bloquee el celular 60min?"
  ]
}
```

**Comandos de Voz:**
- "ARGOS crea geofence Casa con recordatorios: comer, organizarte"
- "ARGOS actualiza recordatorios de Casa"

---

## 📝 3. FOCUS MODE (MODO DE CONCENTRACIÓN)

### CRÍTICO: LAS LLAMADAS SIEMPRE FUNCIONAN

Apps que SIEMPRE pueden hacer llamadas (incluso en Focus Mode):
- Teléfono (com.android.phone)
- Google Dialer (com.google.android.dialer)
- WhatsApp (com.whatsapp)
- Messenger (com.facebook.orca)
- Telegram (org.telegram.messenger)
- Viber (com.viber.voip)

#### Activar Focus Mode
```
POST /api/v1/focus-mode/activate
Content-Type: application/json

Body:
{
  "userId": "usuario_1",
  "duracionMinutos": 120,
  "appsABloquear": ["com.instagram.android", "com.tiktok"],
  "sitiosABloquear": ["youtube.com", "twitter.com"],
  "motivo": "estudio"
}

Response:
{
  "success": true,
  "message": "📄 Modo de concentración activado por 120 minutos",
  "sesion": {
    "id": 1,
    "duracion": 120,
    "horaFin": "2026-04-09T16:45:00Z",
    "appsDesbloqueadas": ["com.android.phone", "com.whatsapp"],
    "avisos": [
      "📄 Apps y sitios bloqueados",
      "📞 Las llamadas SIEMPRE entran y salen",
      "🚨 Las emergencias desbloquean todo instantáneamente"
    ]
  }
}
```

#### Obtener Estadísticas
```
GET /api/v1/focus-mode/stats?userId=usuario_1

Response:
{
  "success": true,
  "estadisticas": {
    "totalSesiones": 15,
    "tiempoTotalFocus": "2400min",
    "tiempoPromedio": "160min",
    "appsEvitadas": 5,
    "razonMasUsada": "estudio"
  }
}
```

**Comandos de Voz:**
- "ARGOS Focus Mode 2 horas"
- "ARGOS bloquea Instagram y TikTok por 1 hora"
- "ARGOS cuánto tiempo me falta"

---

## ✅ 4. TASK MANAGER

#### Agregar Tarea
```
POST /api/v1/tasks/add
Content-Type: application/json

Body:
{
  "userId": "usuario_1",
  "titulo": "Hacer ejercicio",
  "descripcion": "30 minutos de cardio",
  "prioridad": "alta",
  "ubicacion": "Gimnasio",
  "fechaVencimiento": "2026-04-10"
}

Response:
{
  "success": true,
  "message": "✅ Tarea Hacer ejercicio agregada"
}
```

#### Obtener Tareas
```
GET /api/v1/tasks/list?userId=usuario_1&soloActivas=true

Response:
{
  "success": true,
  "total": 3,
  "resumen": {"alta": 1, "media": 1, "baja": 1},
  "tareas": [...]
}
```

#### Recordatorio por Voz
```
GET /api/v1/tasks/reminder-voice?userId=usuario_1

Response:
{
  "success": true,
  "recordatorio": "Tienes 3 tareas pendientes. 1 de alta prioridad: Hacer ejercicio."
}
```

**Comandos de Voz:**
- "ARGOS agrega tarea: hacer ejercicio, alta prioridad"
- "ARGOS qué tareas me quedan"
- "ARGOS completa: hacer ejercicio"

---

## 🔧 5. DEVICE DIAGNOSTICS

#### Registrar Diagnóstico
```
POST /api/v1/device-diagnostics/register

Body:
{
  "userId": "usuario_1",
  "ramTotalMb": 4096,
  "ramDisponibleMb": 512,
  "cpuPorcentaje": 45,
  "temperatura": 38,
  "bateriaPorcent": 75,
  "almacenamientoLibreMb": 2048
}

Response:
{
  "success": true,
  "estado": "✅ Dispositivo en buen estado",
  "problemas": [],
  "recomendaciones": []
}
```

**Problemas Detectados:**
- RAM baja (< 500MB)
- CPU alta (> 80%)
- Temperatura alta (> 40°C)
- Batería baja (< 20%)
- Almacenamiento casi lleno

**Comandos de Voz:**
- "ARGOS checa mi dispositivo"
- "ARGOS cómo está mi batería"
- "ARGOS limpiar caché"

---

## 🛡️ 6. NETWORK SECURITY MONITOR

#### Analizar WiFi
```
POST /api/v1/network-security/analyze-wifi

Body:
{
  "userId": "usuario_1",
  "nombreWifi": "Mi Red 5G",
  "nivelSeguridad": "WPA2"
}

Response:
{
  "success": true,
  "wifiSeguro": true,
  "recomendaciones": ["✅ WiFi seguro (WPA2)"]
}
```

#### Detectar Phishing
```
POST /api/v1/network-security/check-phishing

Body:
{
  "userId": "usuario_1",
  "sitio": "paypal-verify.com"
}

Response:
{
  "success": true,
  "esPhishing": true,
  "riesgo": "MUY ALTO",
  "recomendaciones": [
    "🚨 ADVERTENCIA: Este sitio es phishing",
    "⚡ NO ingreses información personal"
  ]
}
```

**Comandos de Voz:**
- "ARGOS ¿es segura mi WiFi?"
- "ARGOS ¿es seguro paypal.com?"
- "ARGOS recomiéndame una VPN"

---

## 📊 Resumen Total

**Módulos:** 21 totales
**Endpoints:** 58+ totales
**Tablas BD:** 21 tablas Prisma
**Status:** ✅ Phase 3 Completada

### Próximas Fases:
- Fase 4: Sleep Tracking + Health
- Fase 5: Smart Home IoT
- Fase 6: Gmail + Google Calendar
- Fase 7: Dashboard Web React

