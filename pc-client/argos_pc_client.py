#!/usr/bin/env python3
"""
ARGOS PC Client - Script que conecta tu PC con el backend ARGOS
Ejecuta este script en tu PC Windows/Mac/Linux para recibir comandos desde tu teléfono.

Uso: python argos_pc_client.py
"""

import requests
import webbrowser
import subprocess
import platform
import time
import json
import uuid
import os
import sys
from datetime import datetime

# ============================================
# CONFIGURACIÓN - EDITA ESTOS VALORES
# ============================================
BACKEND_URL = "https://argos-back-scn5.onrender.com"
USUARIO_ID = "usuario_1"
PC_NOMBRE = "Mi PC"                    # Nombre amigable de tu PC
INTERVALO_POLLING = 5                   # Segundos entre cada consulta
INTERVALO_PING = 120                    # Segundos entre cada ping (2 min)
# ============================================

# Generar ID único para esta PC (se guarda en archivo local)
PC_ID_FILE = os.path.join(os.path.expanduser("~"), ".argos_pc_id")

def get_or_create_pc_id():
    """Genera o lee el ID único de esta PC"""
    if os.path.exists(PC_ID_FILE):
        with open(PC_ID_FILE, "r") as f:
            return f.read().strip()
    pc_id = f"pc_{uuid.uuid4().hex[:8]}"
    with open(PC_ID_FILE, "w") as f:
        f.write(pc_id)
    return pc_id

def get_local_ip():
    """Obtiene la IP local de la PC"""
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "desconocida"

def log(msg, level="INFO"):
    """Log con timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    icons = {"INFO": "ℹ️", "OK": "✅", "ERROR": "❌", "CMD": "🎯", "WARN": "⚠️"}
    icon = icons.get(level, "📌")
    print(f"[{timestamp}] {icon} {msg}")

# ============================================
# EJECUTORES DE COMANDOS
# ============================================

def abrir_urls(urls_data):
    """Abre una lista de URLs en el navegador"""
    if not urls_data:
        log("No hay URLs para abrir", "WARN")
        return "No hay URLs configuradas"
    
    abiertos = []
    for item in urls_data:
        if isinstance(item, dict):
            nombre = item.get("nombre", "")
            url = item.get("url", "")
        else:
            nombre = str(item)
            url = str(item)
        
        if url:
            log(f"Abriendo: {nombre} → {url}", "CMD")
            webbrowser.open(url)
            abiertos.append(nombre)
            time.sleep(0.5)  # Pequeña pausa entre cada sitio
    
    return f"Sitios abiertos: {', '.join(abiertos)}"

def abrir_app(app_name):
    """Abre una aplicación del sistema"""
    sistema = platform.system()
    log(f"Abriendo app: {app_name} en {sistema}", "CMD")
    
    # Mapeo de nombres comunes a ejecutables
    apps_windows = {
        "code": "code",
        "vscode": "code",
        "visual studio code": "code",
        "chrome": "start chrome",
        "firefox": "start firefox",
        "edge": "start msedge",
        "notepad": "notepad",
        "bloc de notas": "notepad",
        "calculadora": "calc",
        "calculator": "calc",
        "explorador": "explorer",
        "terminal": "wt",
        "cmd": "cmd",
        "powershell": "powershell",
        "spotify": "start spotify:",
        "discord": "start discord:",
        "slack": "start slack:",
        "teams": "start msteams:",
        "word": "start winword",
        "excel": "start excel",
        "powerpoint": "start powerpnt",
    }
    
    apps_mac = {
        "code": "open -a 'Visual Studio Code'",
        "vscode": "open -a 'Visual Studio Code'",
        "chrome": "open -a 'Google Chrome'",
        "firefox": "open -a Firefox",
        "safari": "open -a Safari",
        "terminal": "open -a Terminal",
        "spotify": "open -a Spotify",
        "discord": "open -a Discord",
    }
    
    apps_linux = {
        "code": "code",
        "vscode": "code",
        "chrome": "google-chrome",
        "firefox": "firefox",
        "terminal": "gnome-terminal",
        "nautilus": "nautilus",
        "spotify": "spotify",
    }
    
    app_lower = app_name.lower()
    
    try:
        if sistema == "Windows":
            cmd = apps_windows.get(app_lower, f"start {app_name}")
            os.system(cmd)
        elif sistema == "Darwin":  # Mac
            cmd = apps_mac.get(app_lower, f"open -a '{app_name}'")
            os.system(cmd)
        else:  # Linux
            cmd = apps_linux.get(app_lower, app_name)
            subprocess.Popen([cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        return f"App '{app_name}' abierta"
    except Exception as e:
        return f"Error abriendo {app_name}: {str(e)}"

def escribir_texto(texto):
    """Escribe texto simulando teclado (necesita pyautogui)"""
    try:
        import pyautogui
        time.sleep(1)  # Esperar 1 segundo para que el usuario tenga el cursor listo
        pyautogui.typewrite(texto, interval=0.02) if texto.isascii() else pyautogui.write(texto)
        return f"Texto escrito: {texto[:50]}..."
    except ImportError:
        log("pyautogui no instalado. Ejecuta: pip install pyautogui", "ERROR")
        return "Error: pyautogui no instalado"
    except Exception as e:
        return f"Error escribiendo: {str(e)}"

def ejecutar_comando(comando):
    """Ejecuta un comando del sistema"""
    log(f"Ejecutando: {comando}", "CMD")
    try:
        result = subprocess.run(comando, shell=True, capture_output=True, text=True, timeout=30)
        return result.stdout[:500] if result.stdout else f"Código de salida: {result.returncode}"
    except subprocess.TimeoutExpired:
        return "Comando expiró (timeout 30s)"
    except Exception as e:
        return f"Error: {str(e)}"

def cerrar_todo():
    """Cierra todas las ventanas del navegador"""
    sistema = platform.system()
    try:
        if sistema == "Windows":
            os.system("taskkill /F /IM chrome.exe 2>nul")
            os.system("taskkill /F /IM msedge.exe 2>nul")
            os.system("taskkill /F /IM firefox.exe 2>nul")
        elif sistema == "Darwin":
            os.system("killall 'Google Chrome' 2>/dev/null")
            os.system("killall Safari 2>/dev/null")
            os.system("killall Firefox 2>/dev/null")
        else:
            os.system("killall chrome 2>/dev/null")
            os.system("killall firefox 2>/dev/null")
        return "Navegadores cerrados"
    except Exception as e:
        return f"Error: {str(e)}"

# ============================================
# PROCESADOR DE COMANDOS
# ============================================

def procesar_comando(comando):
    """Procesa un comando recibido del backend"""
    tipo = comando.get("tipo_comando", "")
    params = comando.get("parametros", {})
    cmd_id = comando.get("id")
    
    log(f"Procesando comando #{cmd_id}: {tipo}", "CMD")
    
    try:
        if tipo == "abrir_sitios":
            resultado = abrir_urls(params.get("urls", []))
            exito = True
            
        elif tipo == "abrir_sitios_categoria":
            resultado = abrir_urls(params.get("urls", []))
            exito = True
            
        elif tipo == "abrir_app":
            app = params.get("app", "")
            resultado = abrir_app(app)
            exito = True
            
        elif tipo == "escribir":
            texto = params.get("texto", "")
            resultado = escribir_texto(texto)
            exito = True
            
        elif tipo == "ejecutar":
            cmd = params.get("comando", "")
            resultado = ejecutar_comando(cmd)
            exito = True
            
        elif tipo == "cerrar_todo":
            resultado = cerrar_todo()
            exito = True
            
        else:
            resultado = f"Comando desconocido: {tipo}"
            exito = False
            log(resultado, "WARN")
    except Exception as e:
        resultado = f"Error ejecutando: {str(e)}"
        exito = False
        log(resultado, "ERROR")
    
    # Reportar resultado al backend
    reportar_resultado(cmd_id, resultado, exito)
    return resultado

def reportar_resultado(cmd_id, resultado, exito):
    """Envía el resultado de un comando al backend"""
    try:
        resp = requests.post(
            f"{BACKEND_URL}/api/v1/pc/commands/{cmd_id}/result",
            json={"resultado": resultado, "exito": exito},
            timeout=10
        )
        if resp.status_code == 201:
            log(f"Resultado reportado: {resultado[:80]}", "OK")
        else:
            log(f"Error reportando resultado: {resp.status_code}", "ERROR")
    except Exception as e:
        log(f"No se pudo reportar resultado: {e}", "ERROR")

# ============================================
# LOOP PRINCIPAL
# ============================================

def registrar_pc(pc_id):
    """Registra esta PC en el backend"""
    log(f"Registrando PC: {pc_id} ({PC_NOMBRE})")
    try:
        resp = requests.post(
            f"{BACKEND_URL}/api/v1/pc/register",
            json={
                "usuarioId": USUARIO_ID,
                "pcId": pc_id,
                "nombrePc": PC_NOMBRE,
                "sistemaOperativo": f"{platform.system()} {platform.release()}",
                "ipLocal": get_local_ip()
            },
            timeout=15
        )
        if resp.status_code == 201:
            log(f"PC registrada exitosamente", "OK")
            return True
        else:
            log(f"Error registrando: {resp.status_code} - {resp.text[:200]}", "ERROR")
            return False
    except requests.exceptions.ConnectionError:
        log("No se pudo conectar al backend. ¿Está corriendo?", "ERROR")
        return False
    except Exception as e:
        log(f"Error: {e}", "ERROR")
        return False

def enviar_ping(pc_id):
    """Envía ping para indicar que la PC está online"""
    try:
        requests.post(
            f"{BACKEND_URL}/api/v1/pc/ping",
            json={"pcId": pc_id, "ipLocal": get_local_ip()},
            timeout=10
        )
    except:
        pass

def consultar_comandos(pc_id):
    """Consulta si hay comandos pendientes"""
    try:
        resp = requests.get(
            f"{BACKEND_URL}/api/v1/pc/commands/{pc_id}/pending",
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("comandos", [])
        return []
    except requests.exceptions.ConnectionError:
        return []
    except Exception as e:
        log(f"Error consultando comandos: {e}", "ERROR")
        return []

def main():
    """Loop principal del cliente ARGOS para PC"""
    print("")
    print("═" * 55)
    print("  🛡️  ARGOS PC Client v1.0")
    print("═" * 55)
    print(f"  Backend:    {BACKEND_URL}")
    print(f"  Usuario:    {USUARIO_ID}")
    print(f"  PC Nombre:  {PC_NOMBRE}")
    print(f"  Sistema:    {platform.system()} {platform.release()}")
    print(f"  IP Local:   {get_local_ip()}")
    print("═" * 55)
    print("")
    
    pc_id = get_or_create_pc_id()
    log(f"PC ID: {pc_id}")
    
    # Registrar PC
    if not registrar_pc(pc_id):
        log("Reintentando en 10 segundos...", "WARN")
        time.sleep(10)
        if not registrar_pc(pc_id):
            log("No se pudo registrar. Verifica la URL del backend.", "ERROR")
            sys.exit(1)
    
    log("Escuchando comandos... (Ctrl+C para detener)")
    print("")
    
    ultimo_ping = 0
    
    try:
        while True:
            # Enviar ping periódicamente
            ahora = time.time()
            if ahora - ultimo_ping > INTERVALO_PING:
                enviar_ping(pc_id)
                ultimo_ping = ahora
            
            # Consultar comandos pendientes
            comandos = consultar_comandos(pc_id)
            
            for cmd in comandos:
                procesar_comando(cmd)
            
            time.sleep(INTERVALO_POLLING)
            
    except KeyboardInterrupt:
        print("")
        log("Cliente detenido. ¡Hasta luego!", "OK")
        sys.exit(0)

if __name__ == "__main__":
    main()
