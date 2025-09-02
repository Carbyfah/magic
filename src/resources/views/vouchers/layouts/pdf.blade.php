<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Magic Travel - @yield('title')</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 8mm 6mm 8mm 6mm;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .header h2 {
            font-size: 18px;
            color: #3498db;
            margin-bottom: 5px;
        }

        .info-section {
            margin-bottom: 25px;
        }

        .info-section h3 {
            background: #f8f9fa;
            padding: 8px 12px;
            font-size: 14px;
            color: #2c3e50;
            border-left: 4px solid #3498db;
            margin-bottom: 15px;
        }

        .info-grid {
            display: table;
            width: 100%;
        }

        .info-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 20px;
        }

        .info-row {
            margin-bottom: 8px;
        }

        .info-row strong {
            display: inline-block;
            width: 120px;
            font-weight: bold;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>

<body>
    @yield('content')

    <div class="footer">
        <p>Magic Travel - Sistema de Gestión de Reservas | Generado el
            {{ \Carbon\Carbon::now('America/Guatemala')->format('d/m/Y H:i') }}
        </p>
    </div>
</body>

</html>
