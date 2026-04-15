#!/bin/bash
echo "============================================"
echo "  ARGOS PC Client - Instalador Mac/Linux"
echo "============================================"
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 no está instalado."
    echo "Instala con:"
    echo "  Mac:   brew install python3"
    echo "  Linux: sudo apt install python3 python3-pip"
    exit 1
fi

echo "Python3 encontrado: $(python3 --version)"
echo "Instalando dependencias..."
echo ""

pip3 install requests pyautogui

echo ""
echo "============================================"
echo "  Instalación completada!"
echo "============================================"
echo ""
echo "ANTES DE EJECUTAR, edita argos_pc_client.py:"
echo "  1. USUARIO_ID = tu ID de usuario"
echo "  2. PC_NOMBRE  = nombre para tu PC"
echo ""
echo "Para ejecutar: python3 argos_pc_client.py"
