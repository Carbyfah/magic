<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Magic Travel - Sistema de Gestión</title>

    <!-- Preload Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- ✅ IZITOAST CSS Y JS - ORDEN CRÍTICO -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.4.0/css/iziToast.min.css">

    <!-- Vite CSS -->
    @vite(['resources/css/app.css'])
</head>

<body>
    <!-- React App Mount Point -->
    <div id="app">
        <!-- ✅ LOADING MEJORADO MIENTRAS CARGA -->
        <div id="app-loader"
            style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Inter', sans-serif;
        ">
            <!-- Logo animado -->
            <div
                style="
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 2rem;
                animation: pulse 2s infinite;
            ">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
            </div>

            <!-- Texto -->
            <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">Magic Travel</h1>
            <p style="font-size: 1rem; opacity: 0.8; margin-bottom: 2rem;">Cargando Sistema de Gestión...</p>

            <!-- Barra de progreso -->
            <div
                style="
                width: 300px;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
            ">
                <div
                    style="
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, white, transparent);
                    animation: loading 1.5s infinite;
                ">
                </div>
            </div>
        </div>

        <style>
            @keyframes pulse {

                0%,
                100% {
                    transform: scale(1);
                    opacity: 1;
                }

                50% {
                    transform: scale(1.05);
                    opacity: 0.8;
                }
            }

            @keyframes loading {
                0% {
                    transform: translateX(-100%);
                }

                100% {
                    transform: translateX(100%);
                }
            }
        </style>
    </div>

    <!-- ✅ SCRIPTS EN ORDEN CORRECTO -->
    <!-- Primero iziToast -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.4.0/js/iziToast.min.js"></script>

    <!-- Script para verificar carga -->
    <script>
        console.log('🔍 Verificando iziToast...');
        console.log('iziToast disponible:', typeof iziToast !== 'undefined');

        // Ocultar loader cuando todo esté listo
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                const loader = document.getElementById('app-loader');
                if (loader) {
                    loader.style.opacity = '0';
                    loader.style.transition = 'opacity 0.5s';
                    setTimeout(() => loader.remove(), 500);
                }
            }, 1000);
        });
    </script>

    <!-- Luego el JS principal con Vite -->
    @vite(['resources/js/simple.js'])

    <!-- Loading Fallback para browsers sin JS -->
    <noscript>
        <div
            style="
            text-align: center;
            padding: 50px;
            font-family: 'Inter', Arial, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        ">
            <div
                style="
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                max-width: 500px;
            ">
                <h2 style="color: #1e293b; margin-bottom: 1rem;">JavaScript Requerido</h2>
                <p style="color: #64748b; margin-bottom: 1rem;">Magic Travel requiere JavaScript para funcionar
                    correctamente.</p>
                <p style="color: #64748b;">Por favor habilite JavaScript en su navegador y recargue la página.</p>
            </div>
        </div>
    </noscript>
</body>

</html>
