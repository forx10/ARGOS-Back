# 📱 GUÍA COMPLETA: Configurar Tasker con ARGOS

**Backend URL:** `https://argos-back-scn5.onrender.com`  
**AUTOREMOTE_USER_KEY:** `VE7npB9e`

---

## 🚀 PASO 1: Instalar Apps Necesarias

1. **Tasker** - https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm
2. **AutoVoice** - https://play.google.com/store/apps/details?id=com.joaomgcd.autovoice
3. **AutoRemote** - https://play.google.com/store/apps/details?id=com.joaomgcd.autoremote

---

## 🔧 PASO 2: Configurar AutoRemote

1. Abre **AutoRemote** en tu celular
2. Inicia sesión con tu cuenta Google
3. Tu **AUTOREMOTE_USER_KEY** ya está vinculada en el backend: `VE7npB9e`
4. Ve a **Settings → Personal URL** y verifica que aparece tu KEY

**¿Cómo funciona la vinculación?**
El backend ya tiene tu KEY (`VE7npB9e`) configurada como variable de entorno `AUTOREMOTE_USER_KEY`. Cuando el backend necesita enviarte un mensaje (respuesta de voz, orden de bloqueo, etc.), envía una petición a:
```
https://autoremotejoaomgcd.appspot.com/sendmessage?key=VE7npB9e&message=...
```
AutoRemote en tu celular recibe ese mensaje y Tasker lo procesa.

---

## 🎤 PASO 3: Configurar AutoVoice

1. Abre **AutoVoice**
2. Habilita el **reconocimiento continuo** (Continuous Recognition)
3. Agrega la palabra clave: **"argos"** (o tu wake word personalizado)
4. Activar: **Google Assistant Integration** (opcional pero recomendado)

---

## 📝 PASO 4: Crear la Tarea "ARGOS_Peticion"

Esta es la tarea principal que envía tu comando de voz al backend.

### Creación manual paso a paso:

1. **Abre Tasker → Tasks → + → Nombre: `ARGOS_Peticion`**

2. **Acción 1: Variable Set**
   - Variables → Variable Set
   - Name: `%argos_comando`
   - To: `%avcomm`
   - _Esto captura lo que dijiste por voz_

3. **Acción 2: Flash**
   - Alert → Flash
   - Text: `🎯 Procesando: %argos_comando`
   - _Muestra un toast con tu comando_

4. **Acción 3: HTTP Request** ⭐ (LA MÁS IMPORTANTE)
   - Net → HTTP Request
   - **Method:** POST
   - **URL:** `https://argos-back-scn5.onrender.com/api/comando-voz/unificado`
   - **Headers:** `Content-Type: application/json`
   - **Body:**
     ```json
     {"usuarioId":"usuario_1","comando":"%avcomm"}
     ```
   - **Timeout:** 30 seconds

5. **Acción 4: Flash (resultado)**
   - Alert → Flash
   - Text: `Respuesta: %http_response_code`

---

## 🔊 PASO 5: Crear el Perfil "ARGOS_Voz" (AutoVoice)

1. **Tasker → Profiles → + → Event**
2. **Plugin → AutoVoice → Recognized**
3. En configuración de AutoVoice:
   - **Command Filter:** `argos` (o tu wake word)
   - **Exact Match:** NO (desmarcado)
   - **Regex:** NO
4. **Enlazar con tarea:** `ARGOS_Peticion`

**Resultado:** Cuando digas "Argos bloquea Instagram", AutoVoice captura todo el texto en `%avcomm` y dispara la tarea.

---

## 📩 PASO 6: Crear el Perfil "ARGOS_Receptor" (AutoRemote)

Este perfil recibe las respuestas del backend y las dice en voz alta.

1. **Tasker → Profiles → + → Event**
2. **Plugin → AutoRemote → Message Received**
3. En configuración:
   - **Message Filter:** `argos_hablar`
4. **Crear tarea enlazada: `ARGOS_Hablar`**

### Tarea ARGOS_Hablar:

1. **Acción 1: Variable Split**
   - Variables → Variable Split
   - Name: `%armessage`
   - Splitter: `=:=`
   - _Separa: argos_hablar / genero / texto_

2. **Acción 2: Say**
   - Alert → Say
   - Text: `%armessage3`
   - Engine: Google TTS
   - Language: `es-MX` (o `es-ES`)
   - Stream: Music
   - _Esto habla la respuesta en voz alta_

---

## 🔒 PASO 7: Crear el Perfil "ARGOS_Ejecutar_Bloqueo" (Opcional)

1. **Tasker → Profiles → + → Event**
2. **Plugin → AutoRemote → Message Received**
3. **Message Filter:** `argos_bloquear`
4. **Crear tarea enlazada: `ARGOS_Ejecutar_Bloqueo`**

### Tarea:
1. **Flash:** `🛑 Activando bloqueo...`
2. **Notification:** Crear notificación persistente
3. **(Avanzado):** Usar App Usage Access para cerrar apps bloqueadas

---

## 🎨 FORMATOS DE COMANDOS DE VOZ

Di estos comandos precedidos por tu wake word (por defecto: "Argos"):

### 🔒 Bloqueo de Apps
```
"Argos bloquea Instagram por 2 horas"
"Argos bloquea TikTok y YouTube"
"Argos bloquea redes sociales"
"Argos bloquea pornografía"
"Argos desbloquea todo"
```

### 💻 Comandos de PC
```
"Argos vamos a la PC y abre mis sitios de trabajo"
"Argos abre Chrome en la PC"
"Argos abre todos mis sitios en la computadora"
"Argos cierra todo en la PC"
"Argos abre VS Code"
```

### ⏰ Alarmas y Recordatorios
```
"Argos recuerda que tengo cita a las 3"
"Argos alarma a las 7 de la mañana"
"Argos recuerdame comprar leche"
```

### ✅ Tareas
```
"Argos agrega tarea hacer ejercicio prioridad alta"
"Argos mis tareas pendientes"
"Argos completa la tarea de ejercicio"
```

### 🎧 Música
```
"Argos pon música"
"Argos siguiente canción"
"Argos pausa"
```

### 🎯 Modo Enfoque
```
"Argos modo enfoque 2 horas para estudiar"
"Argos voy a estudiar por 1 hora"
```

### 🌍 Estado
```
"Argos cuál es mi estado"
"Argos qué tengo bloqueado"
```

### 🚀 SOS/Emergencia
```
"Argos emergencia"
"Argos SOS"
```

### 🎭 Cambiar Personalidad
```
"Argos cámbiate el nombre a Jarvis"
"Argos quiero voz de mujer"
"Argos sé más amigable"
```

### 💬 Conversación General
```
"Argos cómo está el clima"
"Argos cuéntame un chiste"
"Argos qué día es hoy"
```

---

## 🔗 CÓMO FUNCIONA LA VINCULACIÓN AUTOREMOTE ↔ BACKEND

### Flujo completo:
```
📱 Tú dices: "Argos bloquea Instagram"
    ↓
🎤 AutoVoice captura texto → %avcomm = "argos bloquea Instagram"
    ↓
📝 Tasker ejecuta ARGOS_Peticion:
    POST https://argos-back-scn5.onrender.com/api/comando-voz/unificado
    Body: {"usuarioId":"usuario_1","comando":"argos bloquea Instagram"}
    ↓
🤖 Backend ARGOS:
    1. Detecta wake word "argos" y lo limpia
    2. LLM clasifica: categoría="bloqueo", app="com.instagram.android"
    3. Crea bloqueo en BD
    4. Envía a AutoRemote:
       GET https://autoremotejoaomgcd.appspot.com/sendmessage
           ?key=VE7npB9e
           &message=argos_hablar=:=hombre=:=Listo Luis, Instagram bloqueado por 1 hora
    5. Envía a AutoRemote:
       &message=argos_bloquear=:={"apps":["com.instagram.android"],"duracion":3600}
    ↓
📱 AutoRemote recibe "argos_hablar=:=hombre=:=Listo Luis..."
    ↓
🔊 Tasker perfil ARGOS_Receptor dispara ARGOS_Hablar:
    - Split por "=:=" → parte3 = "Listo Luis, Instagram bloqueado por 1 hora"
    - Say (TTS): "Listo Luis, Instagram bloqueado por 1 hora"
    ↓
📱 AutoRemote recibe "argos_bloquear=:={...}"
    ↓
🔒 Tasker perfil ARGOS_Ejecutar_Bloqueo dispara ARGOS_Ejecutar_Bloqueo:
    - Activa bloqueo real de Instagram
```

---

## 🎯 CONFIGURACIÓN INICIAL (Onboarding)

La primera vez, configura tu perfil:

```bash
curl -X POST https://argos-back-scn5.onrender.com/api/v1/profile/setup \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "usuario_1",
    "nombreUsuario": "TU_NOMBRE",
    "nombreAsistente": "Jarvis",
    "generoVoz": "hombre",
    "personalidad": "amigable"
  }'
```

Después de esto, puedes cambiar la configuración por voz:
- "Argos cámbiate el nombre a Friday"
- "Argos quiero voz de mujer"

---

## ❓ TROUBLESHOOTING

| Problema | Solución |
|---|---|
| "No pasa nada cuando hablo" | Verifica que AutoVoice esté activo con reconocimiento continuo |
| "Timeout en la petición" | Render puede tardar ~30seg en despertar (plan free). Intenta de nuevo. |
| "No habla la respuesta" | Verifica que Google TTS esté instalado. Settings → Accessibility → TTS |
| "AutoRemote no recibe" | Revisa que la KEY sea correcta. Abre AutoRemote y verifica tu Personal URL |
| "El comando no se entiende" | Habla claro y usa los formatos de la sección anterior |

---

## 📊 API COMPLETA

Toda la documentación de endpoints:
**https://argos-back-scn5.onrender.com/api-docs**
