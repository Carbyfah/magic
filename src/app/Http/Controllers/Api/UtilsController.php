<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agencia;
use App\Models\Cargo;
use App\Models\Estado;
use App\Models\Vehiculo;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UtilsController extends Controller
{
    /**
     * Catálogos generales del sistema
     * GET /api/utils/catalogos
     */
    public function catalogos(): JsonResponse
    {
        try {
            $catalogos = [
                'agencias' => Agencia::where('agencias_activa', true)
                    ->orderBy('agencias_nombre')
                    ->get(['id_agencias as id', 'agencias_nombre as nombre', 'agencias_codigo as codigo']),

                'cargos' => Cargo::where('cargo_activo', true)
                    ->orderBy('cargo_nivel_jerarquico')
                    ->orderBy('cargo_nombre')
                    ->get(['id_cargo as id', 'cargo_nombre as nombre', 'cargo_nivel_jerarquico as nivel']),

                'estados' => Estado::where('estado_activo', true)
                    ->orderBy('estado_tipo')
                    ->orderBy('estado_orden')
                    ->get(['estado_id as id', 'estado_nombre as nombre', 'estado_tipo as tipo', 'estado_color as color']),

                'vehiculos' => Vehiculo::where('vehiculo_activo', true)
                    ->orderBy('vehiculo_placa')
                    ->get(['id_vehiculos as id', 'vehiculo_placa as placa', 'vehiculo_marca as marca', 'vehiculo_capacidad as capacidad']),

                'empleados' => Empleado::where('empleados_activo', true)
                    ->with(['agencia:id_agencias,agencias_nombre', 'cargo:id_cargo,cargo_nombre'])
                    ->orderBy('empleados_nombres')
                    ->get()
                    ->map(function ($empleado) {
                        return [
                            'id' => $empleado->id_empleados,
                            'nombre_completo' => $empleado->empleados_nombres . ' ' . $empleado->empleados_apellidos,
                            'agencia' => $empleado->agencia->agencias_nombre ?? null,
                            'cargo' => $empleado->cargo->cargo_nombre ?? null,
                        ];
                    })
            ];

            return response()->json([
                'success' => true,
                'data' => $catalogos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo catálogos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Opciones para formularios
     * GET /api/utils/opciones/{tipo}
     */
    public function opciones($tipo): JsonResponse
    {
        try {
            $opciones = [];

            switch ($tipo) {
                case 'tipos-egreso':
                    $opciones = [
                        'Combustible',
                        'Mantenimiento',
                        'Peajes',
                        'Alimentación',
                        'Hospedaje',
                        'Parqueos',
                        'Otros gastos'
                    ];
                    break;

                case 'tipos-estado':
                    $opciones = [
                        'Reserva',
                        'Ruta Activa',
                        'General',
                        'Empleado',
                        'Vehículo'
                    ];
                    break;

                case 'marcas-vehiculo':
                    $opciones = [
                        'Toyota',
                        'Nissan',
                        'Hyundai',
                        'Kia',
                        'Chevrolet',
                        'Ford',
                        'Volkswagen',
                        'Honda',
                        'Mazda',
                        'Mitsubishi',
                        'Suzuki',
                        'Isuzu',
                        'Mercedes-Benz',
                        'Volvo',
                        'Otros'
                    ];
                    break;

                case 'colores-vehiculo':
                    $opciones = [
                        'Blanco',
                        'Negro',
                        'Plata',
                        'Gris',
                        'Azul',
                        'Rojo',
                        'Verde',
                        'Amarillo',
                        'Café',
                        'Naranja'
                    ];
                    break;

                case 'duraciones-tour':
                    $opciones = [
                        'Medio día',
                        'Día completo',
                        '2 días',
                        '3 días',
                        '1 semana',
                        '2 semanas',
                        'Personalizado'
                    ];
                    break;

                case 'tipos-agencia':
                    $opciones = [
                        'Agencia de Viajes',
                        'Tour Operador',
                        'Transporte Turístico',
                        'Oficina Principal',
                        'Sucursal'
                    ];
                    break;

                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Tipo de opciones no válido'
                    ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $opciones
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo opciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar NIT guatemalteco
     * POST /api/utils/validar-nit
     */
    public function validarNit(Request $request): JsonResponse
    {
        $request->validate([
            'nit' => 'required|string'
        ]);

        try {
            $nit = preg_replace('/[^0-9K]/', '', strtoupper($request->nit));

            $esValido = $this->validarFormatoNitGuatemalteco($nit);

            return response()->json([
                'success' => true,
                'data' => [
                    'nit_original' => $request->nit,
                    'nit_limpio' => $nit,
                    'nit_formateado' => $this->formatearNit($nit),
                    'es_valido' => $esValido,
                    'mensaje' => $esValido ? 'NIT válido' : 'Formato de NIT inválido'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error validando NIT: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convertir números a letras (para facturas)
     * POST /api/utils/numero-a-letras
     */
    public function numeroALetras(Request $request): JsonResponse
    {
        $request->validate([
            'numero' => 'required|numeric|min:0|max:999999.99'
        ]);

        try {
            $numero = floatval($request->numero);
            $letras = $this->convertirNumeroALetras($numero);

            return response()->json([
                'success' => true,
                'data' => [
                    'numero' => $numero,
                    'numero_formateado' => 'Q' . number_format($numero, 2),
                    'en_letras' => $letras
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error convirtiendo número: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Información del sistema
     * GET /api/utils/info-sistema
     */
    public function infoSistema(): JsonResponse
    {
        try {
            $info = [
                'sistema' => [
                    'nombre' => 'Magic Travel API',
                    'version' => '1.0.0',
                    'entorno' => app()->environment(),
                    'fecha_actual' => now()->format('Y-m-d H:i:s'),
                    'timezone' => config('app.timezone'),
                ],
                'base_datos' => [
                    'conexion' => config('database.default'),
                    'driver' => config('database.connections.' . config('database.default') . '.driver'),
                ],
                'configuracion' => [
                    'debug' => config('app.debug'),
                    'locale' => config('app.locale'),
                    'url' => config('app.url'),
                ],
                'estadisticas_rapidas' => [
                    'total_agencias' => Agencia::count(),
                    'total_empleados' => Empleado::count(),
                    'total_vehiculos' => Vehiculo::count(),
                    'total_estados' => Estado::count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $info
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo información: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar código único
     * POST /api/utils/generar-codigo
     */
    public function generarCodigo(Request $request): JsonResponse
    {
        $request->validate([
            'tipo' => 'required|string|in:reserva,factura,empleado,vehiculo',
            'prefijo' => 'nullable|string|max:5'
        ]);

        try {
            $tipo = $request->tipo;
            $prefijo = $request->prefijo ?? strtoupper(substr($tipo, 0, 3));

            $codigo = $prefijo . '-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            return response()->json([
                'success' => true,
                'data' => [
                    'codigo' => $codigo,
                    'tipo' => $tipo,
                    'prefijo' => $prefijo,
                    'timestamp' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generando código: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar formato de NIT guatemalteco
     */
    private function validarFormatoNitGuatemalteco($nit): bool
    {
        return preg_match('/^[0-9]{1,8}[0-9K]$/', $nit);
    }

    /**
     * Formatear NIT
     */
    private function formatearNit($nit): string
    {
        if (strlen($nit) >= 2) {
            return substr($nit, 0, -1) . '-' . substr($nit, -1);
        }
        return $nit;
    }

    /**
     * Convertir número a letras (versión básica)
     */
    private function convertirNumeroALetras($numero): string
    {
        $entero = floor($numero);
        $decimales = round(($numero - $entero) * 100);

        // Implementación básica - en producción usar una librería completa
        $unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        $decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        $centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

        if ($entero == 0) {
            $letras = 'cero';
        } elseif ($entero < 10) {
            $letras = $unidades[$entero];
        } elseif ($entero < 100) {
            $letras = $decenas[floor($entero / 10)] . ($entero % 10 > 0 ? ' y ' . $unidades[$entero % 10] : '');
        } else {
            $letras = 'número muy grande para convertir';
        }

        $resultado = ucfirst($letras) . ' quetzales';

        if ($decimales > 0) {
            $resultado .= ' con ' . $decimales . '/100';
        } else {
            $resultado .= ' exactos';
        }

        return $resultado;
    }
}
