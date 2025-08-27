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
use App\Http\Controllers\Api\FacturaController;

/*
|--------------------------------------------------------------------------
| Magic Travel API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('magic')->middleware(['api'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | TIPO PERSONA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('tipos-persona')->group(function () {
        Route::get('/', [TipoPersonaController::class, 'index']);
        Route::post('/', [TipoPersonaController::class, 'store']);
        Route::get('/stats', [TipoPersonaController::class, 'stats']);
        Route::get('/empleados', [TipoPersonaController::class, 'empleados']);
        Route::get('/codigo/{codigo}', [TipoPersonaController::class, 'byCode']);
        Route::get('/{tipoPersona}', [TipoPersonaController::class, 'show']);
        Route::put('/{tipoPersona}', [TipoPersonaController::class, 'update']);
        Route::delete('/{tipoPersona}', [TipoPersonaController::class, 'destroy']);
        Route::patch('/{tipoPersona}/activate', [TipoPersonaController::class, 'activate']);
        Route::patch('/{tipoPersona}/deactivate', [TipoPersonaController::class, 'deactivate']);
    });

    /*
    |--------------------------------------------------------------------------
    | ROL ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('roles')->group(function () {
        Route::get('/', [RolController::class, 'index']);
        Route::post('/', [RolController::class, 'store']);
        Route::get('/stats', [RolController::class, 'stats']);
        Route::get('/jerarquia', [RolController::class, 'jerarquia']);
        Route::post('/check-access', [RolController::class, 'checkAccess']);
        Route::get('/codigo/{codigo}', [RolController::class, 'byCode']);
        Route::get('/{rol}', [RolController::class, 'show']);
        Route::put('/{rol}', [RolController::class, 'update']);
        Route::delete('/{rol}', [RolController::class, 'destroy']);
        Route::patch('/{rol}/activate', [RolController::class, 'activate']);
        Route::patch('/{rol}/deactivate', [RolController::class, 'deactivate']);
        Route::get('/{rol}/permissions', [RolController::class, 'permissions']);
    });

    /*
    |--------------------------------------------------------------------------
    | ESTADO ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('estados')->group(function () {
        Route::get('/', [EstadoController::class, 'index']);
        Route::post('/', [EstadoController::class, 'store']);
        Route::get('/stats', [EstadoController::class, 'stats']);
        Route::get('/iniciales', [EstadoController::class, 'iniciales']);
        Route::get('/finales', [EstadoController::class, 'finales']);
        Route::post('/validar-transicion', [EstadoController::class, 'validarTransicion']);
        Route::get('/categoria/{categoria}', [EstadoController::class, 'byCategoria']);
        Route::get('/codigo/{codigo}', [EstadoController::class, 'byCode']);
        Route::get('/{estado}', [EstadoController::class, 'show']);
        Route::put('/{estado}', [EstadoController::class, 'update']);
        Route::delete('/{estado}', [EstadoController::class, 'destroy']);
        Route::get('/{estado}/transiciones', [EstadoController::class, 'transiciones']);
    });

    /*
    |--------------------------------------------------------------------------
    | SERVICIO ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('servicios')->group(function () {
        Route::get('/', [ServicioController::class, 'index']);
        Route::post('/', [ServicioController::class, 'store']);
        Route::get('/stats', [ServicioController::class, 'stats']);
        Route::get('/populares', [ServicioController::class, 'populares']);
        Route::get('/tipo/{tipo}', [ServicioController::class, 'porTipo']);
        Route::get('/{servicio}', [ServicioController::class, 'show']);
        Route::put('/{servicio}', [ServicioController::class, 'update']);
        Route::delete('/{servicio}', [ServicioController::class, 'destroy']);
        Route::patch('/{servicio}/activate', [ServicioController::class, 'activate']);
        Route::patch('/{servicio}/deactivate', [ServicioController::class, 'deactivate']);
        Route::post('/{servicio}/calcular-precio', [ServicioController::class, 'calcularPrecio']);
        Route::post('/{servicio}/duplicar', [ServicioController::class, 'duplicar']);
    });

    /*
    |--------------------------------------------------------------------------
    | RUTA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('rutas')->group(function () {
        Route::get('/', [RutaController::class, 'index']);
        Route::post('/', [RutaController::class, 'store']);
        Route::get('/stats', [RutaController::class, 'stats']);
        Route::get('/populares', [RutaController::class, 'populares']);
        Route::get('/origenes', [RutaController::class, 'origenes']);
        Route::get('/destinos', [RutaController::class, 'destinos']);
        Route::get('/tipo/{tipo}', [RutaController::class, 'porTipo']);
        Route::get('/origen/{origen}', [RutaController::class, 'buscarPorOrigen']);
        Route::get('/destino/{destino}', [RutaController::class, 'buscarPorDestino']);
        Route::get('/{ruta}', [RutaController::class, 'show']);
        Route::put('/{ruta}', [RutaController::class, 'update']);
        Route::delete('/{ruta}', [RutaController::class, 'destroy']);
        Route::patch('/{ruta}/activate', [RutaController::class, 'activate']);
        Route::patch('/{ruta}/deactivate', [RutaController::class, 'deactivate']);
        Route::get('/{ruta}/inversa', [RutaController::class, 'buscarInversa']);
    });

    /*
    |--------------------------------------------------------------------------
    | AGENCIA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('agencias')->group(function () {
        Route::get('/', [AgenciaController::class, 'index']);
        Route::post('/', [AgenciaController::class, 'store']);
        Route::get('/stats', [AgenciaController::class, 'stats']);
        Route::get('/vip', [AgenciaController::class, 'vip']);
        Route::get('/inactivas', [AgenciaController::class, 'inactivas']);
        Route::get('/ranking', [AgenciaController::class, 'ranking']);
        Route::get('/{agencia}', [AgenciaController::class, 'show']);
        Route::put('/{agencia}', [AgenciaController::class, 'update']);
        Route::delete('/{agencia}', [AgenciaController::class, 'destroy']);
        Route::patch('/{agencia}/activate', [AgenciaController::class, 'activate']);
        Route::patch('/{agencia}/deactivate', [AgenciaController::class, 'deactivate']);
        Route::get('/{agencia}/estadisticas', [AgenciaController::class, 'estadisticasComerciales']);
        Route::get('/{agencia}/reservas-recientes', [AgenciaController::class, 'reservasRecientes']);
    });

    /*
    |--------------------------------------------------------------------------
    | PERSONA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('personas')->group(function () {
        Route::get('/', [PersonaController::class, 'index']);
        Route::post('/', [PersonaController::class, 'store']);
        Route::get('/stats', [PersonaController::class, 'stats']);
        Route::get('/empleados', [PersonaController::class, 'empleados']);
        Route::get('/clientes', [PersonaController::class, 'clientes']);
        Route::get('/vendedores', [PersonaController::class, 'vendedores']);
        Route::get('/choferes', [PersonaController::class, 'choferes']);
        Route::get('/sin-usuario', [PersonaController::class, 'sinUsuario']);
        Route::get('/{persona}', [PersonaController::class, 'show']);
        Route::put('/{persona}', [PersonaController::class, 'update']);
        Route::delete('/{persona}', [PersonaController::class, 'destroy']);
        Route::patch('/{persona}/activate', [PersonaController::class, 'activate']);
        Route::patch('/{persona}/deactivate', [PersonaController::class, 'deactivate']);
        Route::get('/{persona}/validar-datos', [PersonaController::class, 'validarDatos']);
        Route::get('/{persona}/whatsapp-link', [PersonaController::class, 'whatsappLink']);
        Route::post('/{persona}/generar-codigo', [PersonaController::class, 'generarCodigo']);
    });

    /*
    |--------------------------------------------------------------------------
    | VEHICULO ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('vehiculos')->group(function () {
        Route::get('/', [VehiculoController::class, 'index']);
        Route::post('/', [VehiculoController::class, 'store']);
        Route::get('/stats', [VehiculoController::class, 'stats']);
        Route::get('/disponibles', [VehiculoController::class, 'disponibles']);
        Route::get('/capacidad/{capacidad}', [VehiculoController::class, 'porCapacidad']);
        Route::get('/{vehiculo}', [VehiculoController::class, 'show']);
        Route::put('/{vehiculo}', [VehiculoController::class, 'update']);
        Route::delete('/{vehiculo}', [VehiculoController::class, 'destroy']);
        Route::patch('/{vehiculo}/cambiar-estado', [VehiculoController::class, 'cambiarEstado']);
        Route::patch('/{vehiculo}/disponible', [VehiculoController::class, 'marcarDisponible']);
        Route::patch('/{vehiculo}/ocupado', [VehiculoController::class, 'marcarOcupado']);
        Route::patch('/{vehiculo}/mantenimiento', [VehiculoController::class, 'marcarMantenimiento']);
        Route::post('/{vehiculo}/verificar-disponibilidad', [VehiculoController::class, 'verificarDisponibilidad']);
        Route::get('/{vehiculo}/aptitud-servicios', [VehiculoController::class, 'aptitudServicios']);
        Route::get('/{vehiculo}/rendimiento', [VehiculoController::class, 'rendimiento']);
    });

    /*
    |--------------------------------------------------------------------------
    | CONTACTO AGENCIA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('contactos-agencia')->group(function () {
        Route::get('/', [ContactoAgenciaController::class, 'index']);
        Route::post('/', [ContactoAgenciaController::class, 'store']);
        Route::get('/stats', [ContactoAgenciaController::class, 'stats']);
        Route::get('/gerentes', [ContactoAgenciaController::class, 'gerentes']);
        Route::get('/principales', [ContactoAgenciaController::class, 'principales']);
        Route::get('/agencia/{agenciaId}', [ContactoAgenciaController::class, 'porAgencia']);
        Route::get('/{contactoAgencia}', [ContactoAgenciaController::class, 'show']);
        Route::put('/{contactoAgencia}', [ContactoAgenciaController::class, 'update']);
        Route::delete('/{contactoAgencia}', [ContactoAgenciaController::class, 'destroy']);
        Route::patch('/{contactoAgencia}/activate', [ContactoAgenciaController::class, 'activate']);
        Route::patch('/{contactoAgencia}/deactivate', [ContactoAgenciaController::class, 'deactivate']);
        Route::get('/{contactoAgencia}/whatsapp-link', [ContactoAgenciaController::class, 'whatsappLink']);
        Route::get('/{contactoAgencia}/mensaje-presentacion', [ContactoAgenciaController::class, 'mensajePresentacion']);
        Route::post('/{contactoAgencia}/mensaje-confirmacion-reserva', [ContactoAgenciaController::class, 'mensajeConfirmacionReserva']);
        Route::get('/{contactoAgencia}/validar-datos', [ContactoAgenciaController::class, 'validarDatos']);
        Route::post('/{contactoAgencia}/generar-codigo', [ContactoAgenciaController::class, 'generarCodigo']);
    });

    /*
    |--------------------------------------------------------------------------
    | USUARIO ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('usuarios')->group(function () {
        Route::get('/', [UsuarioController::class, 'index']);
        Route::post('/', [UsuarioController::class, 'store']);
        Route::get('/stats', [UsuarioController::class, 'stats']);
        Route::get('/administradores', [UsuarioController::class, 'administradores']);
        Route::get('/vendedores', [UsuarioController::class, 'vendedores']);
        Route::get('/choferes', [UsuarioController::class, 'choferes']);
        Route::get('/{usuario}', [UsuarioController::class, 'show']);
        Route::put('/{usuario}', [UsuarioController::class, 'update']);
        Route::delete('/{usuario}', [UsuarioController::class, 'destroy']);
        Route::patch('/{usuario}/activate', [UsuarioController::class, 'activate']);
        Route::patch('/{usuario}/deactivate', [UsuarioController::class, 'deactivate']);
        Route::patch('/{usuario}/cambiar-password', [UsuarioController::class, 'cambiarPassword']);
        Route::patch('/{usuario}/reset-password', [UsuarioController::class, 'resetPassword']);
        Route::get('/{usuario}/rendimiento-vendedor', [UsuarioController::class, 'rendimientoVendedor']);
        Route::get('/{usuario}/rutas-chofer', [UsuarioController::class, 'rutasChofer']);
        Route::post('/{usuario}/verificar-permisos', [UsuarioController::class, 'verificarPermisos']);
        Route::post('/{usuario}/generar-codigo', [UsuarioController::class, 'generarCodigo']);
    });

    /*
    |--------------------------------------------------------------------------
    | RUTA ACTIVADA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('rutas-activadas')->group(function () {
        Route::get('/', [RutaActivadaController::class, 'index']);
        Route::post('/', [RutaActivadaController::class, 'store']);
        Route::get('/stats', [RutaActivadaController::class, 'stats']);
        Route::get('/hoy', [RutaActivadaController::class, 'hoy']);
        Route::get('/programadas', [RutaActivadaController::class, 'programadas']);
        Route::get('/disponibles', [RutaActivadaController::class, 'disponibles']);
        Route::get('/chofer/{choferId}', [RutaActivadaController::class, 'porChofer']);
        Route::get('/{rutaActivada}', [RutaActivadaController::class, 'show']);
        Route::put('/{rutaActivada}', [RutaActivadaController::class, 'update']);
        Route::delete('/{rutaActivada}', [RutaActivadaController::class, 'destroy']);
        Route::patch('/{rutaActivada}/cambiar-estado', [RutaActivadaController::class, 'cambiarEstado']);
        Route::patch('/{rutaActivada}/iniciar', [RutaActivadaController::class, 'iniciar']);
        Route::patch('/{rutaActivada}/finalizar', [RutaActivadaController::class, 'finalizar']);
        Route::patch('/{rutaActivada}/cancelar', [RutaActivadaController::class, 'cancelar']);
        Route::post('/{rutaActivada}/verificar-capacidad', [RutaActivadaController::class, 'verificarCapacidad']);
        Route::get('/{rutaActivada}/resumen-operativo', [RutaActivadaController::class, 'resumenOperativo']);
    });

    /*
    |--------------------------------------------------------------------------
    | RESERVA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('reservas')->group(function () {
        Route::get('/', [ReservaController::class, 'index']);
        Route::post('/', [ReservaController::class, 'store']);
        Route::get('/stats', [ReservaController::class, 'stats']);
        Route::get('/hoy', [ReservaController::class, 'hoy']);
        Route::get('/pendientes', [ReservaController::class, 'pendientes']);
        Route::get('/confirmadas', [ReservaController::class, 'confirmadas']);
        Route::get('/vendedor/{vendedorId}', [ReservaController::class, 'porVendedor']);
        Route::get('/agencia/{agenciaId}', [ReservaController::class, 'porAgencia']);
        Route::post('/buscar-cliente', [ReservaController::class, 'buscarCliente']);
        Route::get('/{reserva}', [ReservaController::class, 'show']);
        Route::put('/{reserva}', [ReservaController::class, 'update']);
        Route::delete('/{reserva}', [ReservaController::class, 'destroy']);
        Route::patch('/{reserva}/cambiar-estado', [ReservaController::class, 'cambiarEstado']);
        Route::patch('/{reserva}/confirmar', [ReservaController::class, 'confirmar']);
        Route::patch('/{reserva}/ejecutar', [ReservaController::class, 'ejecutar']);
        Route::patch('/{reserva}/finalizar', [ReservaController::class, 'finalizar']);
        Route::patch('/{reserva}/cancelar', [ReservaController::class, 'cancelar']);
        Route::get('/{reserva}/calcular-monto', [ReservaController::class, 'calcularMonto']);
        Route::get('/{reserva}/whatsapp-confirmacion', [ReservaController::class, 'whatsappConfirmacion']);
        Route::get('/{reserva}/validar-datos', [ReservaController::class, 'validarDatos']);
        Route::get('/{reserva}/resumen-completo', [ReservaController::class, 'resumenCompleto']);
        Route::post('/{reserva}/duplicar', [ReservaController::class, 'duplicar']);
    });

    /*
    |--------------------------------------------------------------------------
    | FACTURA ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('facturas')->group(function () {
        Route::get('/', [FacturaController::class, 'index']);
        Route::post('/', [FacturaController::class, 'store']);
        Route::get('/stats', [FacturaController::class, 'stats']);
        Route::get('/hoy', [FacturaController::class, 'hoy']);
        Route::get('/sin-archivo', [FacturaController::class, 'sinArchivo']);
        Route::get('/mes/{mes?}/{anio?}', [FacturaController::class, 'delMes']);
        Route::get('/usuario/{usuarioId}', [FacturaController::class, 'porUsuario']);
        Route::get('/reporte-mensual', [FacturaController::class, 'reporteMensual']);
        Route::get('/{factura}', [FacturaController::class, 'show']);
        Route::put('/{factura}', [FacturaController::class, 'update']);
        Route::delete('/{factura}', [FacturaController::class, 'destroy']);
        Route::patch('/{factura}/anular', [FacturaController::class, 'anular']);
        Route::patch('/{factura}/establecer-archivo', [FacturaController::class, 'establecerArchivo']);
        Route::get('/{factura}/validar-integridad', [FacturaController::class, 'validarIntegridad']);
        Route::get('/{factura}/generar-nombre-archivo', [FacturaController::class, 'generarNombreArchivo']);
        Route::get('/{factura}/resumen-completo', [FacturaController::class, 'resumenCompleto']);
    });

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD & GENERAL ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats-generales', function () {
            return response()->json([
                'usuarios_activos' => \App\Models\Usuario::activo()->count(),
                'reservas_hoy' => \App\Models\Reserva::hoy()->count(),
                'rutas_activas' => \App\Models\RutaActivada::programadas()->count() + \App\Models\RutaActivada::iniciadas()->count(),
                'vehiculos_disponibles' => \App\Models\Vehiculo::disponibles()->count(),
                'ingresos_mes' => \App\Models\Reserva::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->sum('reserva_monto'),
                'ocupacion_promedio' => \App\Models\RutaActivada::activo()
                    ->get()
                    ->avg(function ($ruta) {
                        return $ruta->porcentaje_ocupacion;
                    })
            ]);
        });

        Route::get('/alertas', function () {
            return response()->json([
                'reservas_pendientes' => \App\Models\Reserva::pendientes()->count(),
                'vehiculos_mantenimiento' => \App\Models\Vehiculo::enMantenimiento()->count(),
                'rutas_casi_llenas' => \App\Models\RutaActivada::activo()
                    ->get()
                    ->filter(function ($ruta) {
                        return $ruta->estaCasiLlena();
                    })
                    ->count(),
                'agencias_inactivas' => \App\Models\Agencia::activo()
                    ->whereDoesntHave('reservas', function ($q) {
                        $q->where('created_at', '>=', now()->subMonths(2));
                    })
                    ->count()
            ]);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | HEALTH CHECK
    |--------------------------------------------------------------------------
    */
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'version' => '2.0',
            'database' => 'connected'
        ]);
    });
});

/*
|--------------------------------------------------------------------------
| User Authentication Route
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
