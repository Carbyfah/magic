<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\TipoPersonaController;
use App\Http\Controllers\Api\PaisController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\EstadoEmpleadoController;
use App\Http\Controllers\Api\TipoClienteController;
use App\Http\Controllers\Api\TipoLicenciaController;
use App\Http\Controllers\Api\TipoVehiculoController;
use App\Http\Controllers\Api\TipoCombustibleController;
use App\Http\Controllers\Api\EstadoVehiculoController;
use App\Http\Controllers\Api\TipoAgenciaController;
use App\Http\Controllers\Api\FormaPagoController;
use App\Http\Controllers\Api\EstadoComercialController;
use App\Http\Controllers\Api\EstadoRutaController;
use App\Http\Controllers\Api\EstadoReservaController;
use App\Http\Controllers\Api\TipoVentaController;
use App\Http\Controllers\Api\EstadoVentaController;
use App\Http\Controllers\Api\EstadoPagoController;
use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\Api\EmpleadoController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ChoferDetalleController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\AgenciaController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\RutaEjecutadaController;
use App\Http\Controllers\Api\VentaController;
use App\Http\Controllers\Api\AuditoriaController;
use App\Http\Controllers\Api\DashboardController;

Route::middleware(['api'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Catálogos Independientes
    Route::apiResource('tipos-persona', TipoPersonaController::class);
    Route::apiResource('paises', PaisController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('estados-empleado', EstadoEmpleadoController::class);
    Route::apiResource('tipos-cliente', TipoClienteController::class);
    Route::apiResource('tipos-licencia', TipoLicenciaController::class);
    Route::apiResource('tipos-vehiculo', TipoVehiculoController::class);
    Route::apiResource('tipos-combustible', TipoCombustibleController::class);
    Route::apiResource('estados-vehiculo', EstadoVehiculoController::class);
    Route::apiResource('tipos-agencia', TipoAgenciaController::class);
    Route::apiResource('formas-pago', FormaPagoController::class);
    Route::apiResource('estados-comercial', EstadoComercialController::class);
    Route::apiResource('estados-ruta', EstadoRutaController::class);
    Route::apiResource('estados-reserva', EstadoReservaController::class);
    Route::apiResource('tipos-venta', TipoVentaController::class);
    Route::apiResource('estados-venta', EstadoVentaController::class);
    Route::apiResource('estados-pago', EstadoPagoController::class);

    // Módulo Personas
    Route::apiResource('personas', PersonaController::class);
    Route::apiResource('empleados', EmpleadoController::class);
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('choferes-detalle', ChoferDetalleController::class);

    // Módulo Operaciones
    Route::apiResource('vehiculos', VehiculoController::class);
    Route::apiResource('agencias', AgenciaController::class);
    Route::apiResource('rutas', RutaController::class);

    // Módulo Reservas y Ventas
    Route::apiResource('reservas', ReservaController::class);
    Route::apiResource('rutas-ejecutadas', RutaEjecutadaController::class);
    Route::apiResource('ventas', VentaController::class);

    // Auditoría
    Route::apiResource('auditoria', AuditoriaController::class)->only(['index', 'show']);
});
