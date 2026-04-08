# 🤖 Integración ARGOS con Tasker

## 📋 Configuración Básica

### 1️⃣ Variables Globales en Tasker

Crea estas variables globales:
```
%ARGOS_URL = https://tu-dominio.abacusai.app
%ARGOS_USER_ID = usuario_1
```

---

## 🎯 Perfiles y Tareas Recomendados

### Perfil 1: Notificaciones de WhatsApp

**Evento**: Notification → App: WhatsApp

**Tarea**: Enviar Notificación a ARGOS
```
A1: Variable Set
   %app = WhatsApp
   
A2: Variable Set
   %title = %evtprm2
   
A3: Variable Set
   %text = %evtprm3
   
A4: Variable Set
   %sender = %evtprm2
   
A5: HTTP Request
   Method: POST
   URL: %ARGOS_URL/api/v1/notifications/receive
   Headers: Content-Type: application/json
   Body: {
     "app": "%app",
     "title": "%title",
     "text": "%text",
     "sender": "%sender"
   }
   
A6: Variable Set (de la respuesta)
   %voice_message = %http_data.voiceMessage
   
A7: Say
   Text: %voice_message
   Engine:Voice: es-ES
```

---

### Perfil 2: Comando de Voz "ARGOS"

**Evento**: AutoVoice Recognized → Command Filter: ARGOS *

**Tarea**: Procesar Comando
```
A1: Variable Set
   %comando = %avcommnofilter
   
A2: If [%comando contiene "bloquea"]
   
A3:   Goto → Tarea_Bloqueo
   
A4: Else If [%comando contiene "reproduce"]
   
A5:   Goto → Tarea_Musica
   
A6: Else If [%comando contiene "llévame"]
   
A7:   Goto → Tarea_Navegacion
   
A8: Else
   
A9:   Goto → Tarea_Inteligencia
   
A10: End If
```

---

### Tarea: Bloquear Apps

```
A1: Variable Search Replace
   Variable: %avcommnofilter
   Search: bloquea (.+) por (\d+) horas?
   Store Matches In: %matches
   
A2: Variable Set
   %apps = %matches1
   
A3: Variable Set
   %hours = %matches2
   
A4: HTTP Request
   Method: POST
   URL: %ARGOS_URL/api/v1/app-blocker/activate
   Headers: Content-Type: application/json
   Body: {
     "apps": ["%apps"],
     "hours": %hours
   }
   
A5: Variable Set
   %response = %http_data.message
   
A6: Say
   Text: %response
```

---

### Tarea: Control de Música

```
A1: If [%avcommnofilter contiene "reproduce"]
   
A2:   HTTP Request POST %ARGOS_URL/api/v1/music/play
   
A3:   Media Control: Play
   
A4: Else If [%avcommnofilter contiene "pausa"]
   
A5:   HTTP Request POST %ARGOS_URL/api/v1/music/pause
   
A6:   Media Control: Pause
   
A7: Else If [%avcommnofilter contiene "siguiente"]
   
A8:   HTTP Request POST %ARGOS_URL/api/v1/music/next
   
A9:   Media Control: Next
   
A10: End If
```

---

### Tarea: Navegación GPS

```
A1: Variable Search Replace
   Variable: %avcommnofilter
   Search: llévame a (.+)
   Store Matches In: %matches
   
A2: Variable Set
   %destination = %matches1
   
A3: HTTP Request
   Method: POST
   URL: %ARGOS_URL/api/v1/location/navigate
   Headers: Content-Type: application/json
   Body: {
     "destination": "%destination"
   }
   
A4: Variable Set
   %maps_url = %http_data.googleMapsUrl
   
A5: Browse URL
   URL: %maps_url
```

---

### Tarea: Inteligencia (Búsqueda/Preguntas)

```
A1: Variable Set
   %question = %avcommnofilter
   
A2: HTTP Request
   Method: POST
   URL: %ARGOS_URL/api/v1/intelligence/answer
   Headers: Content-Type: application/json
   Body: {
     "question": "%question",
     "useWebSearch": true
   }
   
A3: Variable Set
   %answer = %http_data.answer
   
A4: Say
   Text: %answer
   Engine:Voice: es-ES
```

---

### Tarea: Indexar Archivos SD (Ejecutar 1 vez al día)

```
A1: List Files
   Dir: /sdcard/DCIM/Camera
   Include Hidden: Off
   
A2: For
   Variable: %file
   Items: %files
   
A3:   Variable Set
      %file_name = %file
      
A4:   Variable Set
      %file_path = /sdcard/DCIM/Camera/%file
      
A5:   Get File Info
      File: %file_path
      
A6:   Variable Set
      %file_size = %file_size_bytes
      
A7:   Array Push
      Array: %files_array
      Position: Last
      Value: {
        "nombre": "%file_name",
        "rutaCompleta": "%file_path",
        "tamanoBytes": %file_size
      }
      
A8: End For

A9: HTTP Request
   Method: POST
   URL: %ARGOS_URL/api/v1/sd-files/index
   Headers: Content-Type: application/json
   Body: {
     "files": %files_array
   }
```

---

### Tarea: Registrar Foto de Cámara

**Evento**: File Modified → Path: /sdcard/DCIM/Camera

```
A1: Variable Set
   %photo_path = %file
   
A2: Get File Info
   File: %photo_path
   
A3: Variable Set
   %resolution = %image_width x %image_height
   
A4: HTTP Request
   Method: POST
   URL: %ARGOS_URL/api/v1/camera/register-photo
   Headers: Content-Type: application/json
   Body: {
     "rutaArchivo": "%photo_path",
     "camara": "trasera",
     "resolucion": "%resolution"
   }
```

---

## 🔒 Bloqueos Persistentes

### Bloquear Apps (Task)

```
A1: Get HTTP Response del endpoint de bloqueos activos
   
A2: Parse JSON → %blocked_apps
   
A3: For Each App en %blocked_apps
   
A4:   App → Kill App: %app_name
   
A5:   Si usuario intenta abrir: Mostrar Toast "App bloqueada"
   
A6: End For
   
A7: Wait 10 segundos
   
A8: Goto A1 (Loop infinito)
```

### Bloquear Sitios Web (Requiere root o DNS)

```
A1: Get HTTP Response de sitios bloqueados
   
A2: For Each Sitio
   
A3:   Shell (Root):
      iptables -A OUTPUT -d %sitio -j REJECT
      
A4: End For
```

---

## 🎤 AutoVoice Configuración

### Continuous Mode
```
Enabled: Yes
Timeout: 10 segundos después de "ARGOS"
Language: Spanish (Colombia) - es-CO
```

### Comandos Reconocidos
```
"ARGOS *" → Enviar todo a backend
Backend procesa con LLM
Backend devuelve acción a ejecutar
```

---

## 📱 Permisos Necesarios en Android

```
✓ Acceso a notificaciones
✓ Overlay (dibujar sobre otras apps)
✓ Acceso a ubicación
✓ Leer/Escribir almacenamiento externo
✓ Control de medios
✓ Acceso a cámara
✓ Internet
```

---

## 🔄 Webhook AutoRemote

### Configuración
```
1. Instalar AutoRemote
2. Obtener URL de AutoRemote (ej: https://autoremotejoaomgcd.appspot.com/sendmessage?key=TU_KEY)
3. Registrar en ARGOS:

POST /api/v1/webhooks/registrar
{
  "nombre": "tasker_autoremote",
  "url": "https://autoremotejoaomgcd.appspot.com/sendmessage?key=TU_KEY",
  "evento": "notificacion_voz"
}
```

### Recibir en Tasker
```
Perfil: AutoRemote → Message Filter: notificacion_voz

Tarea:
A1: Say
   Text: %arcomm
```

---

## 🧪 Testing

### Test 1: Comando de Voz
```
1. Di: "ARGOS reproduce música"
2. Tasker debe:
   - Enviar HTTP POST a /api/v1/music/play
   - Ejecutar Media Control: Play
   - Decir "Música reproduciendo"
```

### Test 2: Notificación WhatsApp
```
1. Recibe mensaje en WhatsApp
2. Tasker debe:
   - Capturar notificación
   - Enviar a ARGOS
   - Recibir voice_message
   - Decir en voz alta: "Tienes un mensaje de Juan Pérez en WhatsApp"
```

### Test 3: Bloqueo Innegable
```
1. Di: "ARGOS bloquea Instagram por 2 horas"
2. Tasker debe:
   - Enviar a /api/v1/app-blocker/activate
   - Iniciar loop de bloqueo cada 10 segundos
   - Matar app si se intenta abrir
   - Continuar por 2 horas
```

---

## 🆘 Troubleshooting

### ❌ "No se puede conectar al servidor"
```
- Verificar %ARGOS_URL está correcto
- Verificar conexión a internet
- Verificar servidor está corriendo
```

### ❌ "Comando de voz no reconocido"
```
- Verificar AutoVoice tiene permiso de micrófono
- Verificar idioma es es-CO
- Verificar "ARGOS" se dice claramente
```

### ❌ "Bloqueo no funciona"
```
- Verificar Tasker tiene permiso Overlay
- Verificar loop de bloqueo está corriendo
- Verificar endpoint devuelve apps bloqueadas
```

---

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs de Tasker (Menú → Run Log)
2. Revisar respuesta HTTP (%http_response_code)
3. Consultar documentación completa en `DOCUMENTACION_COMPLETA.md`

---

**Versión**: 1.0  
**Compatible con**: Tasker 6.x, AutoVoice 3.x  
**Última actualización**: 2026-04-08
