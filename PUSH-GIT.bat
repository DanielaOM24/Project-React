@echo off
echo Subiendo rama feature/integraciones a GitHub...
cd /d "%~dp0"
git push -u origin feature/integraciones
if errorlevel 1 (
  echo.
  echo ERROR: No se pudo conectar a GitHub.
  echo - Comprueba tu Internet.
  echo - Si usas VPN, pruebala desactivada.
  echo - En Git Bash o CMD: git config --global --unset http.proxy
  pause
) else (
  echo.
  echo Listo. Abre: https://github.com/DanielaOM24/Project-React/tree/feature/integraciones
  pause
)
