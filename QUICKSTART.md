# 🚀 ARGOS Fase 1 - Quickstart

## Lo que tenemos listos

✅ **Backend NestJS completamente funcional** (Turnos, Bloqueos, Webhooks)  
✅ **PostgreSQL configurado**  
✅ **API REST con 10+ endpoints**  
✅ **Swagger docs** en `/api-docs`  
✅ **Documentación completa** (Arquitectura, Tasker, API Spec, Casos de uso)  
✅ **Configuración para Render.com & Railway.app**  
✅ **Git repository listo para GitHub**  

---

## 3 Pasos para Empezar

### Paso 1: Conectar a GitHub

```bash
cd /home/ubuntu/argos_backend

# Crear repo en GitHub: https://github.com/new
# Nombre: "argos" (o "argos_backend")

# Conectar remoto (reemplazar con tus valores):
git remote add origin https://github.com/TU_USUARIO/argos.git

# Cambiar rama a main
git branch -M main

# Push inicial
git push -u origin main
```

✅ **Listo**: Repo en GitHub con historial completo

---

### Paso 2: Desplegar a Render.com

#### 2.1 Crear Cuenta en Render
- Ir a [https://render.com](https://render.com)
- Sign up (recomendado: GitHub OAuth)

#### 2.2 Crear Base de Datos PostgreSQL

1. Click en **New** → **PostgreSQL Database**
2. Nombre: `argos-db`
3. Plan: **Free** (suficiente para Fase 1)
4. Anotar la `DATABASE_URL` (ver en dashboard)

#### 2.3 Crear Web Service

1. Click en **New** → **Web Service**
2. Conectar con GitHub (autorizar si es necesario)
3. Seleccionar repo `argos`
4. Configuración:
   - **Build Command**: `cd nodejs_space && yarn install && yarn build`
   - **Start Command**: `cd nodejs_space && yarn start:prod`
   - **Plan**: Free

#### 2.4 Variables de Entorno en Render

En el Web Service, ir a **Environment**:

```
DATABASE_URL        = [Copiar de PostgreSQL DB]
TASKER_WEBHOOK_URL  = [Dejar en blanco por ahora]
NODE_ENV            = production
APP_ORIGIN          = https://tu-servicio.onrender.com/ (Render la llena automáticamente)
```

#### 2.5 Deploy

- Click en **Create Web Service**
- Esperar ~5 minutos a que compile y se despliegue
- URL pública: `https://tu-servicio.onrender.com`

✅ **Verificar que funciona**:
```bash
curl https://tu-servicio.onrender.com/api-docs
```

---

### Paso 3: Configurar Tasker

#### 3.1 Instalar Apps

- [Tasker](https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm)
- [AutoRemote](https://play.google.com/store/apps/details?id=com.joaomgcd.autoremote)
- [eSound](https://play.google.com/store/apps/details?id=com.eSoundapps.music) (opcional)

#### 3.2 Obtener Webhook URL

1. Abrir **AutoRemote**
2. Ir a: **More** → **Device Registration**
3. Anotar **Device ID** (ej: `15d3c4f987a2b`)
4. Ir a: **More** → **Personal URL**
5. Copiar **Secret** (ej: `mySecret123`)
6. Armar URL final:

```
https://autoremote.rm.net/sendmessage?secretOrPassword=mySecret123&to=15d3c4f987a2b&message=%s
```

#### 3.3 Actualizar Backend en Render

1. En Render dashboard del Web Service
2. Ir a **Environment**
3. Actualizar `TASKER_WEBHOOK_URL` con la URL de Paso 3.2
4. Click **Save**
5. Render redeploy automáticamente

#### 3.4 Setup Tasker (Primero: Permisos)

1. Abrir **Tasker**
2. **Preferences** → **Tasker**
3. Marcar:
   - ☑ Run in foreground
   - ☑ Accessibility Service
   - ☑ Device Admin (para bloqueos)
4. Aceptar todos los permisos

#### 3.5 Crear Profile #1: Recibir Órdenes

1. Ir a **Profiles** tab
2. Click **+**
3. Seleccionar **Event** → **Plugin** → **AutoRemote**
4. En filter: escribir `bloqueo`
5. Click **✓** para crear
6. Se abrirá popup para crear Task
7. Nombre: `Procesar_Bloqueo` y click **NewTask+**

#### 3.6 Crear Task: Bloquear Apps

1. En Tasks tab, crear nueva: `Bloquear_Apps`
2. Agregar acciones:
   ```
   + Alert > Notify: "Instagram bloqueado"
   + Variable > Variable Set: %ARGOS_BLOQUEADO = 1
   + Alert > Say: "Instagram, TikTok y YouTube bloqueados. Ahora a trabajar."
   ```
3. Click ✓

#### 3.7 Test Rápido

Desde tu PC:

```bash
curl -X POST https://tu-servicio.onrender.com/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "test_user",
    "appsBloquear": ["com.instagram.android"],
    "sitiosBloquear": [],
    "duracion": 300,
    "trigger": "comando_voz",
    "comandoVoz": "prueba"
  }'
```

**En Tasker**, deberías ver:
- Toast notification: "Orden recibida"
- TTS: "Instagram, TikTok y YouTube bloqueados..."
- `%ARGOS_BLOQUEADO` = 1

✅ **Success!**

---

## 🔌 Ejemplos de Uso

### A. Bloqueo por Comando de Voz

Desde Tasker (simulando Google Assistant):

```bash
curl -X POST https://tu-servicio.onrender.com/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android"],
    "duracion": 3600,
    "trigger": "comando_voz",
    "comandoVoz": "bloquea Instagram 1 hora"
  }'
```

### B. Bloqueo por Contexto (App Abierta)

Cuando Duolingo se abre:

```bash
curl -X POST https://tu-servicio.onrender.com/api/bloqueo \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "appsBloquear": ["com.instagram.android", "com.tiktok.android"],
    "duracion": 28800,
    "trigger": "contexto_estudio",
    "appTrigger": "com.duolingo.android"
  }'
```

### C. Ver Estado Completo

```bash
curl https://tu-servicio.onrender.com/api/estado/user123
```

### D. Desbloquear Manualmente

```bash
curl -X DELETE https://tu-servicio.onrender.com/api/bloqueo/1
```

---

## 📚 Documentación Disponible

| Documento | Propósito |
|-----------|----------|
| **README.md** | Overview general |
| **docs/ARQUITECTURA.md** | Diseño técnico completo |
| **docs/API_SPEC.md** | Especificación endpoints con ejemplos |
| **docs/TASKER_SETUP.md** | Guía paso a paso Tasker |
| **docs/CASOS_USO_FASE1.md** | 4 escenarios prácticos |
| **docs/GITHUB_SETUP.md** | Cómo conectar a GitHub |

---

## 💁 Troubleshooting Rápido

### Error: "Tasker no recibe órdenes"

✅ Soluciones:
1. Verificar `TASKER_WEBHOOK_URL` en Render
2. Confirmar Device ID y Secret son correctos
3. AutoRemote debe estar abierto en el teléfono
4. Revisar profile tiene filtro `bloqueo`

### Error: "PostgreSQL no conecta"

✅ Soluciones:
1. Verificar `DATABASE_URL` en Render
2. Esperar 30 segundos después de crear BD
3. Revisar logs en Render: **Logs** tab

### Error: "API responde 500"

✅ Soluciones:
1. Ver logs en Render dashboard
2. Verificar variables de entorno
3. Ejecutar localmente: `cd nodejs_space && yarn start:dev`

---

## 👀 Próximos Pasos

Fase 1 está completa. Próximas:

- [ ] Test end-to-end (voz → bloqueo)
- [ ] Mejorar Tasker profiles
- [ ] Agregar cronjób para turnos rotativos
- [ ] Fase 2: Web app React
- [ ] Fase 2: Control de música
- [ ] Fase 2: WhatsApp por voz

---

## 🔗 Links Últiles

- **Backend URL**: https://tu-servicio.onrender.com
- **API Docs**: https://tu-servicio.onrender.com/api-docs
- **GitHub Repo**: https://github.com/TU_USUARIO/argos
- **Render Dashboard**: https://dashboard.render.com

---

**Status**: 🏡 Ready for Fase 1 Testing  
**Última actualización**: Abril 2026
