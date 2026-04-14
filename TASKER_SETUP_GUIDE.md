# ARGOS + Tasker: Guía de Configuración Completa

**Versión:** 1.0  
**Backend URL:** https://argos-back-scn5.onrender.com

---

## 1. ALTERNATIVA 1: DOCUMENTACION LOCAL (Este archivo)

### Requisitos previos
- Android 6.0+
- Tasker instalado (v6.0+)
- AutoRemote instalado
- Conexión a internet

### Instalación de herramientas

**Tasker:**
1. Descarga desde: https://tasker.joaoapps.com/
2. Dale permisos de accesibilidad

**AutoRemote:**
1. Descarga desde Play Store
2. Registra tu usuario ARGOS
3. Obtén tu AUTOREMOTE_USER_KEY
4. Base: https://autoremotejoaomgcd.appspot.com

**AutoVoice (Opcional):**
1. Descarga desde Play Store
2. Habilita micrófono

### Conceptos básicos

Todas las peticiones usan este patrón:

URL: https://argos-back-scn5.onrender.com/api/[endpoint]
Método: POST o GET
Headers: Content-Type: application/json
Body: JSON con parámetros

Variables en Tasker: %hora, %date, %TIMES, %CALLER

---

## 2. ALTERNATIVA 2: EJEMPLOS DE CONFIGURACION COPY-PASTE

### Ejemplo 1: Crear un Turno

**En Tasker:**
1. Nuevo Task → "CrearTurno"
2. Add Action → Net → HTTP Request
3. Completa como sigue:

```
Method: POST
URL: https://argos-back-scn5.onrender.com/api/turnos
Headers: Content-Type: application/json
Body:
{
  "usuario_id": "usuario_1",
  "hora_inicio": "06:00",
  "hora_fin": "14:00",
  "tipo_turno": "6AM-2PM",
  "fecha": "2026-04-13",
  "activo": true
}
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": "usuario_1",
    "hora_inicio": "06:00",
    "hora_fin": "14:00"
  }
}
```

---

### Ejemplo 2: Bloquear una App por 1 hora

**En Tasker:**

```
Method: POST
URL: https://argos-back-scn5.onrender.com/api/bloqueo
Headers: Content-Type: application/json
Body:
{
  "usuarioId": "usuario_1",
  "appsBloquear": ["com.instagram.android"],
  "sitiosBloquear": [],
  "duracion": 3600,
  "trigger": "COMANDO_VOZ",
  "comandoVoz": "bloquea Instagram una hora"
}
```

---

### Ejemplo 3: Agregar una Tarea

**En Tasker:**

```
Method: POST
URL: https://argos-back-scn5.onrender.com/api/v1/tasks/add
Headers: Content-Type: application/json
Body:
{
  "userId": "usuario_1",
  "titulo": "Hacer ejercicio",
  "descripcion": "30 minutos de cardio",
  "prioridad": "alta",
  "ubicacion": "Gimnasio",
  "fechaVencimiento": "2026-04-15"
}
```

---

### Ejemplo 4: Trigger SOS (Emergencia)

**En Tasker:**

```
Method: POST
URL: https://argos-back-scn5.onrender.com/api/emergency/trigger
Headers: Content-Type: application/json
Body:
{
  "usuarioId": "usuario_1",
  "tipoEmergencia": "SOS",
  "ubicacion": "%loc",
  "contactosNotificar": ["contacto1@email.com"]
}
```

---

### Ejemplo 5: Verificar Estado Actual

**En Tasker:**

```
Method: GET
URL: https://argos-back-scn5.onrender.com/api/estado/usuario_1
Headers: Content-Type: application/json
Body: (vacío para GET)
```

---

## 3. PASOS PRACTICOS BASICOS

### Paso 1: Crear tu primer Task en Tasker

1. Abre Tasker → Tab "Tasks"
2. Click "+" → Nuevo Task
3. Nombre: "BloquearInstagram"
4. Add Action → Net → HTTP Request
5. Completa los campos con Ejemplo 2 arriba
6. Click el check para guardar

### Paso 2: Crear un Profile que dispare el Task

1. Tab "Profiles" → "+"
2. Tipo de evento: "Event"
3. Selecciona: "App → App Open"
4. Selecciona app: "Instagram"
5. Enlaza con Task: "BloquearInstagram"
6. Guarda

**Resultado:** Cada vez que abras Instagram, se bloqueará automáticamente por 1 hora

### Paso 3: Agregar Comando de Voz (AutoVoice)

1. Instala AutoVoice
2. En Tasker, nuevo Profile
3. Tipo: "Event" → "Plugin" → "AutoVoice"
4. Configura palabra clave: "bloquear"
5. Enlaza con tu Task
6. Ahora di: "bloquear Instagram" y se ejecutará

---

## Troubleshooting

### Error: Connection timeout
- Verifica: https://argos-back-scn5.onrender.com/api-docs
- Espera 5 minutos (Render despierta lentamente)
- Revisa tu conexión WiFi

### Error: Invalid JSON
- Usa comillas dobles (") no simples (')
- No dejes comas al final
- Valida en: https://jsonlint.com/

### Task no se ejecuta
- Verifica permisos de Tasker
- Habilita accesibilidad: Ajustes → Accesibilidad → Tasker
- Revisa si el Profile está activo

### AutoRemote no conecta
- Recrea conexión en settings
- Desactiva VPN temporalmente
- Reinstala la app

---

## Recursos

- API Completa: https://argos-back-scn5.onrender.com/api-docs
- Tasker Wiki: https://tasker.joaoapps.com/userguide/en/
- AutoRemote: https://joaoapps.com/autoremote/
- AutoVoice: https://joaoapps.com/autovoice/
