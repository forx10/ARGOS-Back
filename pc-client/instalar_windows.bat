@echo off
echo ============================================
echo   ARGOS PC Client - Instalador Windows
echo ============================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no está instalado.
    echo Descarga Python desde: https://www.python.org/downloads/
    echo IMPORTANTE: Marca "Add Python to PATH" durante la instalación.
    pause
    exit /b 1
)

echo Python encontrado.
echo Instalando dependencias...
echo.

pip install requests pyautogui

echo.
echo ============================================
echo   Instalación completada!
echo ============================================
echo.
echo ANTES DE EJECUTAR, edita argos_pc_client.py:
echo   1. USUARIO_ID = tu ID de usuario
echo   2. PC_NOMBRE  = nombre para tu PC
echo.
echo Para ejecutar: python argos_pc_client.py
echo.
pause
