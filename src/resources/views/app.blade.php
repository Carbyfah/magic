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

    <!-- Vite CSS -->
    @vite(['resources/css/app.css', 'resources/js/simple.js']) <!-- simple.js -->
</head>

<body>
    <!-- React App Mount Point -->
    <div id="app"></div>

    <!-- Loading Fallback -->
    <noscript>
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h2>JavaScript Required</h2>
            <p>This application requires JavaScript to run properly.</p>
            <p>Please enable JavaScript in your browser and reload the page.</p>
        </div>
    </noscript>
</body>

</html>
