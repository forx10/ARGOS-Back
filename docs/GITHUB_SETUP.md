# Conectar ARGOS a GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ir a [github.com/new](https://github.com/new)
2. Nombre del repo: `argos` (o `argos_backend`)
3. Descripción: `Sistema de asistencia personal inteligente con NestJS + Tasker`
4. Visibilidad: **Private** (recomendado para credenciales) o **Public**
5. **NO** inicializar con README (ya lo tenemos)
6. Click en **Create repository**

---

## Paso 2: Conectar Remote Local → GitHub

En tu terminal, desde `/home/ubuntu/argos_backend`:

```bash
# Reemplazar <TU_USUARIO> y <TU_REPO> con tus valores
git remote add origin https://github.com/<TU_USUARIO>/<TU_REPO>.git

# Ejemplo:
git remote add origin https://github.com/juan-perez/argos.git
```

---

## Paso 3: Verificar Remote

```bash
git remote -v
```

Deberías ver:
```
origin  https://github.com/<TU_USUARIO>/<TU_REPO>.git (fetch)
origin  https://github.com/<TU_USUARIO>/<TU_REPO>.git (push)
```

---

## Paso 4: Push a GitHub

```bash
# Cambiar rama a main (GitHub usa main por defecto)
git branch -M main

# Hacer push
git push -u origin main
```

Si pide autenticación:

### Opción A: GitHub CLI (Recomendado)
```bash
git config --global credential.helper store
git push -u origin main
# Te pedirá user + pass (usar GitHub token en lugar de contraseña)
```

### Opción B: SSH (Más seguro)

1. Generar clave SSH:
```bash
ssh-keygen -t ed25519 -C "tu_email@example.com"
```

2. Agregar a GitHub:
   - Settings → SSH and GPG keys → New SSH key
   - Pegar contenido de `~/.ssh/id_ed25519.pub`

3. Cambiar remote URL:
```bash
git remote set-url origin git@github.com:<TU_USUARIO>/<TU_REPO>.git
git push -u origin main
```

---

## Paso 5: Configurar .env.example (Credenciales Seguras)

⚠️ **NUNCA** hacer push de `.env` a GitHub

Ya está en `.gitignore`, pero verificar:

```bash
cat .gitignore | grep ".env"
```

Debería mostrar:
```
.env
.env.local
.env.*.local
```

---

## Paso 6: Usar en Render.com

Una vez en GitHub, Render puede desplegar automáticamente:

1. En Render.com, click en **New** → **Web Service**
2. Conectar con GitHub (autorizar)
3. Seleccionar repo `argos`
4. Build & Deploy automático

---

## Paso 7: Pulls Futuros

Para traer cambios del repositorio remoto:

```bash
git pull origin main
```

Para hacer cambios locales y subirlos:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

---

## Troubleshooting

### Error: "origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/<TU_USUARIO>/<TU_REPO>.git
```

### Error: "Permission denied"

Verificar SSH key o usar HTTPS con token:

```bash
# Generar token en GitHub:
# Settings → Developer settings → Personal access tokens → Generate new token
# Scopes: repo (completo), workflow

git config --global credential.helper store
git push origin main
# Ingresar username + token (no contraseña)
```

---

**Listo. Tu repo está en GitHub 🇦🇸**
