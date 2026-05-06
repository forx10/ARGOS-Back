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

---

## 🎤 PASO 3: Configurar AutoVoice

1. Abre **AutoVoice**
2. Habilita el **reconocimiento continuo** (Continuous Recognition)
3. Agrega la palabra clave: **"jarvis"** (o tu wake word personalizado)
4. Activar: **Google Assistant Integration** (opcional pero recomendado)

---

## 📝 PASO 4: Crear la Tarea "ARGOS_Peticion"

Esta tarea envía tu comando de voz al backend.

### Creación paso a paso:

1. **Abre Tasker → Tasks → + → Nombre: `ARGOS_Peticion`**

2. **Acción 1: Flash** (muestra lo que dijiste)
   - Alert → Flash
   - Text: `🎯 Procesando: %avcomm`

3. **Acción 2: HTTP Request** ⭐ (LA MÁS IMPORTANTE)
   - Net → HTTP Request
   - **Method:** POST
   - **URL:** `https://argos-back-scn5.onrender.com/api/comando-voz/unificado`
   - **Headers:** `Content-Type: application/json`
   - **Body:**
     ```json
     {"usuarioId":"usuario_1","comando":"%avcomm"}
     ```
   - **Timeout:** 30 seconds

4. **Acción 3: Flash** (resultado)
   - Alert → Flash
   - Text: `Respuesta: %http_response_code`

---

## 🎤 PASO 5: Crear el Perfil "ARGOS_Voz" (AutoVoice)

Este perfil detecta cuando dices el wake word.

1. **Tasker → Profiles → + → Event**
2. **Plugin → AutoVoice → Recognized**
3. En configuración de AutoVoice:
   - **Command Filter:** `jarvis` (o tu wake word)
   - **Exact Match:** NO (desmarcado)
   - **Regex:** NO
4. **Enlazar con tarea:** `ARGOS_Peticion`

**Resultado:** Cuando digas "Jarvis bloquea Instagram", AutoVoice captura todo el texto en `%avcomm` y dispara la tarea.

---

## 🔊 PASO 6: Crear el Perfil "ARGOS_Audio" (Reproductor de voz)

❗❗ **ESTE ES EL PASO MÁS IMPORTANTE** ❗❗

ARGOS genera audio MP3 con voces neurales de alta calidad (Edge TTS) en el servidor y envía la URL al teléfono. **Ya NO usa Google TTS local.**

### Perfil: Receptor de Audio

1. **Tasker → Profiles → + → Event**
2. **Plugin → AutoRemote → Message Received**
3. En configuración:
   - **Message Filter:** `argos_audio`
4. **Crear tarea enlazada: `ARGOS_Reproducir_Audio`**

### Tarea ARGOS_Reproducir_Audio:

1. **Acción 1: Variable Split**
   - Variables → Variable Split
   - Name: `%arcomm`
   - Splitter: `=:=`
   - _Resultado: %arcomm1=argos_audio, %arcomm2=URL_DEL_MP3, %arcomm3=texto_subtitulo_

2. **Acción 2: Flash** (subtitulo visual)
   - Alert → Flash
   - Text: `🤖 %arcomm3`
   - _Muestra el texto mientras suena el audio_

3. **Acción 3: Music Play** ⭐
   - Media → Music Play
   - **File:** `%arcomm2`
   - **Stream:** Music
   - **Loop:** OFF
   - _Esto reproduce el MP3 generado por el servidor_

> ⚠️ **NOTA:** Si "Music Play" no reproduce URLs directamente, usa esta alternativa:

### Alternativa con Media Play File:

3. **Acción 3 (alternativa): HTTP Request** (descargar audio)
   - Net → HTTP Request
   - **Method:** GET
   - **URL:** `%arcomm2`
   - **Output File:** `/sdcard/Tasker/argos_respuesta.mp3`

4. **Acción 4: Media Play File**
   - Media → Media Play File
   - **File:** `/sdcard/Tasker/argos_respuesta.mp3`
   - **Stream:** Music

---

## 📩 PASO 7: Crear Perfil "ARGOS_Hablar_Fallback" (Backup TTS)

Si el servidor no puede generar audio, envía texto para TTS local como backup.

1. **Tasker → Profiles → + → Event**
2. **Plugin → AutoRemote → Message Received**
3. **Message Filter:** `argos_hablar`
4. **Crear tarea enlazada: `ARGOS_Hablar_Fallback`**

### Tarea ARGOS_Hablar_Fallback:

1. **Acción 1: Variable Split**
   - Name: `%arcomm`
   - Splitter: `=:=`

2. **Acción 2: Say**
   - Alert → Say
   - Text: `%arcomm3`
   - Engine: Google TTS
   - Language: `es-CO` (o `es-MX`)
   - Stream: Music

> ⚠️ Para este fallback sí necesitas Google TTS instalado. Pero normalmente NO se usará.

---

## 🔒 PASO 8: Perfil "ARGOS_Bloqueo" (Opcional)

1. **Tasker → Profiles → + → Event**
2. **Plugin → AutoRemote → Message Received**
3. **Message Filter:** `argos_bloquear`
4. **Crear tarea enlazada: `ARGOS_Ejecutar_Bloqueo`**

### Tarea:
1. **Flash:** `🛑 Activando bloqueo...`
2. **Notification:** Crear notificación persistente
3. **(Avanzado):** Usar App Usage Access para cerrar apps bloqueadas

---

## 🎨 CONFIGURACIÓN INICIAL (Onboarding)

La primera vez, configura tu perfil. Puedes hacerlo por **curl** o directamente por **voz** una vez que Tasker esté configurado.

### Opción A: Por curl (desde terminal)

```bash
curl -X POST https://argos-back-scn5.onrender.com/api/v1/profile/setup \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "usuario_1",
    "nombreUsuario": "TU_NOMBRE",
    "nombreAsistente": "Jarvis",
    "generoVoz": "hombre",
    "vozId": "jarvis",
    "personalidad": "amigable"
  }'
```

### Voces disponibles para `vozId`:

| vozId | Género | Acento | Descripción |
|---|---|---|---|
| **jarvis** ⭐ | Hombre | 🇨🇴 Colombiano | Grave y calmada estilo JARVIS |
| gonzalo | Hombre | 🇨🇴 Colombiano | Natural |
| alvaro | Hombre | 🇪🇸 Español | Grave |
| jorge | Hombre | 🇲🇽 Mexicano | Natural |
| salome | Mujer | 🇨🇴 Colombiana | Natural |
| elvira | Mujer | 🇪🇸 Española | Natural |
| dalia | Mujer | 🇲🇽 Mexicana | Natural |

### Opción B: Por voz (después de configurar Tasker)
- "Jarvis cámbiate la voz a Elvira"
- "Jarvis quiero voz de mujer"
- "Jarvis usa la voz mexicana"

---

## 💻 PASO 9: Configurar el Cliente de PC

### Requisitos:
- Python 3.8+
- pip (gestor de paquetes)

### Instalación:

**Windows:**
```bash
cd pc-client
pip install -r requirements.txt
python argos_pc_client.py
```

**Mac/Linux:**
```bash
cd pc-client
pip3 install -r requirements.txt
python3 argos_pc_client.py
```

### Qué hace el cliente:
1. Se registra en el backend con un ID único
2. Hace ping cada 2 minutos (para saber que está activa)
3. Consulta comandos pendientes cada 5 segundos
4. Ejecuta los comandos:
   - Abrir sitios web habituales
   - Abrir aplicaciones (Chrome, VS Code, Spotify, etc.)
   - Apagar/reiniciar/suspender/bloquear PC
   - Buscar en Google, YouTube, Wikipedia, etc.
   - Interactuar con páginas web (Selenium)

### Configuración del cliente:
Edita las variables al inicio de `argos_pc_client.py`:
```python
BACKEND_URL = "https://argos-back-scn5.onrender.com"
USUARIO_ID = "usuario_1"
PC_NOMBRE = "Mi PC"
```

### Para Selenium (interacción web avanzada):
```bash
pip install selenium webdriver-manager
```

---

## 📞 CÓMO FUNCIONA EL FLUJO COMPLETO

```
📱 Tú dices: "Jarvis bloquea Instagram"
    ↓
🎤 AutoVoice captura texto → %avcomm = "jarvis bloquea Instagram"
    ↓
📝 Tasker ejecuta ARGOS_Peticion:
    POST https://argos-back-scn5.onrender.com/api/comando-voz/unificado
    Body: {"usuarioId":"usuario_1","comando":"jarvis bloquea Instagram"}
    ↓
🤖 Backend ARGOS:
    1. Detecta wake word "jarvis" y lo limpia
    2. LLM clasifica: categoría="bloqueo", app="com.instagram.android"
    3. Crea bloqueo en BD
    4. Genera audio MP3 con voz JARVIS (Edge TTS)
    5. Envía a AutoRemote:
       argos_audio=:=https://.../api/tts/audio/UUID=:=Listo Luis, Instagram bloqueado
    ↓
📱 AutoRemote recibe "argos_audio=:=URL=:=texto"
    ↓
🔊 Tasker perfil ARGOS_Audio dispara ARGOS_Reproducir_Audio:
    - Split por "=:=" → %arcomm2 = URL del MP3
    - Music Play: reproduce el MP3 (voz JARVIS alta calidad)
    ↓
🎧 Escuchas la voz de JARVIS respondiendo con acento colombiano grave
```

### Flujo para comandos de PC:
```
📱 Tú dices: "Jarvis abre Chrome en la PC"
    ↓
🤖 Backend clasifica: categoría="pc", comando="abrir_app", app="Chrome"
    ↓
💻 Guarda comando pendiente en BD
    ↓
💻 PC Client (polling cada 5seg) detecta comando nuevo
    ↓
💻 PC ejecuta: subprocess.Popen(["chrome.exe"])
    ↓
💻 PC reporta resultado al backend
    ↓
🔊 Backend genera audio: "Chrome abierto en tu computador"
```

---

## 🎨 FORMATOS DE COMANDOS DE VOZ

Di estos comandos precedidos por tu wake word:

### 🔒 Bloqueo de Apps
- "Jarvis bloquea Instagram por 2 horas"
- "Jarvis bloquea TikTok y YouTube"
- "Jarvis desbloquea todo"

### 💻 Comandos de PC
- "Jarvis abre Chrome en la PC"
- "Jarvis abre mis sitios de trabajo"
- "Jarvis apaga la computadora"
- "Jarvis reinicia la PC"
- "Jarvis busca música de lofi en YouTube"

### ⏰ Alarmas y Recordatorios
- "Jarvis recuerda que tengo cita a las 3"
- "Jarvis alarma a las 7 de la mañana"

### ✅ Tareas
- "Jarvis agrega tarea hacer ejercicio prioridad alta"
- "Jarvis mis tareas pendientes"

### 🎧 Música
- "Jarvis pon música"
- "Jarvis siguiente canción"

### 🎭 Cambiar Voz/Perfil
- "Jarvis cambia tu voz a Elvira"
- "Jarvis quiero voz de mujer"
- "Jarvis usa la voz mexicana de Jorge"

### 💬 Conversación General
- "Jarvis cómo está el clima"
- "Jarvis cuéntame un chiste"

---

## ❓ TROUBLESHOOTING

| Problema | Solución |
|---|---|
| "No pasa nada cuando hablo" | Verifica que AutoVoice esté activo con reconocimiento continuo |
| "Timeout en la petición" | Render puede tardar ~30seg en despertar (plan free). Intenta de nuevo. |
| "No se escucha el audio" | Verifica que Music Play use stream "Music" y volúmen esté alto |
| "Music Play no reproduce URLs" | Usa la alternativa: descargar MP3 + Media Play File |
| "AutoRemote no recibe" | Revisa que la KEY sea correcta en AutoRemote |
| "El comando no se entiende" | Habla claro y usa los formatos de la sección anterior |
| "PC no ejecuta comandos" | Verifica que el PC Client esté corriendo y conectado |

---

## 📊 API COMPLETA

Toda la documentación de endpoints:  
**https://argos-back-scn5.onrender.com/api-docs**
