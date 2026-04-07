# Guía Instalación Tasker para ARGOS (Fase 1)

## Paso 1: Instalación de Apps

### 1.1 Tasker
1. Descargar desde [Play Store](https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm)
2. Abrir Tasker
3. Aceptar términos
4. Ir a **Preferences** → **Tasker** → Marcar:
   - ☑ Run in foreground
   - ☑ Accessibility Service
   - ☑ Device Admin (para bloqueos)

### 1.2 AutoRemote
1. Descargar desde [Play Store](https://play.google.com/store/apps/details?id=com.joaomgcd.autoremote)
2. Abrir AutoRemote
3. Ir a **More** → **Device Registration**
4. **Anotar tu Device ID** (ejemplo: `15d3c4f987a2b`)
5. Ir a **More** → **Personal URL** → Copiar tu Secret

### 1.3 eSound (Reproductor Música)
- Descargar desde [Play Store](https://play.google.com/store/apps/details?id=com.eSoundapps.music)

### 1.4 Pure Tuber (Alternativa YouTube Music)
- Descargar desde [GitHub](https://github.com/msuleman2099/PureTuber) o [APK Mirror](https://www.apkmirror.com)

---

## Paso 2: Configuración AutoRemote

### 2.1 Obtener Webhook URL Completa

1. Device ID (de AutoRemote): `15d3c4f987a2b`
2. Secret (de AutoRemote): `mySecret123`
3. URL final:

```
https://autoremote.rm.net/sendmessage?secretOrPassword=mySecret123&to=15d3c4f987a2b&message=%s
```

### 2.2 Guardar en Backend

En tu archivo `.env` del backend:

```bash
TASKER_WEBHOOK_URL="https://autoremote.rm.net/sendmessage?secretOrPassword=mySecret123&to=15d3c4f987a2b&message=%s"
```

---

## Paso 3: Crear Profile #1 - Recibir Órdenes del Backend

### 3.1 Crear Profile en Tasker

1. En Tasker, ir a **Profiles tab** (esquina inferior izquierda)
2. Click en **+** (crear nuevo profile)
3. Seleccionar **Event** → **Plugin** → **AutoRemote**
4. Click en el símbolo de configuración (⚙️)
5. En **"Filter"** ingresar: `bloqueo`
6. Click ✓ para guardar el filtro
7. Click ✓ para crear el profile

**Nombre del Profile**: `[E] Recibir Orden Bloqueo`

### 3.2 Enlazar Task al Profile

Se abrirá un popup pidiendo crear una Task. Click **NewTask+**

Tarea: `Procesar_Bloqueo`

---

## Paso 4: Crear Task #1 - Bloquear Apps (Instagram, TikTok, YouTube)

### 4.1 Crear Task en Tasker

1. Ir a **Tasks tab**
2. Click en **+**
3. Nombre: `Bloquear_Apps`

### 4.2 Agregar Acciones

**Acción 1**: Display Toast (confirmación visual)
- Click en **+**
- Seleccionar **Alert** → **Notify**
- Título: `ARGOS - Bloqueo Activado`
- Texto: `Instagram, TikTok, YouTube bloqueados`

**Acción 2**: Activar Device Admin
- Click en **+**
- Seleccionar **System** → **Device Admin On** (si está disponible)
- Alternativamente, usar **Launch App** para abrir Settings y activar manual

**Acción 3**: Variable de Estado (rastrear bloqueo)
- Click en **+**
- Seleccionar **Variable** → **Variable Set**
- Variable: `%ARGOS_BLOQUEADO`
- Value: `1`

**Acción 4**: TTS (Reproducir por Voz)
- Click en **+**
- Seleccionar **Alert** → **Say**
- Text: `Instagram, TikTok y YouTube bloqueados. Ahora a trabajar.`
- Stream: Voice Call (para que se escuche en volumen de llamada)

### 4.3 Guardar Task

Click ✓ en la esquina superior derecha.

---

## Paso 5: Crear Task #2 - Desbloquear Apps

### 5.1 Crear Nueva Task

1. Ir a **Tasks tab**
2. Click en **+**
3. Nombre: `Desbloquear_Apps`

### 5.2 Agregar Acciones

**Acción 1**: Desactivar Device Admin
- Click en **+**
- Seleccionar **System** → **Device Admin Off**

**Acción 2**: Actualizar Variable de Estado
- Click en **+**
- Seleccionar **Variable** → **Variable Set**
- Variable: `%ARGOS_BLOQUEADO`
- Value: `0`

**Acción 3**: TTS
- Click en **+**
- Seleccionar **Alert** → **Say**
- Text: `Desbloqueo completado. ¡Buen descanso!`

### 5.3 Guardar Task

Click ✓

---

## Paso 6: Crear Task #3 - Reproducir Música desde SD

### 6.1 Crear Nueva Task

1. Ir a **Tasks tab**
2. Click en **+**
3. Nombre: `Reproducir_Musica`

### 6.2 Agregar Acciones

**Acción 1**: Listar Archivos de Música
- Click en **+**
- Seleccionar **File** → **List Files**
- Path: `/Music` (o tu carpeta de música)
- Recursive: ON (para subcarpetas)
- Match: `*.mp3` (solo archivos MP3)

**Acción 2**: Seleccionar Canción Aleatoria
- Click en **+**
- Seleccionar **Variable** → **Variable Randomize**
- Variable: `%MUSICA_LISTA`

**Acción 3**: Lanzar eSound con Canción
- Click en **+**
- Seleccionar **App** → **Launch App**
- App: `eSound` (o Pure Tuber)
- Intent extras (opcional): Pasar ruta de archivo

**Acción 4**: TTS Confirmación
- Click en **+**
- Seleccionar **Alert** → **Say**
- Text: `Reproduciendo música desde tu SD`

### 6.3 Guardar Task

Click ✓

---

## Paso 7: Crear Task #4 - Procesar Mensaje de Chat (TTS)

### 7.1 Crear Nueva Task

1. Ir a **Tasks tab**
2. Click en **+**
3. Nombre: `TTS_Notificacion`

### 7.2 Agregar Acciones

**Acción 1**: Extraer Info del Webhook
- Click en **+**
- Seleccionar **Variable** → **Variable Set**
- Variable: `%REMITENTE`
- Value: `%evtprm1` (parámetro del webhook)

**Acción 2**: Reproducir TTS
- Click en **+**
- Seleccionar **Alert** → **Say**
- Text: `Tienes un mensaje de %REMITENTE`
- Stream: Voice Call

### 7.3 Guardar Task

Click ✓

---

## Paso 8: Test - Enviar Orden desde Backend

### 8.1 Desde Terminal (curl)

```bash
# Reemplazar con tu webhook URL
curl -X POST "https://autoremote.rm.net/sendmessage?secretOrPassword=mySecret123&to=15d3c4f987a2b&message=bloqueo" \
  -H "Content-Type: application/json"
```

### 8.2 Desde Backend (si está corriendo)

```bash
# Hacer petición a tu backend
curl -X POST http://localhost:3000/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android"],
    "duracion": 3600
  }'
```

### 8.3 Verificar Tasker

1. En Tasker, ir a **Log** (📋)
2. Buscar `Recibir Orden Bloqueo` profile
3. Si la orden llegó, verás el evento registrado
4. Tasker debe ejecutar `Bloquear_Apps` automáticamente

---

## Solución de Problemas

### Tasker no recibe órdenes

✅ **Soluciones**:
1. Verificar que AutoRemote está abierto y registrado
2. Comprobar que el Device ID y Secret son correctos
3. Revisar que el profile tiene el filtro `bloqueo` correcto
4. En Tasker, ir a **More Settings** → Marcar:
   - ☑ Profile debugging
   - ☑ Log improperly formed tasks

### TTS no se escucha

✅ **Soluciones**:
1. Ir a **Settings** → **Sound** → Volumen de `Voice Call` debe estar encendido
2. En Tasker, action **Say** → cambiar Stream a `Music`
3. Comprobar que Tasker tiene permiso de Accessibility

### Device Admin no se activa

✅ **Soluciones**:
1. Ir a **Settings** → **Apps** → **Special app access** → **Device admin apps**
2. Buscar Tasker y activar permiso
3. En Tasker, usar alternativa: **Launch App** → **Settings** (abre pantalla de bloqueo manual)

---

## Próximos Pasos

1. ✅ Tasker configurado
2. 🔄 Backend en Render/Railway (próximo paso)
3. 🎯 Conectar webhook Backend ↔ Tasker
4. 🚀 Test end-to-end

---

**Última actualización**: Abril 2026
