@echo off
echo ===================================
echo    ACTIVANDO HYPER-V (DOCKER)
echo ===================================
echo.
echo Activando Hyper-V para Docker Desktop...
echo.

bcdedit /set hypervisorlaunchtype auto
powershell -Command "Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart"
powershell -Command "Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -NoRestart"

echo.
echo ===================================
echo   HYPER-V ACTIVADO
echo ===================================
echo.
echo REINICIA TU PC para usar Docker Desktop
echo.
pause