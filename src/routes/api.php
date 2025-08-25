<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    PersonaController,
    TipoPersonaController,
    EmpleadoController,
    ClienteController,
    RoleController,
    PaisController,
    EstadoEmpleadoController,
    TipoClienteController,
    TipoLicenciaController,
    ChoferDetalleController,
    TipoVehiculoController,
    TipoCombustibleController,
    EstadoVehiculoController,
    VehiculoController,
    TipoAgenciaController,
    EstadoComercialController,
    FormaPagoController,
    AgenciaController,
    EstadoRutaController,
    RutaController,
    EstadoReservaController,
    TipoVentaController,
    EstadoVentaController,
    EstadoPagoController,
    ReservaController,
    RutaEjecutadaController,
    VentaController,
    DashboardController,
    AuditoriaController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Ruta de prueba
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'service' => 'Magic Travel API'
    ]);
});

// ============ AUTENTICACIÓN (SIN PROTECCIÓN) ============
Route::prefix('v1')->group(function () {
    Route::post('login', [EmpleadoController::class, 'login']);
});

// Rutas públicas (por ahora, luego agregaremos auth middleware)
Route::prefix('v1')->group(function () {

    // ============ MÓDULO PERSONAS ============
    Route::apiResource('personas', PersonaController::class);
    Route::post('personas/{id}/restore', [PersonaController::class, 'restore']);

    Route::apiResource('tipos-persona', TipoPersonaController::class);
    Route::apiResource('empleados', EmpleadoController::class);
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('choferes-detalle', ChoferDetalleController::class);

    // ============ CATÁLOGOS MAESTROS ============
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('paises', PaisController::class);
    Route::apiResource('estados-empleado', EstadoEmpleadoController::class);
    Route::apiResource('tipos-cliente', TipoClienteController::class);
    Route::apiResource('tipos-licencia', TipoLicenciaController::class);

    // ============ MÓDULO VEHÍCULOS ============
    Route::apiResource('tipos-vehiculo', TipoVehiculoController::class);
    Route::apiResource('tipos-combustible', TipoCombustibleController::class);
    Route::apiResource('estados-vehiculo', EstadoVehiculoController::class);
    Route::apiResource('vehiculos', VehiculoController::class);

    // ============ MÓDULO COMERCIAL ============
    Route::apiResource('tipos-agencia', TipoAgenciaController::class);
    Route::apiResource('estados-comercial', EstadoComercialController::class);
    Route::apiResource('formas-pago', FormaPagoController::class);
    Route::apiResource('agencias', AgenciaController::class);

    // ============ MÓDULO RUTAS ============
    Route::apiResource('estados-ruta', EstadoRutaController::class);
    Route::apiResource('rutas', RutaController::class);
    Route::get('rutas/{id}/disponibilidad', [RutaController::class, 'verificarDisponibilidad']);

    // ============ MÓDULO RESERVAS Y VENTAS ============
    Route::apiResource('estados-reserva', EstadoReservaController::class);
    Route::apiResource('tipos-venta', TipoVentaController::class);
    Route::apiResource('estados-venta', EstadoVentaController::class);
    Route::apiResource('estados-pago', EstadoPagoController::class);

    Route::apiResource('reservas', ReservaController::class);
    Route::post('reservas/{id}/confirmar', [ReservaController::class, 'confirmar']);
    Route::post('reservas/{id}/cancelar', [ReservaController::class, 'cancelar']);
    Route::get('reservas/{id}/formato-whatsapp', [ReservaController::class, 'formatoWhatsApp']);

    Route::apiResource('rutas-ejecutadas', RutaEjecutadaController::class);
    Route::post('rutas-ejecutadas/{id}/iniciar', [RutaEjecutadaController::class, 'iniciar']);
    Route::post('rutas-ejecutadas/{id}/finalizar', [RutaEjecutadaController::class, 'finalizar']);

    Route::apiResource('ventas', VentaController::class);

    // ============ MÓDULO REPORTES ============
    Route::prefix('dashboard')->group(function () {
        Route::get('estadisticas', [DashboardController::class, 'estadisticas']);
        Route::get('ventas-periodo', [DashboardController::class, 'ventasPorPeriodo']);
        Route::get('ocupacion-rutas', [DashboardController::class, 'ocupacionRutas']);
    });

    // ============ AUDITORÍA ============
    Route::prefix('auditoria')->group(function () {
        Route::get('/', [AuditoriaController::class, 'index']);
        Route::get('/tabla/{tabla}', [AuditoriaController::class, 'porTabla']);
        Route::get('/usuario/{usuario}', [AuditoriaController::class, 'porUsuario']);
    });
});
