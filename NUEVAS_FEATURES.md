# ✨ Nuevas Características: Auto-actualización y Visión de Pantalla

## 🚀 Características Agregadas (Versión 2.1.0)

ARGOS ahora puede:
1. **🔄 Actualizarse automáticamente** cuando no pueda realizar una tarea
2. **👁️ Ver tu pantalla** y ayudarte cuando le pidas que "mire"

---

# 🔄 MÓDULO 1: Auto-Actualización (Self-Update)

## 📋 Descripción

ARGOS puede detectar cuando NO puede ejecutar un comando y sugerirte actualizaciones automáticas con:
- ✅ Pros y contras de cada opción
- ✅ Tiempo estimado de instalación
- ✅ Permisos necesarios
- ✅ Historia de solicitudes

## 🎯 Casos de Uso

### Caso 1: Control de Hogar Inteligente
```
Usuario: "ARGOS controla las luces de mi sala"
ARGOS: "No puedo hacer eso aún, pero puedo actualizarme ¿Quieres?"

ARGOS muestra:
┌─ Opción 1: Smart Home IoT
│  PROS:
│  • Controlar luces, temperatura, puertas
│  • Automatización de escenas
│  • Control por voz
│  
│  CONTRAS:
│  • Requiere red local o conexión a nube
│  • Compatible solo con ciertos dispositivos
│  • Configuración inicial compleja
│  
│  Tiempo: 4 horas
│  Permisos: wifi, red
└─

Usuario: "Apruebo la actualización"
ARGOS: "Comenzaré la descarga, te notificaré cuando esté lista"
```

### Caso 2: Integración con Gmail
```
Usuario: "Lee mis correos electrónicos"
ARGOS: "No tengo acceso a tus emails aún. Puedo integrar Gmail:"

PROS:
• Leer emails por voz
• Responder automáticamente
• Filtrar por remitente o asunto

CONTRAS:
• Requiere OAuth de Google
• Acceso a cuenta Gmail
• Latencia de 1-2 segundos

Tiempo: 3 horas
```

## 📡 Endpoints

### `POST /api/v1/self-update/analyze-command`
Analiza si ARGOS puede ejecutar un comando.

**Request:**
```json
{
  "commandType": "control_hogar",
  "commandDescription": "Controlar las luces inteligentes",
  "reason": "Quiero apagar las luces desde mi cama"
}
```

**Response (No disponible):**
```json
{
  "success": true,
  "canExecute": false,
  "message": "ARGOS no puede realizar esta tarea aún, pero puedo actualizarme",
  "commandType": "control_hogar",
  "updateRequestId": 1,
  "updateOptions": [
    {
      "type": "smart_home_iot",
      "description": "Integración con dispositivos smart home",
      "pros": ["Controlar luces", "Automatización", "Control por voz"],
      "cons": ["Requiere red local", "Solo ciertos dispositivos"],
      "estimatedTime": "4 horas",
      "requiredPermissions": ["permiso_wifi", "permiso_red"]
    }
  ]
}
```

### `POST /api/v1/self-update/approve/:id`
Aprueba una actualización.

**Request:**
```json
{
  "selectedOption": "smart_home_iot"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Actualización aprobada",
  "nextSteps": [
    "1. ARGOS comenzará la descarga",
    "2. Se instalará en segundo plano",
    "3. Te notificaré cuando esté lista",
    "4. Podrás usar la nueva función inmediatamente"
  ],
  "estimatedDuration": "Depende del módulo (2-4 horas)"
}
```

### `POST /api/v1/self-update/reject/:id`
Rechaza una actualización.

### `GET /api/v1/self-update/history`
Historial de actualizaciones solicitadas.

### `GET /api/v1/self-update/system-info`
Información del sistema, versión e features instalados.

**Response:**
```json
{
  "version": "2.1.0",
  "buildDate": "2026-04-08",
  "features": [
    "Bloqueos Innegables",
    "Control de Música",
    "Inteligencia IA",
    "Visión de Pantalla",
    "Auto-actualización"
  ],
  "status": "operative"
}
```

---

## 📋 Actualizaciones Disponibles

### 1. 🏠 Smart Home IoT
**Descripción:** Control de dispositivos inteligentes (luces, termostato, puertas)
- **Tiempo:** 4 horas
- **Complejidad:** Alta
- **Depende de:** Tasker, AutoRemote

### 2. 📧 Gmail Integration
**Descripción:** Leer y responder emails
- **Tiempo:** 3 horas
- **Complejidad:** Media
- **Requiere:** OAuth Google

### 3. 📅 Google Calendar
**Descripción:** Ver eventos y crear alarmas
- **Tiempo:** 2 horas
- **Complejidad:** Baja
- **Requiere:** OAuth Google

### 4. 📄 OCR Vision
**Descripción:** Leer documentos, facturas, recibos
- **Tiempo:** 2 horas
- **Complejidad:** Media
- **Usa:** Créditos de IA

---

# 👁️ MÓDULO 2: Visión de Pantalla (Screen Vision)

## 📋 Descripción

ARGOS puede ver tu pantalla y analizar problemas cuando le pides:

```
"ARGOS mira mi pantalla"
```

Luego:
1. Tasker captura screenshot
2. Envía a ARGOS
3. ARGOS analiza con IA
4. Te da sugerencias específicas
5. Ofrece enlaces de ayuda

## 🎯 Casos de Uso

### Caso 1: Aplicación Congelada
```
Usuario: "ARGOS mira mi pantalla, la app se congela"

ARGOS analiza y responde:
"Veo que tienes 8 aplicaciones abiertas y solo 2GB de RAM libre.
La aplicación X está usando mucha memoria.

Sugerencias:
1. Cierra apps innecesarias
2. Limpia caché
3. Reinicia el dispositivo"
```

### Caso 2: Problema de Batería
```
Usuario: "Mi batería se agota muy rápido"

ARGOS mira y analiza:
"Detecto que:
- WiFi siempre activo
- Ubicación en alta precisión
- Brillo al máximo
- Sincronización automática activa

Recomendaciones:
1. Reduce brillo o activa brillo automático
2. Desactiva ubicación cuando no la uses
3. Desactiva WiFi en reposo"
```

### Caso 3: Espacio de Almacenamiento
```
Usuario: "No tengo espacio en el teléfono"

ARGOS mira y dice:
"Tu almacenamiento:
- Fotos: 4.2GB
- Aplicaciones: 2.1GB
- Cache: 800MB

Sugerencias:
1. Elimina fotos duplicadas
2. Comprime videos
3. Limpia cache de apps"
```

## 🔒 Privacidad

⚠️ **IMPORTANTE:**
- Las capturas se almacenan en tu servidor local
- Solo tú tienes acceso
- Puedes eliminarlas en cualquier momento
- ARGOS **NUNCA** sube capturas a servidores externos

```bash
# Eliminar una captura
DELETE /api/v1/screen-vision/1

# Eliminar todas las capturas (privacidad)
DELETE /api/v1/screen-vision?userId=usuario_1
```

## 📡 Endpoints

### `POST /api/v1/screen-vision/analyze`
Analiza una captura de pantalla.

**Request:**
```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "context": "La aplicación se congela cuando intento abrir archivos"
}
```

**Response:**
```json
{
  "success": true,
  "screenshotId": 1,
  "analysis": "Veo que tienes varias aplicaciones abiertas...",
  "suggestions": [
    "Cierra aplicaciones innecesarias",
    "Actualiza el sistema operativo",
    "Limpia el cache"
  ],
  "helpfulLinks": [
    {
      "title": "Centro de Ayuda Android",
      "url": "https://support.google.com/android"
    },
    {
      "title": "Mejorar duracion de batería",
      "url": "https://support.google.com/android/answer/7664358"
    }
  ]
}
```

### `GET /api/v1/screen-vision/history`
Historial de capturas analizadas.

**Response:**
```json
{
  "count": 3,
  "screenshots": [
    {
      "id": 1,
      "timestamp": "2026-04-09T15:09:29Z",
      "context": "La aplicación se congela",
      "analyzed": true,
      "summary": "Veo que tienes varias apps abiertas..."
    }
  ]
}
```

### `GET /api/v1/screen-vision/:id`
Detalles completos de una captura.

### `DELETE /api/v1/screen-vision/:id`
Elimina una captura específica.

### `DELETE /api/v1/screen-vision/`
Elimina TODAS las capturas (privacidad).

---

## 🔧 Configuración en Tasker

### Tarea: Capturar Pantalla

```
Evento: Comando de voz "ARGOS mira mi pantalla"

Acciones:
A1: Take Screenshot
    Path: /sdcard/DCIM/Screenshots/

A2: List Files
    Dir: /sdcard/DCIM/Screenshots
    
A3: Read File
    File: %screenshot_path
    To: %image_bytes
    
A4: Base64 Encode
    Variable: %image_bytes
    Result: %image_base64
    
A5: HTTP Request
    Method: POST
    URL: %ARGOS_URL/api/v1/screen-vision/analyze
    Headers: Content-Type: application/json
    Body: {
      "imageBase64": "%image_base64",
      "context": "%avcommnofilter"
    }
    
A6: Say
    Text: %http_data.analysis
    Engine: Voice

A7: For each suggestion
    Say: %suggestion
```

---

## 💡 Ejemplos de Comandos de Voz

```
"ARGOS mira mi pantalla"
→ Captura y analiza

"ARGOS mira mi pantalla, la app se congela"
→ Captura, analiza específicamente ese problema

"ARGOS muéstrame el historial de pantallas"
→ Lista capturas previas

"ARGOS elimina mis capturas"
→ Elimina todo el historial (privacidad)
```

---

## 🎨 Flujo Completo

```
Usuario dice:              
"ARGOS mira mi pantalla"
        ↓
   Tasker captura screenshot
        ↓
   Se convierte a Base64
        ↓
   Envía a ARGOS Backend
        ↓
   ARGOS analiza con LLM Vision
        ↓
   Genera sugerencias
        ↓
   ARGOS dice respuesta en voz
        ↓
   Almacena en base de datos
        ↓
   Usuario puede revisar historial
        ↓
   Opcionalmente elimina captura
```

---

## 🔐 Consideraciones de Seguridad

✅ **Lo que ARGOS puede ver:**
- Aplicaciones abiertas
- Errores mostrados
- Notificaciones visibles
- Interfaz del sistema
- Uso de recursos (RAM, CPU, batería)

❌ **Lo que ARGOS NO puede hacer:**
- Leer datos privados (mensajes, emails)
- Acceder a contraseñas
- Modificar archivos
- Instalar aplicaciones
- Cambiar configuración sin permiso

---

## 🧪 Ejemplos Prácticos

### Problema: "Mi teléfono va lento"

```bash
curl -X POST http://localhost:3000/api/v1/screen-vision/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "[screenshot base64]",
    "context": "Mi teléfono va muy lento"
  }'
```

**Respuesta:**
```
"Veo que tienes 12 aplicaciones en segundo plano.
Tu RAM disponible es apenas 200MB.

Recomendaciones:
1. Cierra apps que no uses
2. Activa el Modo Ahorro de Batería
3. Desactiva las animaciones"
```

### Problema: "Pantalla en blanco"

```bash
curl -X POST http://localhost:3000/api/v1/screen-vision/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "[screenshot]",
    "context": "La pantalla está en blanco, no puedo ver nada"
  }'
```

**Respuesta:**
```
"Parece que:
1. El brillo está al mínimo
2. O la aplicación se congela

Intenta:
1. Sube el brillo
2. Reinicia la aplicación
3. Si persiste, reinicia el dispositivo"
```

---

## 📊 Estadísticas

- **Total de endpoints nuevos:** 7
- **Tablas de base de datos nuevas:** 2
- **Actualizaciones disponibles:** 10+
- **Máximo historial de capturas:** 50

---

## 🚀 Versión

**ARGOS v2.1.0**
- Fecha: 2026-04-09
- Estado: Beta
- Endpoints totales: 58 (51 + 7 nuevos)

