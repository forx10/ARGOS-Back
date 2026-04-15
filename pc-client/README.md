# 🛡️ ARGOS PC Client

Script que conecta tu PC con ARGOS para recibir comandos desde tu teléfono.

## Instalación Rápida

### Windows
1. Descarga esta carpeta `pc-client/`
2. Doble click en `instalar_windows.bat`
3. Edita `argos_pc_client.py` (cambia USUARIO_ID y PC_NOMBRE)
4. Ejecuta: `python argos_pc_client.py`

### Mac / Linux
1. Descarga esta carpeta `pc-client/`
2. Ejecuta: `bash instalar_mac_linux.sh`
3. Edita `argos_pc_client.py` (cambia USUARIO_ID y PC_NOMBRE)
4. Ejecuta: `python3 argos_pc_client.py`

## Configuración

Edita estas líneas en `argos_pc_client.py`:

```python
BACKEND_URL = "https://argos-back-scn5.onrender.com"  # Tu backend
USUARIO_ID = "usuario_1"                               # Tu ID
PC_NOMBRE = "Mi PC"                                     # Nombre de tu PC
```

## Comandos disponibles

Desde tu teléfono puedes decir:

| Comando de voz | Acción en PC |
|---|---|
| "Abre mis sitios" | Abre todos los sitios guardados |
| "Abre mis sitios de trabajo" | Abre solo los de categoría trabajo |
| "Abre Chrome" | Abre Google Chrome |
| "Abre VS Code" | Abre Visual Studio Code |
| "Cierra todo" | Cierra todos los navegadores |

## Auto-inicio (Windows)

Para que el script arranque con Windows:
1. Presiona `Win + R`
2. Escribe `shell:startup`
3. Crea un acceso directo de `argos_pc_client.py` ahí

## Auto-inicio (Mac)

Agrega a `~/.zshrc`:
```bash
python3 /ruta/a/argos_pc_client.py &
```

## Auto-inicio (Linux)

Crea un servicio systemd o agrega a crontab:
```bash
@reboot python3 /ruta/a/argos_pc_client.py
```
