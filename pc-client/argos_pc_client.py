#!/usr/bin/env python3
"""
ARGOS PC Client v2.0 - Script avanzado de control remoto
Funcionalidades:
  - Abrir sitios habituales y apps
  - Apagar/Reiniciar/Suspender/Bloquear PC
  - Buscar en Google y otros sitios
  - Interactuar con páginas web (Selenium)
  - Ejecutar comandos del sistema

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
PC_NOMBRE = "Mi PC"
INTERVALO_POLLING = 5
INTERVALO_PING = 120
# ============================================

PC_ID_FILE = os.path.join(os.path.expanduser("~"), ".argos_pc_id")
SISTEMA = platform.system()

def get_or_create_pc_id():
    if os.path.exists(PC_ID_FILE):
        with open(PC_ID_FILE, "r") as f:
            return f.read().strip()
    pc_id = f"pc_{uuid.uuid4().hex[:8]}"
    with open(PC_ID_FILE, "w") as f:
        f.write(pc_id)
    return pc_id

def get_local_ip():
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
    timestamp = datetime.now().strftime("%H:%M:%S")
    icons = {"INFO": "ℹ️", "OK": "✅", "ERROR": "❌", "CMD": "🎯", "WARN": "⚠️", "PC": "💻", "WEB": "🌐"}
    icon = icons.get(level, "📌")
    print(f"[{timestamp}] {icon} {msg}")

# ============================================
# CONTROL DEL SISTEMA (Apagar, Reiniciar, etc)
# ============================================

def apagar_pc(delay=10):
    """Apaga la PC con un retraso de seguridad"""
    log(f"Apagando PC en {delay} segundos...", "PC")
    try:
        if SISTEMA == "Windows":
            os.system(f"shutdown /s /t {delay} /c \"ARGOS: Apagando PC\"")
        elif SISTEMA == "Darwin":
            os.system(f"sudo shutdown -h +{delay // 60 or 1}")
        else:
            os.system(f"shutdown -h +{delay // 60 or 1}")
        return f"PC se apagará en {delay} segundos"
    except Exception as e:
        return f"Error apagando: {e}"

def reiniciar_pc(delay=10):
    """Reinicia la PC"""
    log(f"Reiniciando PC en {delay} segundos...", "PC")
    try:
        if SISTEMA == "Windows":
            os.system(f"shutdown /r /t {delay} /c \"ARGOS: Reiniciando PC\"")
        elif SISTEMA == "Darwin":
            os.system(f"sudo shutdown -r +{delay // 60 or 1}")
        else:
            os.system(f"shutdown -r +{delay // 60 or 1}")
        return f"PC se reiniciará en {delay} segundos"
    except Exception as e:
        return f"Error reiniciando: {e}"

def suspender_pc():
    """Suspende/Duerme la PC"""
    log("Suspendiendo PC...", "PC")
    try:
        if SISTEMA == "Windows":
            os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
        elif SISTEMA == "Darwin":
            os.system("pmset sleepnow")
        else:
            os.system("systemctl suspend")
        return "PC suspendida"
    except Exception as e:
        return f"Error suspendiendo: {e}"

def bloquear_pc():
    """Bloquea la pantalla"""
    log("Bloqueando pantalla...", "PC")
    try:
        if SISTEMA == "Windows":
            os.system("rundll32.exe user32.dll,LockWorkStation")
        elif SISTEMA == "Darwin":
            os.system("/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend")
        else:
            os.system("loginctl lock-session")
        return "Pantalla bloqueada"
    except Exception as e:
        return f"Error bloqueando: {e}"

def cancelar_apagado():
    """Cancela un apagado/reinicio programado"""
    log("Cancelando apagado...", "PC")
    try:
        if SISTEMA == "Windows":
            os.system("shutdown /a")
        else:
            os.system("shutdown -c")
        return "Apagado cancelado"
    except Exception as e:
        return f"Error cancelando: {e}"

# ============================================
# ABRIR URLS Y APPS
# ============================================

def abrir_urls(urls_data):
    if not urls_data:
        return "No hay URLs para abrir"
    abiertos = []
    for item in urls_data:
        if isinstance(item, dict):
            nombre = item.get("nombre", "")
            url = item.get("url", "")
        else:
            nombre = str(item)
            url = str(item)
        if url:
            log(f"Abriendo: {nombre} → {url}", "WEB")
            webbrowser.open(url)
            abiertos.append(nombre)
            time.sleep(0.5)
    return f"Sitios abiertos: {', '.join(abiertos)}"

def abrir_app(app_name):
    app_lower = app_name.lower()
    log(f"Abriendo app: {app_name}", "CMD")
    
    apps = {
        "Windows": {
            "code": "code", "vscode": "code", "chrome": "start chrome",
            "firefox": "start firefox", "edge": "start msedge",
            "notepad": "notepad", "bloc de notas": "notepad",
            "calculadora": "calc", "explorador": "explorer",
            "terminal": "wt", "cmd": "cmd", "powershell": "powershell",
            "spotify": "start spotify:", "discord": "start discord:",
            "slack": "start slack:", "teams": "start msteams:",
            "word": "start winword", "excel": "start excel",
            "powerpoint": "start powerpnt", "paint": "mspaint",
            "administrador de tareas": "taskmgr",
        },
        "Darwin": {
            "code": "open -a 'Visual Studio Code'", "chrome": "open -a 'Google Chrome'",
            "firefox": "open -a Firefox", "safari": "open -a Safari",
            "terminal": "open -a Terminal", "spotify": "open -a Spotify",
        },
        "Linux": {
            "code": "code", "chrome": "google-chrome",
            "firefox": "firefox", "terminal": "gnome-terminal",
            "spotify": "spotify", "nautilus": "nautilus",
        }
    }
    
    try:
        cmd = apps.get(SISTEMA, {}).get(app_lower, f"start {app_name}" if SISTEMA == "Windows" else app_name)
        if SISTEMA == "Windows":
            os.system(cmd)
        else:
            subprocess.Popen(cmd.split(), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return f"App '{app_name}' abierta"
    except Exception as e:
        return f"Error: {e}"

def cerrar_todo():
    try:
        if SISTEMA == "Windows":
            for proc in ["chrome.exe", "msedge.exe", "firefox.exe"]:
                os.system(f"taskkill /F /IM {proc} 2>nul")
        elif SISTEMA == "Darwin":
            for app in ["Google Chrome", "Safari", "Firefox"]:
                os.system(f"killall '{app}' 2>/dev/null")
        else:
            for proc in ["chrome", "firefox"]:
                os.system(f"killall {proc} 2>/dev/null")
        return "Navegadores cerrados"
    except Exception as e:
        return f"Error: {e}"

# ============================================
# BÚSQUEDA WEB
# ============================================

def buscar_web(query, motor="google"):
    """Abre una búsqueda en el navegador"""
    log(f"Buscando: '{query}' en {motor}", "WEB")
    
    motores = {
        "google": f"https://www.google.com/search?q={query.replace(' ', '+')}",
        "youtube": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}",
        "bing": f"https://www.bing.com/search?q={query.replace(' ', '+')}",
        "wikipedia": f"https://es.wikipedia.org/wiki/Special:Search?search={query.replace(' ', '+')}",
        "amazon": f"https://www.amazon.com/s?k={query.replace(' ', '+')}",
        "maps": f"https://www.google.com/maps/search/{query.replace(' ', '+')}",
    }
    
    url = motores.get(motor.lower(), motores["google"])
    webbrowser.open(url)
    return f"Búsqueda abierta: '{query}' en {motor}"

# ============================================
# INTERACCIÓN CON PÁGINAS WEB (Selenium)
# ============================================

def interactuar_web(url, acciones):
    """Abre una página y ejecuta acciones con Selenium"""
    log(f"Interactuando con: {url}", "WEB")
    
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.common.keys import Keys
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.options import Options
    except ImportError:
        log("Selenium no instalado. Ejecuta: pip install selenium", "ERROR")
        return "Error: Selenium no instalado. Ejecuta: pip install selenium"
    
    try:
        options = Options()
        options.add_argument("--start-maximized")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        
        wait = WebDriverWait(driver, 10)
        resultados = []
        
        for accion in acciones:
            tipo = accion.get("tipo", "")
            time.sleep(1)  # Pausa entre acciones
            
            if tipo == "click":
                selector = accion.get("selector", "")
                try:
                    elem = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                    elem.click()
                    resultados.append(f"Click en: {selector}")
                except:
                    # Intentar con XPath
                    try:
                        elem = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                        elem.click()
                        resultados.append(f"Click en: {selector}")
                    except:
                        resultados.append(f"No encontré: {selector}")
            
            elif tipo == "escribir":
                selector = accion.get("selector", "")
                texto = accion.get("texto", "")
                try:
                    elem = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    elem.clear()
                    elem.send_keys(texto)
                    resultados.append(f"Escrito '{texto}' en {selector}")
                except:
                    resultados.append(f"No encontré: {selector}")
            
            elif tipo == "enter":
                selector = accion.get("selector", "")
                try:
                    elem = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    elem.send_keys(Keys.ENTER)
                    resultados.append("Enter presionado")
                except:
                    resultados.append(f"No encontré: {selector}")
            
            elif tipo == "esperar":
                segundos = accion.get("segundos", 2)
                time.sleep(segundos)
                resultados.append(f"Esperado {segundos}s")
            
            elif tipo == "screenshot":
                nombre = accion.get("nombre", "argos_screenshot.png")
                ruta = os.path.join(os.path.expanduser("~"), "Desktop", nombre)
                driver.save_screenshot(ruta)
                resultados.append(f"Screenshot guardado: {ruta}")
            
            elif tipo == "leer_texto":
                selector = accion.get("selector", "body")
                try:
                    elem = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    texto = elem.text[:500]
                    resultados.append(f"Texto leído: {texto}")
                except:
                    resultados.append(f"No encontré: {selector}")
            
            elif tipo == "scroll":
                direccion = accion.get("direccion", "abajo")
                pixels = 500 if direccion == "abajo" else -500
                driver.execute_script(f"window.scrollBy(0, {pixels})")
                resultados.append(f"Scroll {direccion}")
            
            elif tipo == "cerrar":
                driver.quit()
                resultados.append("Navegador cerrado")
                return "\n".join(resultados)
        
        # NO cerrar el navegador para que el usuario pueda interactuar
        log(f"Acciones completadas: {len(resultados)}", "OK")
        return "\n".join(resultados)
        
    except Exception as e:
        log(f"Error Selenium: {e}", "ERROR")
        return f"Error interactuando: {str(e)}"

# ============================================
# BÚSQUEDA INTELIGENTE EN SITIOS ESPECÍFICOS
# ============================================

def buscar_en_sitio(sitio, query):
    """Búsqueda inteligente en sitios populares con Selenium"""
    log(f"Buscando '{query}' en {sitio}", "WEB")
    
    sitios_config = {
        "youtube": {
            "url": "https://www.youtube.com",
            "acciones": [
                {"tipo": "escribir", "selector": "input#search, input[name='search_query']", "texto": query},
                {"tipo": "enter", "selector": "input#search, input[name='search_query']"},
            ]
        },
        "google": {
            "url": "https://www.google.com",
            "acciones": [
                {"tipo": "escribir", "selector": "textarea[name='q'], input[name='q']", "texto": query},
                {"tipo": "enter", "selector": "textarea[name='q'], input[name='q']"},
            ]
        },
        "spotify": {
            "url": f"https://open.spotify.com/search/{query.replace(' ', '%20')}",
            "acciones": []
        },
        "amazon": {
            "url": "https://www.amazon.com",
            "acciones": [
                {"tipo": "escribir", "selector": "input#twotabsearchtextbox", "texto": query},
                {"tipo": "enter", "selector": "input#twotabsearchtextbox"},
            ]
        },
        "wikipedia": {
            "url": "https://es.wikipedia.org",
            "acciones": [
                {"tipo": "escribir", "selector": "input#searchInput, input[name='search']", "texto": query},
                {"tipo": "enter", "selector": "input#searchInput, input[name='search']"},
            ]
        },
        "maps": {
            "url": f"https://www.google.com/maps/search/{query.replace(' ', '+')}",
            "acciones": []
        },
    }
    
    config = sitios_config.get(sitio.lower())
    if not config:
        # Si no está en la lista, buscar en Google con site:
        url = f"https://www.google.com/search?q=site:{sitio}+{query.replace(' ', '+')}"
        webbrowser.open(url)
        return f"Buscando '{query}' en {sitio} vía Google"
    
    if not config["acciones"]:
        # Solo abrir URL directa
        webbrowser.open(config["url"])
        return f"Abriendo {sitio} con búsqueda: {query}"
    
    return interactuar_web(config["url"], config["acciones"])

# ============================================
# ESCRIBIR TEXTO (simulación de teclado)
# ============================================

def escribir_texto(texto):
    try:
        import pyautogui
        time.sleep(1)
        pyautogui.typewrite(texto, interval=0.02) if texto.isascii() else pyautogui.write(texto)
        return f"Texto escrito: {texto[:50]}..."
    except ImportError:
        return "Error: pyautogui no instalado"
    except Exception as e:
        return f"Error: {e}"

def ejecutar_comando(comando):
    log(f"Ejecutando: {comando}", "CMD")
    try:
        result = subprocess.run(comando, shell=True, capture_output=True, text=True, timeout=30)
        return result.stdout[:500] if result.stdout else f"Código: {result.returncode}"
    except subprocess.TimeoutExpired:
        return "Timeout (30s)"
    except Exception as e:
        return f"Error: {e}"

# ============================================
# PROCESADOR DE COMANDOS
# ============================================

def procesar_comando(comando):
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
            resultado = abrir_app(params.get("app", ""))
            exito = True
            
        elif tipo == "cerrar_todo":
            resultado = cerrar_todo()
            exito = True

        # === NUEVOS COMANDOS DE SISTEMA ===
        elif tipo == "apagar_pc":
            delay = params.get("delay", 10)
            resultado = apagar_pc(delay)
            exito = True
            
        elif tipo == "reiniciar_pc":
            delay = params.get("delay", 10)
            resultado = reiniciar_pc(delay)
            exito = True
            
        elif tipo == "suspender_pc":
            resultado = suspender_pc()
            exito = True
            
        elif tipo == "bloquear_pc":
            resultado = bloquear_pc()
            exito = True
            
        elif tipo == "cancelar_apagado":
            resultado = cancelar_apagado()
            exito = True

        # === NUEVOS COMANDOS WEB ===
        elif tipo == "buscar_web":
            query = params.get("query", "")
            motor = params.get("motor", "google")
            resultado = buscar_web(query, motor)
            exito = True
            
        elif tipo == "buscar_en_sitio":
            sitio = params.get("sitio", "google")
            query = params.get("query", "")
            resultado = buscar_en_sitio(sitio, query)
            exito = True
            
        elif tipo == "interactuar_web":
            url = params.get("url", "")
            acciones = params.get("acciones", [])
            resultado = interactuar_web(url, acciones)
            exito = True

        elif tipo == "escribir":
            resultado = escribir_texto(params.get("texto", ""))
            exito = True
            
        elif tipo == "ejecutar":
            resultado = ejecutar_comando(params.get("comando", ""))
            exito = True
            
        else:
            resultado = f"Comando desconocido: {tipo}"
            exito = False
            
    except Exception as e:
        resultado = f"Error: {str(e)}"
        exito = False
    
    reportar_resultado(cmd_id, resultado, exito)
    return resultado

def reportar_resultado(cmd_id, resultado, exito):
    try:
        resp = requests.post(
            f"{BACKEND_URL}/api/v1/pc/commands/{cmd_id}/result",
            json={"resultado": resultado, "exito": exito},
            timeout=10
        )
        if resp.status_code == 201:
            log(f"Resultado reportado: {resultado[:80]}", "OK")
    except Exception as e:
        log(f"No se pudo reportar: {e}", "ERROR")

# ============================================
# LOOP PRINCIPAL
# ============================================

def registrar_pc(pc_id):
    log(f"Registrando PC: {pc_id} ({PC_NOMBRE})")
    try:
        resp = requests.post(
            f"{BACKEND_URL}/api/v1/pc/register",
            json={
                "usuarioId": USUARIO_ID,
                "pcId": pc_id,
                "nombrePc": PC_NOMBRE,
                "sistemaOperativo": f"{SISTEMA} {platform.release()}",
                "ipLocal": get_local_ip()
            },
            timeout=15
        )
        if resp.status_code == 201:
            log("PC registrada exitosamente", "OK")
            return True
        else:
            log(f"Error: {resp.status_code}", "ERROR")
            return False
    except requests.exceptions.ConnectionError:
        log("No se pudo conectar al backend", "ERROR")
        return False
    except Exception as e:
        log(f"Error: {e}", "ERROR")
        return False

def enviar_ping(pc_id):
    try:
        requests.post(
            f"{BACKEND_URL}/api/v1/pc/ping",
            json={"pcId": pc_id, "ipLocal": get_local_ip()},
            timeout=10
        )
    except:
        pass

def consultar_comandos(pc_id):
    try:
        resp = requests.get(
            f"{BACKEND_URL}/api/v1/pc/commands/{pc_id}/pending",
            timeout=10
        )
        if resp.status_code == 200:
            return resp.json().get("comandos", [])
        return []
    except:
        return []

def main():
    print("")
    print("═" * 55)
    print("  🛡️  ARGOS PC Client v2.0")
    print("═" * 55)
    print(f"  Backend:    {BACKEND_URL}")
    print(f"  Usuario:    {USUARIO_ID}")
    print(f"  PC Nombre:  {PC_NOMBRE}")
    print(f"  Sistema:    {SISTEMA} {platform.release()}")
    print(f"  IP Local:   {get_local_ip()}")
    print("")
    print("  Comandos soportados:")
    print("    🌐 Abrir sitios, buscar en web")
    print("    💻 Abrir/cerrar apps")
    print("    ⏻  Apagar/reiniciar/suspender/bloquear PC")
    print("    🔍 Buscar en YouTube, Google, Amazon, etc.")
    print("    🤖 Interactuar con páginas web (Selenium)")
    print("═" * 55)
    print("")
    
    pc_id = get_or_create_pc_id()
    log(f"PC ID: {pc_id}")
    
    # Registrar PC (con reintentos)
    for intento in range(3):
        if registrar_pc(pc_id):
            break
        log(f"Reintentando ({intento + 1}/3)...", "WARN")
        time.sleep(10)
    else:
        log("No se pudo registrar. Verifica la URL del backend.", "ERROR")
        sys.exit(1)
    
    log("Escuchando comandos... (Ctrl+C para detener)")
    print("")
    
    ultimo_ping = 0
    
    try:
        while True:
            ahora = time.time()
            if ahora - ultimo_ping > INTERVALO_PING:
                enviar_ping(pc_id)
                ultimo_ping = ahora
            
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
