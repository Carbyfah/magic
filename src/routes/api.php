<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\TipoPersonaController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\EstadoController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\AgenciaController;
use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\ContactoAgenciaController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\RutaActivadaController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\AuditoriaController;
use App\Http\Controllers\Api\DashboardVentasController;
use App\Http\Controllers\Api\EstadisticaController;
use App\Http\Controllers\Api\TourActivadoController;

// RUTAS DE AUTENTICACIÓN (SIN MIDDLEWARE)
Route::prefix('auth')->group(function () {
    Route::post('/login', [UsuarioController::class, 'login']);
    Route::post('/logout', [UsuarioController::class, 'logout']);
    Route::get('/me', [UsuarioController::class, 'me']);
});

// HEALTH CHECK (SIN MIDDLEWARE)
Route::get('/magic/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => '2.0',
        'database' => 'connected'
    ]);
});

// Magic Travel API Routes CON PERMISOS POR ROLES
Route::prefix('magic')->group(function () {

    // =====================================================
    // MÓDULOS PARA TODOS LOS USUARIOS AUTENTICADOS
    // =====================================================

    // DASHBOARD BÁSICO - Todos pueden ver
    Route::middleware(['role:administrador,operador,vendedor'])->group(function () {
        Route::get('/stats-generales', function (Request $request) {
            try {
                $dashboardController = new \App\Http\Controllers\Api\DashboardVentasController();
                $metricas = $dashboardController->metricas($request)->getData();
                $resumen = $dashboardController->resumenGeneral($request)->getData();

                return response()->json([
                    'usuarios_activos' => $metricas->usuarios_activos ?? 0,
                    'reservas_hoy' => $metricas->reservas_hoy ?? 0,
                    'pasajeros_hoy' => $metricas->total_pasajeros_hoy ?? 0,
                    'rutas_activas' => $metricas->rutas_activas ?? 0,
                    'vehiculos_disponibles' => $metricas->vehiculos_disponibles ?? 0,
                    'ingresos_hoy' => $metricas->ingresos_hoy ?? 0,
                    'ingresos_mes' => $metricas->ingresos_mes ?? 0,
                    'ocupacion_promedio' => $metricas->ocupacion_promedio ?? 0
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'usuarios_activos' => 0,
                    'reservas_hoy' => 0,
                    'pasajeros_hoy' => 0,
                    'rutas_activas' => 0,
                    'vehiculos_disponibles' => 0,
                    'ingresos_hoy' => 0,
                    'ingresos_mes' => 0,
                    'ocupacion_promedio' => 0,
                    'error' => 'Datos no disponibles temporalmente'
                ]);
            }
        });
    });

    // =====================================================
    // MÓDULOS OPERACIONALES - Administrador + Operador + Vendedor
    // =====================================================

    // RESERVAS - Todos los roles pueden gestionar
    Route::prefix('reservas')->middleware(['role:administrador,operador,vendedor'])->group(function () {
        Route::get('/', [ReservaController::class, 'index']);
        Route::post('/', [ReservaController::class, 'store']);
        Route::get('/directas', [ReservaController::class, 'directas']);
        Route::post('/verificar-codigo', [ReservaController::class, 'verificarCodigo']);
        Route::post('/buscar-disponibilidad', [ReservaController::class, 'buscarDisponibilidad']);
        Route::get('/completas', [ReservaController::class, 'obtenerReservasCompletas']);
        Route::get('/ingresos-diarios', [ReservaController::class, 'obtenerIngresosDiarios']);
        Route::get('/solo-rutas', [ReservaController::class, 'soloRutas']);
        Route::get('/solo-tours', [ReservaController::class, 'soloTours']);
        Route::get('/dashboard-unificado', [ReservaController::class, 'obtenerDashboardUnificado']);
        Route::get('/info-tours', [ReservaController::class, 'obtenerInfoTours']);

        // Filtros por relaciones
        Route::get('/usuario/{usuarioId}', [ReservaController::class, 'porUsuario']);
        Route::get('/estado/{estadoId}', [ReservaController::class, 'porEstado']);
        Route::get('/agencia/{agenciaId}', [ReservaController::class, 'porAgencia']);
        Route::get('/fecha/{fecha}', [ReservaController::class, 'porFecha']);
        Route::get('/tour/{tourActivadoId}', [ReservaController::class, 'porTour']);

        // Operaciones individuales
        Route::get('/{reserva}', [ReservaController::class, 'show']);
        Route::put('/{reserva}', [ReservaController::class, 'update']);
        Route::patch('/{reserva}/confirm', [ReservaController::class, 'confirm']);
        Route::patch('/{reserva}/cancel', [ReservaController::class, 'cancel']);
        Route::patch('/{reserva}/execute', [ReservaController::class, 'execute']);
        Route::get('/{reserva}/whatsapp', [ReservaController::class, 'whatsapp']);
        Route::get('/{reserva}/voucher-pdf', [ReservaController::class, 'generarVoucherPDF']);

        // Solo Administrador puede eliminar reservas y facturar
        Route::middleware(['role:administrador'])->group(function () {
            Route::delete('/{reserva}', [ReservaController::class, 'destroy']);
            Route::patch('/{reserva}/facturar', [ReservaController::class, 'generarFactura']);
            Route::get('/{reserva}/factura-pdf', [ReservaController::class, 'generarFacturaPDF']);
        });

        // Acciones masivas - Solo Administrador y Operador
        Route::middleware(['role:administrador,operador'])->group(function () {
            Route::patch('/ruta/{rutaActivadaId}/confirm-all', [ReservaController::class, 'confirmByRuta']);
            Route::patch('/ruta/{rutaActivadaId}/cancel-all', [ReservaController::class, 'cancelByRuta']);
            Route::patch('/tour/{tourActivadoId}/confirm-all', [ReservaController::class, 'confirmByTour']);
            Route::patch('/tour/{tourActivadoId}/cancel-all', [ReservaController::class, 'cancelByTour']);
        });
    });

    // RUTAS ACTIVADAS - Administrador + Operador
    Route::prefix('rutas-activadas')->middleware(['role:administrador,operador'])->group(function () {
        Route::get('/', [RutaActivadaController::class, 'index']);
        Route::post('/', [RutaActivadaController::class, 'store']);
        Route::get('/{rutaActivada}', [RutaActivadaController::class, 'show']);
        Route::put('/{rutaActivada}', [RutaActivadaController::class, 'update']);
        Route::patch('/{rutaActivada}/activate', [RutaActivadaController::class, 'activate']);
        Route::patch('/{rutaActivada}/deactivate', [RutaActivadaController::class, 'deactivate']);

        // Funcionalidades operativas
        Route::post('/verificar-codigo', [RutaActivadaController::class, 'verificarCodigo']);
        Route::get('/estado/{estadoId}', [RutaActivadaController::class, 'porEstado']);
        Route::get('/persona/{personaId}', [RutaActivadaController::class, 'porPersona']);
        Route::get('/servicio/{servicioId}', [RutaActivadaController::class, 'porServicio']);
        Route::get('/vehiculo/{vehiculoId}', [RutaActivadaController::class, 'porVehiculo']);
        Route::get('/fecha/{fecha}', [RutaActivadaController::class, 'porFecha']);
        Route::get('/{rutaActivada}/lista-conductor-pdf', [RutaActivadaController::class, 'generarListaConductor']);
        Route::post('/{rutaActivada}/cerrar', [RutaActivadaController::class, 'cerrarRuta']);
        Route::post('/{rutaActivada}/verificar-capacidad', [RutaActivadaController::class, 'verificarCapacidad']);

        // Solo Administrador puede eliminar
        Route::middleware(['role:administrador'])->group(function () {
            Route::delete('/{rutaActivada}', [RutaActivadaController::class, 'destroy']);
        });
    });

    // TOURS ACTIVADOS - Administrador + Operador
    Route::prefix('tours-activados')->middleware(['role:administrador,operador'])->group(function () {
        Route::get('/', [TourActivadoController::class, 'index']);
        Route::post('/', [TourActivadoController::class, 'store']);
        Route::post('/verificar-codigo', [TourActivadoController::class, 'verificarCodigo']);
        Route::post('/buscar-disponible', [TourActivadoController::class, 'buscarDisponible']);
        Route::get('/con-guia-interno', [TourActivadoController::class, 'conGuiaInterno']);
        Route::get('/con-guia-externo', [TourActivadoController::class, 'conGuiaExterno']);
        Route::get('/persona/{personaId}', [TourActivadoController::class, 'porPersona']);
        Route::get('/servicio/{servicioId}', [TourActivadoController::class, 'porServicio']);
        Route::get('/fecha/{fecha}', [TourActivadoController::class, 'porFecha']);
        Route::get('/{tourActivado}', [TourActivadoController::class, 'show']);
        Route::put('/{tourActivado}', [TourActivadoController::class, 'update']);
        Route::get('/{tourActivado}/lista-guia-pdf', [TourActivadoController::class, 'generarListaGuia']);
        Route::post('/{tourActivado}/cerrar', [TourActivadoController::class, 'cerrarTour']);

        // Solo Administrador puede eliminar
        Route::middleware(['role:administrador'])->group(function () {
            Route::delete('/{tourActivado}', [TourActivadoController::class, 'destroy']);
        });
    });

    // VEHÍCULOS - Administrador + Operador
    Route::prefix('vehiculos')->middleware(['role:administrador,operador'])->group(function () {
        Route::get('/', [VehiculoController::class, 'index']);
        Route::get('/{vehiculo}', [VehiculoController::class, 'show']);
        Route::post('/verificar-placa', [VehiculoController::class, 'verificarPlaca']);
        Route::get('/estado/{estadoId}', [VehiculoController::class, 'porEstado']);
        Route::get('/{vehiculo}/rutas-activas', [VehiculoController::class, 'rutasActivas']);

        // Solo Administrador puede crear, modificar y eliminar vehículos
        Route::middleware(['role:administrador'])->group(function () {
            Route::post('/', [VehiculoController::class, 'store']);
            Route::put('/{vehiculo}', [VehiculoController::class, 'update']);
            Route::delete('/{vehiculo}', [VehiculoController::class, 'destroy']);
            Route::patch('/{vehiculo}/activate', [VehiculoController::class, 'activate']);
            Route::patch('/{vehiculo}/deactivate', [VehiculoController::class, 'deactivate']);
        });
    });

    // =====================================================
    // MÓDULOS COMERCIALES - Administrador + Vendedor + Operador
    // =====================================================

    // AGENCIAS - Todos pueden ver, solo Administrador modifica
    Route::prefix('agencias')->group(function () {
        Route::middleware(['role:administrador,operador,vendedor'])->group(function () {
            Route::get('/', [AgenciaController::class, 'index']);
            Route::get('/{agencia}', [AgenciaController::class, 'show']);
        });

        Route::middleware(['role:administrador'])->group(function () {
            Route::post('/', [AgenciaController::class, 'store']);
            Route::put('/{agencia}', [AgenciaController::class, 'update']);
            Route::delete('/{agencia}', [AgenciaController::class, 'destroy']);
            Route::patch('/{agencia}/activate', [AgenciaController::class, 'activate']);
            Route::patch('/{agencia}/deactivate', [AgenciaController::class, 'deactivate']);
        });
    });

    // CONTACTOS AGENCIA - Todos pueden ver, solo Administrador modifica
    Route::prefix('contactos-agencia')->group(function () {
        Route::middleware(['role:administrador,operador,vendedor'])->group(function () {
            Route::get('/', [ContactoAgenciaController::class, 'index']);
            Route::get('/{contacto}', [ContactoAgenciaController::class, 'show']);
            Route::get('/agencia/{agenciaId}', [ContactoAgenciaController::class, 'porAgencia']);
            Route::get('/agencia/{agenciaId}/principal', [ContactoAgenciaController::class, 'contactoPrincipal']);
            Route::get('/cargo/{cargo}', [ContactoAgenciaController::class, 'porCargo']);
        });

        Route::middleware(['role:administrador'])->group(function () {
            Route::post('/', [ContactoAgenciaController::class, 'store']);
            Route::put('/{contacto}', [ContactoAgenciaController::class, 'update']);
            Route::delete('/{contacto}', [ContactoAgenciaController::class, 'destroy']);
            Route::patch('/{contacto}/activate', [ContactoAgenciaController::class, 'activate']);
            Route::patch('/{contacto}/deactivate', [ContactoAgenciaController::class, 'deactivate']);
            Route::post('/verificar-telefono', [ContactoAgenciaController::class, 'verificarTelefono']);
        });
    });

    // DASHBOARD DE VENTAS - Administrador + Vendedor
    Route::prefix('dashboard/ventas')->middleware(['role:administrador,vendedor'])->group(function () {
        Route::get('metricas', [DashboardVentasController::class, 'metricas']);
        Route::get('ventas-por-dia', [DashboardVentasController::class, 'ventasPorDia']);
        Route::get('reservas-por-estado', [DashboardVentasController::class, 'reservasPorEstado']);
        Route::get('ventas-por-agencia', [DashboardVentasController::class, 'ventasPorAgencia']);
        Route::get('top-vendedores', [DashboardVentasController::class, 'topVendedores']);
        Route::get('rutas-mas-vendidas', [DashboardVentasController::class, 'rutasMasVendidas']);
        Route::get('resumen-general', [DashboardVentasController::class, 'resumenGeneral']);
    });

    // =====================================================
    // MÓDULOS DE CONFIGURACIÓN - SOLO ADMINISTRADOR
    // =====================================================

    // CATÁLOGOS BASE - Solo Administrador
    Route::middleware(['role:administrador'])->group(function () {

        // TIPO PERSONA
        Route::prefix('tipo-personas')->group(function () {
            Route::get('/', [TipoPersonaController::class, 'index']);
            Route::post('/', [TipoPersonaController::class, 'store']);
            Route::get('/{tipoPersona}', [TipoPersonaController::class, 'show']);
            Route::put('/{tipoPersona}', [TipoPersonaController::class, 'update']);
            Route::delete('/{tipoPersona}', [TipoPersonaController::class, 'destroy']);
            Route::patch('/{tipoPersona}/activate', [TipoPersonaController::class, 'activate']);
            Route::patch('/{tipoPersona}/deactivate', [TipoPersonaController::class, 'deactivate']);
        });

        // ROLES
        Route::prefix('roles')->group(function () {
            Route::get('/', [RolController::class, 'index']);
            Route::post('/', [RolController::class, 'store']);
            Route::get('/{rol}', [RolController::class, 'show']);
            Route::put('/{rol}', [RolController::class, 'update']);
            Route::delete('/{rol}', [RolController::class, 'destroy']);
            Route::patch('/{rol}/activate', [RolController::class, 'activate']);
            Route::patch('/{rol}/deactivate', [RolController::class, 'deactivate']);
        });

        // ESTADOS
        Route::prefix('estados')->group(function () {
            Route::get('/', [EstadoController::class, 'index']);
            Route::post('/', [EstadoController::class, 'store']);
            Route::get('/{estado}', [EstadoController::class, 'show']);
            Route::put('/{estado}', [EstadoController::class, 'update']);
            Route::delete('/{estado}', [EstadoController::class, 'destroy']);
            Route::patch('/{estado}/activate', [EstadoController::class, 'activate']);
            Route::patch('/{estado}/deactivate', [EstadoController::class, 'deactivate']);

            // Rutas contextuales - disponibles para consulta
            Route::get('/contexto/vehiculo', [EstadoController::class, 'paraVehiculo']);
            Route::get('/contexto/reserva', [EstadoController::class, 'paraReserva']);
            Route::get('/contexto/ruta-activada', [EstadoController::class, 'paraRutaActivada']);
            Route::get('/contexto/tour-activado', [EstadoController::class, 'paraTourActivado']);
            Route::get('/contexto/factura', [EstadoController::class, 'paraFactura']);
        });

        // SERVICIOS
        Route::prefix('servicios')->group(function () {
            Route::get('/', [ServicioController::class, 'index']);
            Route::post('/', [ServicioController::class, 'store']);
            Route::get('/{servicio}', [ServicioController::class, 'show']);
            Route::put('/{servicio}', [ServicioController::class, 'update']);
            Route::delete('/{servicio}', [ServicioController::class, 'destroy']);
            Route::patch('/{servicio}/activate', [ServicioController::class, 'activate']);
            Route::patch('/{servicio}/deactivate', [ServicioController::class, 'deactivate']);
        });

        // RUTAS
        Route::prefix('rutas')->group(function () {
            Route::get('/', [RutaController::class, 'index']);
            Route::post('/', [RutaController::class, 'store']);
            Route::get('/{ruta}', [RutaController::class, 'show']);
            Route::put('/{ruta}', [RutaController::class, 'update']);
            Route::delete('/{ruta}', [RutaController::class, 'destroy']);
            Route::patch('/{ruta}/activate', [RutaController::class, 'activate']);
            Route::patch('/{ruta}/deactivate', [RutaController::class, 'deactivate']);
        });

        // PERSONAL
        Route::prefix('personas')->group(function () {
            Route::get('/', [PersonaController::class, 'index']);
            Route::post('/', [PersonaController::class, 'store']);
            Route::get('/{persona}', [PersonaController::class, 'show']);
            Route::put('/{persona}', [PersonaController::class, 'update']);
            Route::delete('/{persona}', [PersonaController::class, 'destroy']);
            Route::patch('/{persona}/activate', [PersonaController::class, 'activate']);
            Route::patch('/{persona}/deactivate', [PersonaController::class, 'deactivate']);
            Route::post('/verificar-email', [PersonaController::class, 'verificarEmail']);
            Route::get('/tipo/{tipoPersonaId}', [PersonaController::class, 'porTipo']);
        });

        // USUARIOS
        Route::prefix('usuarios')->group(function () {
            Route::get('/', [UsuarioController::class, 'index']);
            Route::post('/', [UsuarioController::class, 'store']);
            Route::get('/{usuario}', [UsuarioController::class, 'show']);
            Route::put('/{usuario}', [UsuarioController::class, 'update']);
            Route::delete('/{usuario}', [UsuarioController::class, 'destroy']);
            Route::patch('/{usuario}/activate', [UsuarioController::class, 'activate']);
            Route::patch('/{usuario}/deactivate', [UsuarioController::class, 'deactivate']);
            Route::post('/verificar-codigo', [UsuarioController::class, 'verificarCodigo']);
            Route::get('/rol/{rolId}', [UsuarioController::class, 'porRol']);
            Route::get('/persona/{personaId}', [UsuarioController::class, 'porPersona']);
        });
    });

    // =====================================================
    // MÓDULOS DE REPORTES Y AUDITORÍA - SOLO ADMINISTRADOR
    // =====================================================

    Route::middleware(['role:administrador'])->group(function () {

        // ESTADÍSTICAS
        Route::prefix('estadisticas')->group(function () {
            Route::get('/dashboard', [EstadisticaController::class, 'dashboard']);
            Route::get('/grafico-dashboard', [EstadisticaController::class, 'graficoDashboard']);
            Route::get('/grafico-ingresos-diarios', [EstadisticaController::class, 'graficoIngresosDiarios']);
            Route::get('/grafico-ocupacion-vehiculos', [EstadisticaController::class, 'graficoOcupacionVehiculos']);
            Route::get('/grafico-reservas-por-estado', [EstadisticaController::class, 'graficoReservasPorEstado']);
            Route::get('/grafico-ventas-por-agencia', [EstadisticaController::class, 'graficoVentasPorAgencia']);
            Route::get('/grafico-top-rutas', [EstadisticaController::class, 'graficoTopRutas']);
        });

        // AUDITORÍA
        Route::prefix('auditorias')->group(function () {
            Route::get('/', [AuditoriaController::class, 'index']);
            Route::get('/stats', [AuditoriaController::class, 'stats']);
            Route::get('/tabla/{tabla}', [AuditoriaController::class, 'porTabla']);
            Route::get('/usuario/{usuarioId}', [AuditoriaController::class, 'porUsuario']);
            Route::get('/tabla/{tabla}/{auditoriaId}', [AuditoriaController::class, 'show']);
            Route::post('/reporte', [AuditoriaController::class, 'reporte']);
            Route::post('/reporte-excel', [AuditoriaController::class, 'reporteExcel']);
            Route::delete('/limpiar', [AuditoriaController::class, 'limpiar']);
        });
    });

    // Estados contextuales disponibles para consulta (todos los roles autenticados)
    Route::middleware(['role:administrador,operador,vendedor'])->group(function () {
        Route::get('/estados/contexto/vehiculo', [EstadoController::class, 'paraVehiculo']);
        Route::get('/estados/contexto/reserva', [EstadoController::class, 'paraReserva']);
        Route::get('/estados/contexto/ruta-activada', [EstadoController::class, 'paraRutaActivada']);
        Route::get('/estados/contexto/tour-activado', [EstadoController::class, 'paraTourActivado']);
        Route::get('/estados/contexto/factura', [EstadoController::class, 'paraFactura']);
    });
});

// User Authentication Route (Laravel estándar)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
