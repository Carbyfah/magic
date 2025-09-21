<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PrecioController;
use App\Http\Controllers\Api\PermisosController;
use App\Http\Controllers\Api\EstadoRutaController;
use App\Http\Controllers\Api\TransferenciaController;
use App\Http\Controllers\Api\VentasController;
use App\Http\Controllers\Api\ContabilidadController;
use App\Http\Controllers\Api\ReservasController;
use App\Http\Controllers\Api\RutasController;
use App\Http\Controllers\Api\VehiculosController;
use App\Http\Controllers\Api\ServiciosController;
use App\Http\Controllers\Api\EmpleadosController;
use App\Http\Controllers\Api\AgenciasController;
use App\Http\Controllers\Api\CargosController;
use App\Http\Controllers\Api\EstadosController;
use App\Http\Controllers\Api\CajaController;
use App\Http\Controllers\Api\EgresosController;
use App\Http\Controllers\Api\ToursController;
use App\Http\Controllers\Api\FacturasController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UtilsController;
use App\Http\Controllers\Api\NotificacionesController;
use App\Http\Controllers\Api\AuditoriaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas de autenticación
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
    Route::get('/verify-token', [AuthController::class, 'verifyToken'])->middleware('auth:sanctum');
    Route::post('/logout-all', [AuthController::class, 'logoutAll'])->middleware('auth:sanctum');
});

// Rutas de prueba - FASE 1
Route::prefix('test')->group(function () {
    Route::get('/services', [PrecioController::class, 'testServices']);
});

// Rutas de precios y capacidad - FASE 1
Route::prefix('precio')->group(function () {
    Route::post('/calcular', [PrecioController::class, 'calcularPrecio']);
});

Route::prefix('capacidad')->group(function () {
    Route::post('/verificar', [PrecioController::class, 'verificarCapacidad']);
});

Route::prefix('ocupacion')->group(function () {
    Route::get('/{rutaActivaId}', [PrecioController::class, 'ocupacionDetallada']);
});

// Rutas de gestión de permisos - Solo para administradores
Route::middleware('auth:sanctum')->prefix('permisos')->group(function () {
    Route::get('/usuarios', [PermisosController::class, 'listarUsuarios']);
    Route::get('/usuario/{id}', [PermisosController::class, 'obtenerPermisosUsuario']);
    Route::put('/usuario/{id}', [PermisosController::class, 'actualizarPermisosUsuario']);
    Route::post('/copiar', [PermisosController::class, 'copiarPermisos']);
    Route::get('/verificar/{modulo}/{accion}', [PermisosController::class, 'verificarPermiso']);
    Route::get('/resumen', [PermisosController::class, 'resumenPermisos']);
});

// Rutas de control de estados - FASE 2
Route::middleware('auth:sanctum')->prefix('estado-ruta')->group(function () {
    Route::get('/test-fase2', [EstadoRutaController::class, 'testFase2']);
    Route::put('/actualizar/{rutaActivaId}', [EstadoRutaController::class, 'actualizarEstado']);
    Route::get('/puede-reservar/{rutaActivaId}', [EstadoRutaController::class, 'puedeRecibirReservas']);
    Route::get('/necesitan-actualizacion', [EstadoRutaController::class, 'rutasParaActualizar']);
    Route::post('/actualizar-masivo', [EstadoRutaController::class, 'actualizarEstadosMasivo']);
});

// Rutas de transferencias y escenarios - FASE 3
Route::middleware('auth:sanctum')->prefix('transferencia')->group(function () {
    Route::get('/test-fase3', [TransferenciaController::class, 'testFase3']);
    Route::get('/analizar/{reservaId}', [TransferenciaController::class, 'analizarEscenario']);
    Route::get('/resumen-escenarios', [TransferenciaController::class, 'resumenEscenarios']);
    Route::post('/confirmar-pago-conductor', [TransferenciaController::class, 'confirmarPagoConductor']);
    Route::get('/control-ventas/{fecha?}', [TransferenciaController::class, 'controlVentas']);
    Route::post('/liquidar-ruta', [TransferenciaController::class, 'liquidarRuta']);
});

// Rutas del módulo de ventas - FASE 4
Route::middleware('auth:sanctum')->prefix('ventas')->group(function () {
    Route::get('/test-fase4', [VentasController::class, 'testFase4']);
    Route::get('/dashboard/{fecha?}', [VentasController::class, 'dashboard']);
    Route::get('/reservas/{clasificacion?}', [VentasController::class, 'listarReservasPorClasificacion']);
    Route::get('/liquidacion/{rutaActivaId}', [VentasController::class, 'estadoLiquidacionRuta']);
    Route::post('/liquidar-ruta', [VentasController::class, 'liquidarRuta']);
    Route::get('/pendientes-liquidacion', [VentasController::class, 'rutasPendientesLiquidacion']);
    Route::post('/confirmar-pagos-conductor', [VentasController::class, 'confirmarPagosConductorMasivo']);
    Route::get('/reporte-periodo', [VentasController::class, 'reportePeriodo']);
});


// Rutas del módulo de contabilidad - FASE 5
Route::middleware('auth:sanctum')->prefix('contabilidad')->group(function () {
    Route::get('/test-fase5', [ContabilidadController::class, 'testFase5']);
    Route::get('/dashboard', [ContabilidadController::class, 'dashboard']);
    Route::get('/estado-cuenta/{agenciaId?}', [ContabilidadController::class, 'estadoCuenta']);
    Route::get('/balance-agencias/{agencia1Id}/{agencia2Id}', [ContabilidadController::class, 'balanceEntreAgencias']);
    Route::get('/reporte-ejecutivo', [ContabilidadController::class, 'reporteEjecutivo']);
    Route::get('/agencias', [ContabilidadController::class, 'listarAgencias']);
    Route::get('/vouchers-pendientes', [ContabilidadController::class, 'vouchersPendientes']);
    Route::get('/exportar-estado-cuenta/{agenciaId?}', [ContabilidadController::class, 'exportarEstadoCuenta']);
});

// Rutas de Reservas - BLOQUE 1
Route::middleware('auth:sanctum')->prefix('reservas')->group(function () {
    // Rutas con permisos específicos
    Route::middleware('check.permissions:reservas,ver')->group(function () {
        Route::get('/', [ReservasController::class, 'index']);
        Route::get('/buscar', [ReservasController::class, 'buscar']);
        Route::get('/{reserva}', [ReservasController::class, 'show']);
    });

    Route::middleware('check.permissions:reservas,crear')->group(function () {
        Route::post('/', [ReservasController::class, 'store']);
        Route::post('/{reserva}/duplicar', [ReservasController::class, 'duplicar']);
    });

    Route::middleware('check.permissions:reservas,editar')->group(function () {
        Route::put('/{reserva}', [ReservasController::class, 'update']);
        Route::patch('/{reserva}/restore', [ReservasController::class, 'restore']);
    });

    Route::middleware('check.permissions:reservas,eliminar')->group(function () {
        Route::delete('/{reserva}', [ReservasController::class, 'destroy']);
    });
});

// Rutas de Rutas - BLOQUE 1
Route::middleware('auth:sanctum')->prefix('rutas')->group(function () {
    Route::get('/', [RutasController::class, 'index']);
    Route::get('/buscar', [RutasController::class, 'buscar']);
    Route::get('/{ruta}', [RutasController::class, 'show']);
    Route::get('/{ruta}/rutas-activas', [RutasController::class, 'rutasActivas']);
    Route::post('/', [RutasController::class, 'store']);
    Route::put('/{ruta}', [RutasController::class, 'update']);
    Route::delete('/{ruta}', [RutasController::class, 'destroy']);
    Route::patch('/{ruta}/restore', [RutasController::class, 'restore']);
    Route::post('/{ruta}/duplicar', [RutasController::class, 'duplicar']);
});

// Rutas de Vehículos - BLOQUE 1
Route::middleware('auth:sanctum')->prefix('vehiculos')->group(function () {
    Route::get('/', [VehiculosController::class, 'index']);
    Route::get('/buscar', [VehiculosController::class, 'buscar']);
    Route::get('/{vehiculo}', [VehiculosController::class, 'show']);
    Route::get('/{vehiculo}/rutas-activas', [VehiculosController::class, 'rutasActivas']);
    Route::get('/{vehiculo}/disponibilidad', [VehiculosController::class, 'verificarDisponibilidad']);
    Route::post('/', [VehiculosController::class, 'store']);
    Route::put('/{vehiculo}', [VehiculosController::class, 'update']);
    Route::delete('/{vehiculo}', [VehiculosController::class, 'destroy']);
    Route::patch('/{vehiculo}/restore', [VehiculosController::class, 'restore']);
    Route::post('/{vehiculo}/duplicar', [VehiculosController::class, 'duplicar']);
});

// Rutas de Servicios - BLOQUE 1
Route::middleware('auth:sanctum')->prefix('servicios')->group(function () {
    Route::get('/', [ServiciosController::class, 'index']);
    Route::get('/buscar', [ServiciosController::class, 'buscar']);
    Route::get('/{servicio}', [ServiciosController::class, 'show']);
    Route::get('/{servicio}/reservas', [ServiciosController::class, 'reservas']);
    Route::get('/{servicio}/disponibilidad', [ServiciosController::class, 'verificarDisponibilidad']);
    Route::post('/', [ServiciosController::class, 'store']);
    Route::post('/{servicio}/calcular-precio', [ServiciosController::class, 'calcularPrecio']);
    Route::post('/{servicio}/duplicar', [ServiciosController::class, 'duplicar']);
    Route::put('/{servicio}', [ServiciosController::class, 'update']);
    Route::delete('/{servicio}', [ServiciosController::class, 'destroy']);
    Route::patch('/{servicio}/restore', [ServiciosController::class, 'restore']);
});


// Rutas de Empleados - BLOQUE 2
Route::middleware('auth:sanctum')->prefix('empleados')->group(function () {
    Route::get('/', [EmpleadosController::class, 'index']);
    Route::get('/buscar', [EmpleadosController::class, 'buscar']);
    Route::get('/por-agencia/{agenciaId}', [EmpleadosController::class, 'porAgencia']);
    Route::get('/cumpleanos/{mes?}', [EmpleadosController::class, 'cumpleanosMes']);
    Route::get('/aniversarios/{mes?}', [EmpleadosController::class, 'aniversariosMes']);
    Route::get('/{empleado}', [EmpleadosController::class, 'show']);
    Route::post('/', [EmpleadosController::class, 'store']);
    Route::put('/{empleado}', [EmpleadosController::class, 'update']);
    Route::delete('/{empleado}', [EmpleadosController::class, 'destroy']);
    Route::patch('/{empleado}/restore', [EmpleadosController::class, 'restore']);
    Route::post('/{empleado}/crear-usuario', [EmpleadosController::class, 'crearUsuario']);
});

// Rutas de Agencias - CORREGIDAS BLOQUE 2
Route::middleware('auth:sanctum')->prefix('agencias')->group(function () {
    // Rutas específicas (requieren al menos "ver")
    Route::middleware('check.permissions:agencias,ver')->group(function () {
        Route::get('/magic-travel', [AgenciasController::class, 'magicTravel']);
        Route::get('/otras', [AgenciasController::class, 'otras']);
        Route::get('/opciones', [AgenciasController::class, 'opciones']);
        Route::get('/buscar', [AgenciasController::class, 'buscar']);
        Route::get('/', [AgenciasController::class, 'index']);
        Route::get('/{agencia}', [AgenciasController::class, 'show']);
        Route::get('/{agencia}/empleados', [AgenciasController::class, 'empleados']);
        Route::get('/{agencia}/rutas', [AgenciasController::class, 'rutas']);
        Route::get('/{agencia}/estadisticas', [AgenciasController::class, 'estadisticas']);
    });

    Route::middleware('check.permissions:agencias,crear')->group(function () {
        Route::post('/', [AgenciasController::class, 'store']);
    });

    Route::middleware('check.permissions:agencias,editar')->group(function () {
        Route::put('/{agencia}', [AgenciasController::class, 'update']);
        Route::patch('/{agencia}/restore', [AgenciasController::class, 'restore']);
    });

    Route::middleware('check.permissions:agencias,eliminar')->group(function () {
        Route::delete('/{agencia}', [AgenciasController::class, 'destroy']);
    });
});

// Rutas de Cargos - BLOQUE 2
Route::middleware('auth:sanctum')->prefix('cargos')->group(function () {
    Route::get('/', [CargosController::class, 'index']);
    Route::get('/buscar', [CargosController::class, 'buscar']);
    Route::get('/jerarquia', [CargosController::class, 'jerarquia']);
    Route::get('/estadisticas', [CargosController::class, 'estadisticas']);
    Route::get('/{cargo}', [CargosController::class, 'show']);
    Route::get('/{cargo}/empleados', [CargosController::class, 'empleados']);
    Route::post('/', [CargosController::class, 'store']);
    Route::put('/{cargo}', [CargosController::class, 'update']);
    Route::delete('/{cargo}', [CargosController::class, 'destroy']);
    Route::patch('/{cargo}/restore', [CargosController::class, 'restore']);
    Route::post('/{cargo}/duplicar', [CargosController::class, 'duplicar']);
});


// Rutas de Estados - BLOQUE 2
Route::middleware('auth:sanctum')->prefix('estados')->group(function () {
    Route::get('/', [EstadosController::class, 'index']);
    Route::get('/buscar', [EstadosController::class, 'buscar']);
    Route::get('/por-tipo/{tipo}', [EstadosController::class, 'porTipo']);
    Route::get('/flujo/{tipo?}', [EstadosController::class, 'flujo']);
    Route::get('/estadisticas-uso', [EstadosController::class, 'estadisticasUso']);
    Route::get('/{estado}', [EstadosController::class, 'show']);
    Route::post('/', [EstadosController::class, 'store']);
    Route::post('/reordenar', [EstadosController::class, 'reordenar']);
    Route::put('/{estado}', [EstadosController::class, 'update']);
    Route::delete('/{estado}', [EstadosController::class, 'destroy']);
    Route::patch('/{estado}/restore', [EstadosController::class, 'restore']);
    Route::post('/{estado}/duplicar', [EstadosController::class, 'duplicar']);
});

// Rutas de Caja - BLOQUE 3
Route::middleware('auth:sanctum')->prefix('caja')->group(function () {
    Route::get('/', [CajaController::class, 'index']);
    Route::get('/buscar', [CajaController::class, 'buscar']);
    Route::get('/resumen', [CajaController::class, 'resumen']);
    Route::get('/{caja}', [CajaController::class, 'show']);
    Route::post('/', [CajaController::class, 'store']);
    Route::put('/{caja}', [CajaController::class, 'update']);
    Route::delete('/{caja}', [CajaController::class, 'destroy']);
});

// Rutas de Egresos - BLOQUE 3
Route::middleware('auth:sanctum')->prefix('egresos')->group(function () {
    Route::get('/', [EgresosController::class, 'index']);
    Route::get('/resumen', [EgresosController::class, 'resumen']);
    Route::get('/tipos-comunes', [EgresosController::class, 'tiposComunes']);
    Route::get('/por-ruta/{rutaActivaId}', [EgresosController::class, 'porRuta']);
    Route::get('/{egreso}', [EgresosController::class, 'show']);
    Route::post('/', [EgresosController::class, 'store']);
    Route::put('/{egreso}', [EgresosController::class, 'update']);
    Route::delete('/{egreso}', [EgresosController::class, 'destroy']);
});

// Rutas de Tours - BLOQUE 3
Route::middleware('auth:sanctum')->prefix('tours')->group(function () {
    Route::get('/', [ToursController::class, 'index']);
    Route::get('/buscar', [ToursController::class, 'buscar']);
    Route::get('/estadisticas', [ToursController::class, 'estadisticas']);
    Route::get('/por-agencia/{agenciaId}', [ToursController::class, 'porAgencia']);
    Route::get('/{tour}', [ToursController::class, 'show']);
    Route::post('/', [ToursController::class, 'store']);
    Route::put('/{tour}', [ToursController::class, 'update']);
    Route::delete('/{tour}', [ToursController::class, 'destroy']);
    Route::patch('/{tour}/restore', [ToursController::class, 'restore']);
    Route::post('/{tour}/duplicar', [ToursController::class, 'duplicar']);
});

// Rutas de Facturas SAT - BLOQUE 3
Route::middleware('auth:sanctum')->prefix('facturas')->group(function () {
    Route::get('/', [FacturasController::class, 'index']);
    Route::get('/buscar', [FacturasController::class, 'buscar']);
    Route::get('/resumen', [FacturasController::class, 'resumen']);
    Route::get('/{factura}', [FacturasController::class, 'show']);
    Route::post('/', [FacturasController::class, 'store']);
    Route::put('/{factura}', [FacturasController::class, 'update']);
    Route::delete('/{factura}', [FacturasController::class, 'destroy']);
    Route::post('/{factura}/enviar-sat', [FacturasController::class, 'enviarSat']);
});

// ================================================================
// BLOQUE 4 FINAL - RECURSOS Y UTILIDADES
// ================================================================

// Rutas de Dashboard - BLOQUE 4
Route::middleware('auth:sanctum')->prefix('dashboard')->group(function () {
    Route::get('/metricas', [DashboardController::class, 'metricas']);
    Route::get('/estadisticas', [DashboardController::class, 'estadisticas']);
    Route::get('/alertas', [DashboardController::class, 'alertas']);
    Route::get('/actividad-reciente', [DashboardController::class, 'actividadReciente']);
});

// Rutas de Utils - BLOQUE 4
Route::middleware('auth:sanctum')->prefix('utils')->group(function () {
    Route::get('/catalogos', [UtilsController::class, 'catalogos']);
    Route::get('/opciones/{tipo}', [UtilsController::class, 'opciones']);
    Route::get('/info-sistema', [UtilsController::class, 'infoSistema']);
    Route::post('/validar-nit', [UtilsController::class, 'validarNit']);
    Route::post('/numero-a-letras', [UtilsController::class, 'numeroALetras']);
    Route::post('/generar-codigo', [UtilsController::class, 'generarCodigo']);
});

// Rutas de Notificaciones - BLOQUE 4
Route::middleware('auth:sanctum')->prefix('notificaciones')->group(function () {
    Route::get('/', [NotificacionesController::class, 'index']);
    Route::get('/alertas-criticas', [NotificacionesController::class, 'alertasCriticas']);
    Route::get('/{categoria}', [NotificacionesController::class, 'porCategoria']);
});

// Rutas de Auditoría - BLOQUE 4
Route::middleware('auth:sanctum')->prefix('auditoria')->group(function () {
    Route::get('/actividades', [AuditoriaController::class, 'actividades']);
    Route::get('/estadisticas-uso', [AuditoriaController::class, 'estadisticasUso']);
    Route::get('/eventos-seguridad', [AuditoriaController::class, 'eventosSeguridd']);
    Route::get('/trazabilidad/{tabla}/{registro_id}', [AuditoriaController::class, 'trazabilidad']);
    Route::get('/backups', [AuditoriaController::class, 'backups']);
    Route::get('/cumplimiento', [AuditoriaController::class, 'cumplimiento']);
});

// Ruta para sincronizar permisos cuando se crea un nuevo módulo
Route::post('/dev/sync-permissions', function () {
    \App\Observers\UsuarioObserver::sincronizarPermisosExistentes();
    return response()->json(['message' => 'Permisos sincronizados para todos los usuarios']);
});

// Manejar preflight OPTIONS requests
Route::options('{any}', function () {
    return response('', 200);
})->where('any', '.*');
// ================================================================
// Total: 20 Controladores | 150+ Endpoints | Sistema Completo
// ================================================================
