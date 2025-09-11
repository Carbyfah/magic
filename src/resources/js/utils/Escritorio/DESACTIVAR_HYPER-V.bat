@echo off
echo ===================================
echo   DESACTIVANDO HYPER-V (VMWARE)
echo ===================================
echo.
echo Desactivando Hyper-V para VMware/GNS3...
echo.

bcdedit /set hypervisorlaunchtype off
DISM /Online /Disable-Feature /FeatureName:Microsoft-Hyper-V-All /NoRestart
powershell -Command "Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-Hypervisor -NoRestart"
powershell -Command "Disable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform -NoRestart"
powershell -Command "Disable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart"

echo.
echo ===================================
echo   HYPER-V DESACTIVADO
echo ===================================
echo.
echo REINICIA TU PC para usar VMware/GNS3
echo.
pause