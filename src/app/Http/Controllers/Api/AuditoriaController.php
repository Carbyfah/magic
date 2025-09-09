<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Font;
use Illuminate\Http\Response;

class AuditoriaController extends Controller
{
    /**
     * Listar todas las auditorías con filtros MEJORADOS
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $tabla = $request->get('tabla');
            $accion = $request->get('accion');
            $usuario = $request->get('usuario_id');
            $fechaInicio = $request->get('fecha_inicio');
            $fechaFin = $request->get('fecha_fin');
            $busqueda = $request->get('busqueda');

            // Lista de tablas de auditoría disponibles
            $tablasAuditoria = [
                'tipo_persona_auditoria',
                'rol_auditoria',
                'estado_auditoria',
                'servicio_auditoria',
                'ruta_auditoria',
                'agencia_auditoria',
                'persona_auditoria',
                'vehiculo_auditoria',
                'contactos_agencia_auditoria',
                'usuario_auditoria',
                'ruta_activada_auditoria',
                'reserva_auditoria'
            ];

            $auditorias = collect();

            // Si se especifica una tabla, buscar solo en esa
            if ($tabla && in_array($tabla . '_auditoria', $tablasAuditoria)) {
                $auditorias = $this->obtenerAuditoriasPorTabla($tabla . '_auditoria', $accion, $usuario, $fechaInicio, $fechaFin, $busqueda);
            } else {
                // Buscar en todas las tablas y combinar
                foreach ($tablasAuditoria as $tablaAud) {
                    $auds = $this->obtenerAuditoriasPorTabla($tablaAud, $accion, $usuario, $fechaInicio, $fechaFin, $busqueda);
                    $auditorias = $auditorias->concat($auds);
                }
            }

            // Ordenar por fecha más reciente
            $auditorias = $auditorias->sortByDesc('fecha_modificacion')->values();

            // Paginación manual
            $total = $auditorias->count();
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;
            $items = $auditorias->slice($offset, $perPage)->values();

            return response()->json([
                'success' => true,
                'data' => $items,
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener auditorías: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de auditoría
     */
    public function stats()
    {
        try {
            $stats = [
                'total_registros' => 0,
                'acciones_por_tipo' => [],
                'actividad_por_tabla' => [],
                'usuarios_mas_activos' => [],
                'actividad_ultimo_mes' => []
            ];

            $tablasAuditoria = [
                'tipo_persona_auditoria' => 'Tipos Persona',
                'rol_auditoria' => 'Roles',
                'estado_auditoria' => 'Estados',
                'servicio_auditoria' => 'Servicios',
                'ruta_auditoria' => 'Rutas',
                'agencia_auditoria' => 'Agencias',
                'persona_auditoria' => 'Personas',
                'vehiculo_auditoria' => 'Vehículos',
                'contactos_agencia_auditoria' => 'Contactos Agencia',
                'usuario_auditoria' => 'Usuarios',
                'ruta_activada_auditoria' => 'Rutas Activadas',
                'reserva_auditoria' => 'Reservas'
            ];

            // Contar total de registros y por tabla
            foreach ($tablasAuditoria as $tabla => $nombre) {
                $count = DB::table($tabla)->count();
                $stats['total_registros'] += $count;
                $stats['actividad_por_tabla'][$nombre] = $count;
            }

            // Acciones por tipo (agregado de todas las tablas)
            $acciones = ['INSERT', 'UPDATE', 'DELETE'];
            foreach ($acciones as $accion) {
                $total = 0;
                foreach (array_keys($tablasAuditoria) as $tabla) {
                    $total += DB::table($tabla)->where('accion', $accion)->count();
                }
                $stats['acciones_por_tipo'][$accion] = $total;
            }

            // Top 5 usuarios más activos
            $usuariosActivos = collect();
            foreach (array_keys($tablasAuditoria) as $tabla) {
                $usuarios = DB::table($tabla)
                    ->select('usuario_modificacion')
                    ->selectRaw('COUNT(*) as total_acciones')
                    ->groupBy('usuario_modificacion')
                    ->get();
                $usuariosActivos = $usuariosActivos->concat($usuarios);
            }

            $stats['usuarios_mas_activos'] = $usuariosActivos
                ->groupBy('usuario_modificacion')
                ->map(function ($grupo) {
                    return [
                        'usuario_id' => $grupo->first()->usuario_modificacion,
                        'total_acciones' => $grupo->sum('total_acciones')
                    ];
                })
                ->sortByDesc('total_acciones')
                ->take(5)
                ->values();

            // Actividad último mes por día
            $fechaInicio = Carbon::now()->subMonth()->startOfDay();
            for ($i = 0; $i < 30; $i++) {
                $fecha = $fechaInicio->copy()->addDays($i);
                $totalDia = 0;

                foreach (array_keys($tablasAuditoria) as $tabla) {
                    $totalDia += DB::table($tabla)
                        ->whereDate('fecha_modificacion', $fecha->format('Y-m-d'))
                        ->count();
                }

                $stats['actividad_ultimo_mes'][] = [
                    'fecha' => $fecha->format('Y-m-d'),
                    'total_acciones' => $totalDia
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener auditorías de una tabla específica
     */
    public function porTabla($tabla, Request $request)
    {
        try {
            $tablaAuditoria = $tabla . '_auditoria';
            $perPage = $request->get('per_page', 15);
            $accion = $request->get('accion');
            $usuario = $request->get('usuario_id');
            $fechaInicio = $request->get('fecha_inicio');
            $fechaFin = $request->get('fecha_fin');
            $busqueda = $request->get('busqueda');

            $auditorias = $this->obtenerAuditoriasPorTabla($tablaAuditoria, $accion, $usuario, $fechaInicio, $fechaFin, $busqueda);

            // Paginación
            $total = $auditorias->count();
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;
            $items = $auditorias->slice($offset, $perPage)->values();

            return response()->json([
                'success' => true,
                'data' => $items,
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener auditorías de tabla: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener auditorías por usuario
     */
    public function porUsuario($usuarioId, Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $tabla = $request->get('tabla');
            $accion = $request->get('accion');
            $fechaInicio = $request->get('fecha_inicio');
            $fechaFin = $request->get('fecha_fin');
            $busqueda = $request->get('busqueda');

            $tablasAuditoria = [
                'tipo_persona_auditoria',
                'rol_auditoria',
                'estado_auditoria',
                'servicio_auditoria',
                'ruta_auditoria',
                'agencia_auditoria',
                'persona_auditoria',
                'vehiculo_auditoria',
                'contactos_agencia_auditoria',
                'usuario_auditoria',
                'ruta_activada_auditoria',
                'reserva_auditoria'
            ];

            $auditorias = collect();

            if ($tabla && in_array($tabla . '_auditoria', $tablasAuditoria)) {
                $auds = $this->obtenerAuditoriasPorTabla($tabla . '_auditoria', $accion, $usuarioId, $fechaInicio, $fechaFin, $busqueda);
                $auditorias = $auditorias->concat($auds);
            } else {
                foreach ($tablasAuditoria as $tablaAud) {
                    $auds = $this->obtenerAuditoriasPorTabla($tablaAud, $accion, $usuarioId, $fechaInicio, $fechaFin, $busqueda);
                    $auditorias = $auditorias->concat($auds);
                }
            }

            $auditorias = $auditorias->sortByDesc('fecha_modificacion')->values();

            // Paginación
            $total = $auditorias->count();
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;
            $items = $auditorias->slice($offset, $perPage)->values();

            return response()->json([
                'success' => true,
                'data' => $items,
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener auditorías del usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar detalles de una auditoría específica
     */
    public function show($tabla, $auditoriaId)
    {
        try {
            $tablaAuditoria = $tabla . '_auditoria';

            $auditoria = DB::table($tablaAuditoria)
                ->where('auditoria_id', $auditoriaId)
                ->first();

            if (!$auditoria) {
                return response()->json([
                    'success' => false,
                    'message' => 'Auditoría no encontrada'
                ], 404);
            }

            // Convertir a array para manipular
            $auditoria = (array) $auditoria;
            $auditoria['tabla'] = $tabla;

            return response()->json([
                'success' => true,
                'data' => $auditoria
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles de auditoría: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar reporte de auditoría en Excel - NUEVA FUNCIONALIDAD
     */
    public function reporteExcel(Request $request)
    {
        try {
            $request->validate([
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
                'tabla' => 'nullable|string',
                'accion' => 'nullable|in:INSERT,UPDATE,DELETE',
                'usuario_id' => 'nullable|integer',
                'tipo_reporte' => 'nullable|in:resumen,detallado,por_usuario,por_tabla'
            ]);

            $tipoReporte = $request->get('tipo_reporte', 'resumen');

            switch ($tipoReporte) {
                case 'detallado':
                    return $this->generarReporteDetalladoExcel($request);
                case 'por_usuario':
                    return $this->generarReportePorUsuarioExcel($request);
                case 'por_tabla':
                    return $this->generarReportePorTablaExcel($request);
                default:
                    return $this->generarReporteResumenExcel($request);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte Excel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar reporte resumen en Excel - VERSIÓN CORREGIDA
     */
    private function generarReporteResumenExcel(Request $request)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Resumen de Auditoría');

        // Configurar headers del documento
        $this->configurarHeadersExcel($sheet, $request);

        // Obtener datos
        $tablasAuditoria = [
            'tipo_persona_auditoria' => 'Tipos Persona',
            'rol_auditoria' => 'Roles',
            'estado_auditoria' => 'Estados',
            'servicio_auditoria' => 'Servicios',
            'ruta_auditoria' => 'Rutas',
            'agencia_auditoria' => 'Agencias',
            'persona_auditoria' => 'Personas',
            'vehiculo_auditoria' => 'Vehículos',
            'contactos_agencia_auditoria' => 'Contactos Agencia',
            'usuario_auditoria' => 'Usuarios',
            'ruta_activada_auditoria' => 'Rutas Activadas',
            'reserva_auditoria' => 'Reservas'
        ];

        // Headers de la tabla
        $row = 8;
        $sheet->setCellValue('A' . $row, 'Tabla');
        $sheet->setCellValue('B' . $row, 'Total');
        $sheet->setCellValue('C' . $row, 'Creaciones');
        $sheet->setCellValue('D' . $row, 'Modificaciones');
        $sheet->setCellValue('E' . $row, 'Eliminaciones');

        // Aplicar estilos a headers
        $this->aplicarEstiloHeader($sheet, 'A' . $row . ':E' . $row);

        $row++;
        $totalGeneral = 0;
        $totalesPorAccion = ['INSERT' => 0, 'UPDATE' => 0, 'DELETE' => 0];

        foreach ($tablasAuditoria as $tabla => $nombre) {
            if ($request->tabla && $tabla !== $request->tabla . '_auditoria') {
                continue;
            }

            try {
                // CONSULTA CORREGIDA - verificar que la tabla existe primero
                $existe = DB::select("SHOW TABLES LIKE '{$tabla}'");
                if (empty($existe)) {
                    \Log::warning("Tabla de auditoría no existe: {$tabla}");
                    continue;
                }

                // Construir consulta base con rangos de fecha correctos
                $fechaInicio = $request->fecha_inicio . ' 00:00:00';
                $fechaFin = $request->fecha_fin . ' 23:59:59';

                $query = DB::table($tabla)
                    ->whereBetween('fecha_modificacion', [$fechaInicio, $fechaFin]);

                if ($request->accion) {
                    $query->where('accion', $request->accion);
                }
                if ($request->usuario_id) {
                    $query->where('usuario_modificacion', $request->usuario_id);
                }

                $total = $query->count();

                // DEBUG: Log para ver qué está pasando
                \Log::info("Tabla {$tabla}: Total encontrado = {$total}, Fecha inicio = {$fechaInicio}, Fecha fin = {$fechaFin}");

                // Obtener conteos por acción
                $porAccion = [];
                if ($total > 0) {
                    $resultadosAccion = $query->select('accion')
                        ->selectRaw('COUNT(*) as total')
                        ->groupBy('accion')
                        ->get();

                    foreach ($resultadosAccion as $resultado) {
                        $porAccion[$resultado->accion] = $resultado->total;
                    }
                }

                // Solo mostrar tablas que tienen datos O mostrar todas para debugging
                // CAMBIO: Mostrar todas las tablas para debugging
                $sheet->setCellValue('A' . $row, $nombre);
                $sheet->setCellValue('B' . $row, $total);
                $sheet->setCellValue('C' . $row, $porAccion['INSERT'] ?? 0);
                $sheet->setCellValue('D' . $row, $porAccion['UPDATE'] ?? 0);
                $sheet->setCellValue('E' . $row, $porAccion['DELETE'] ?? 0);

                $totalGeneral += $total;
                $totalesPorAccion['INSERT'] += ($porAccion['INSERT'] ?? 0);
                $totalesPorAccion['UPDATE'] += ($porAccion['UPDATE'] ?? 0);
                $totalesPorAccion['DELETE'] += ($porAccion['DELETE'] ?? 0);

                if ($total > 0) {
                    $this->aplicarEstiloFilaConColor($sheet, 'A' . $row . ':E' . $row, 'E8F5E8');
                } else {
                    $this->aplicarEstiloFila($sheet, 'A' . $row . ':E' . $row);
                }
                $row++;
            } catch (\Exception $e) {
                \Log::error("Error procesando tabla {$tabla}: " . $e->getMessage());

                // Mostrar el error en el Excel para debugging
                $sheet->setCellValue('A' . $row, $nombre . ' (ERROR)');
                $sheet->setCellValue('B' . $row, 'Error: ' . substr($e->getMessage(), 0, 50));
                $this->aplicarEstiloFilaConColor($sheet, 'A' . $row . ':E' . $row, 'FFE8E8');
                $row++;
            }
        }

        // Agregar información de debugging
        $row++;
        $sheet->setCellValue('A' . $row, 'INFORMACIÓN DE DEBUG');
        $sheet->setCellValue('B' . $row, 'Período: ' . $request->fecha_inicio . ' al ' . $request->fecha_fin);
        $this->aplicarEstiloFilaConColor($sheet, 'A' . $row . ':E' . $row, 'F0F0F0');
        $row++;

        // Fila de totales
        $row++;
        $sheet->setCellValue('A' . $row, 'TOTALES GENERALES');
        $sheet->setCellValue('B' . $row, $totalGeneral);
        $sheet->setCellValue('C' . $row, $totalesPorAccion['INSERT']);
        $sheet->setCellValue('D' . $row, $totalesPorAccion['UPDATE']);
        $sheet->setCellValue('E' . $row, $totalesPorAccion['DELETE']);
        $this->aplicarEstiloTotal($sheet, 'A' . $row . ':E' . $row);

        // Ajustar anchos de columna
        $sheet->getColumnDimension('A')->setWidth(25);
        $sheet->getColumnDimension('B')->setWidth(15);
        $sheet->getColumnDimension('C')->setWidth(15);
        $sheet->getColumnDimension('D')->setWidth(18);
        $sheet->getColumnDimension('E')->setWidth(15);

        return $this->descargarExcel($spreadsheet, 'reporte-auditoria-resumen-debug');
    }

    /**
     * Generar reporte detallado en Excel
     */
    private function generarReporteDetalladoExcel(Request $request)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Detalle de Auditoría');

        // Headers del documento
        $this->configurarHeadersExcel($sheet, $request);

        // Headers de la tabla
        $row = 8;
        $headers = ['Fecha/Hora', 'Tabla', 'Acción', 'Usuario', 'Registro Afectado', 'IP Origen'];
        $columnas = ['A', 'B', 'C', 'D', 'E', 'F'];

        for ($i = 0; $i < count($headers); $i++) {
            $sheet->setCellValue($columnas[$i] . $row, $headers[$i]);
        }
        $this->aplicarEstiloHeader($sheet, 'A' . $row . ':F' . $row);

        // Obtener datos
        $tablasAuditoria = [
            'tipo_persona_auditoria',
            'rol_auditoria',
            'estado_auditoria',
            'servicio_auditoria',
            'ruta_auditoria',
            'agencia_auditoria',
            'persona_auditoria',
            'vehiculo_auditoria',
            'contactos_agencia_auditoria',
            'usuario_auditoria',
            'ruta_activada_auditoria',
            'reserva_auditoria'
        ];

        $auditorias = collect();
        foreach ($tablasAuditoria as $tabla) {
            if ($request->tabla && $tabla !== $request->tabla . '_auditoria') {
                continue;
            }

            $auds = $this->obtenerAuditoriasPorTabla(
                $tabla,
                $request->accion,
                $request->usuario_id,
                $request->fecha_inicio,
                $request->fecha_fin
            );
            $auditorias = $auditorias->concat($auds);
        }

        $auditorias = $auditorias->sortByDesc('fecha_modificacion')->take(3000); // Limitar a 3000 registros

        $row++;
        foreach ($auditorias as $auditoria) {
            $fechaFormateada = Carbon::parse($auditoria['fecha_modificacion'])->format('d/m/Y H:i:s');
            $tablaLimpia = ucwords(str_replace(['_auditoria', '_'], [' ', ' '], $auditoria['tabla_auditoria']));
            $campoPrincipal = $this->extraerCampoPrincipal($auditoria);

            $sheet->setCellValue('A' . $row, $fechaFormateada);
            $sheet->setCellValue('B' . $row, $tablaLimpia);
            $sheet->setCellValue('C' . $row, $auditoria['accion']);
            $sheet->setCellValue('D' . $row, 'Usuario ' . $auditoria['usuario_modificacion']);
            $sheet->setCellValue('E' . $row, $campoPrincipal);
            $sheet->setCellValue('F' . $row, $auditoria['ip_modificacion'] ?? 'N/A');

            // Aplicar colores según la acción
            $colorFondo = $this->obtenerColorAccion($auditoria['accion']);
            $this->aplicarEstiloFilaConColor($sheet, 'A' . $row . ':F' . $row, $colorFondo);

            $row++;
            if ($row > 3008) break; // Evitar archivos demasiado grandes
        }

        // Ajustar anchos
        $sheet->getColumnDimension('A')->setWidth(18);
        $sheet->getColumnDimension('B')->setWidth(20);
        $sheet->getColumnDimension('C')->setWidth(14);
        $sheet->getColumnDimension('D')->setWidth(14);
        $sheet->getColumnDimension('E')->setWidth(35);
        $sheet->getColumnDimension('F')->setWidth(15);

        return $this->descargarExcel($spreadsheet, 'reporte-auditoria-detallado');
    }

    /**
     * Generar reporte por usuario en Excel
     */
    private function generarReportePorUsuarioExcel(Request $request)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Auditoría por Usuario');

        // Headers del documento
        $this->configurarHeadersExcel($sheet, $request);

        // Obtener estadísticas por usuario
        $usuariosStats = $this->obtenerEstadisticasPorUsuario($request);

        // Si no hay datos, mostrar mensaje
        if (empty($usuariosStats)) {
            $sheet->setCellValue('A8', 'No se encontraron datos de auditoría para el período especificado');
            $sheet->mergeCells('A8:F8');
            $sheet->getStyle('A8')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('A8')->getFont()->setBold(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FF6B7280'));

            return $this->descargarExcel($spreadsheet, 'reporte-auditoria-por-usuario-vacio');
        }

        // Headers de la tabla
        $row = 8;
        $sheet->setCellValue('A' . $row, 'Usuario ID');
        $sheet->setCellValue('B' . $row, 'Total Acciones');
        $sheet->setCellValue('C' . $row, 'Creaciones');
        $sheet->setCellValue('D' . $row, 'Modificaciones');
        $sheet->setCellValue('E' . $row, 'Eliminaciones');
        $sheet->setCellValue('F' . $row, 'Última Actividad');

        $this->aplicarEstiloHeader($sheet, 'A' . $row . ':F' . $row);

        // Llenar datos
        $row++;
        $totalGeneral = 0;
        $totalesPorAccion = ['INSERT' => 0, 'UPDATE' => 0, 'DELETE' => 0];

        foreach ($usuariosStats as $usuarioStat) {
            $sheet->setCellValue('A' . $row, 'Usuario ' . $usuarioStat['usuario_id']);
            $sheet->setCellValue('B' . $row, $usuarioStat['total']);
            $sheet->setCellValue('C' . $row, $usuarioStat['INSERT'] ?? 0);
            $sheet->setCellValue('D' . $row, $usuarioStat['UPDATE'] ?? 0);
            $sheet->setCellValue('E' . $row, $usuarioStat['DELETE'] ?? 0);
            $sheet->setCellValue('F' . $row, $usuarioStat['ultima_actividad'] ?
                Carbon::parse($usuarioStat['ultima_actividad'])->format('d/m/Y H:i') : 'N/A');

            // Aplicar color alternado para mejor legibilidad
            if ($row % 2 == 0) {
                $this->aplicarEstiloFilaConColor($sheet, 'A' . $row . ':F' . $row, 'F8F9FA');
            } else {
                $this->aplicarEstiloFila($sheet, 'A' . $row . ':F' . $row);
            }

            // Acumular totales
            $totalGeneral += $usuarioStat['total'];
            $totalesPorAccion['INSERT'] += ($usuarioStat['INSERT'] ?? 0);
            $totalesPorAccion['UPDATE'] += ($usuarioStat['UPDATE'] ?? 0);
            $totalesPorAccion['DELETE'] += ($usuarioStat['DELETE'] ?? 0);

            $row++;
        }

        // Fila de totales
        $row++;
        $sheet->setCellValue('A' . $row, 'TOTALES GENERALES');
        $sheet->setCellValue('B' . $row, $totalGeneral);
        $sheet->setCellValue('C' . $row, $totalesPorAccion['INSERT']);
        $sheet->setCellValue('D' . $row, $totalesPorAccion['UPDATE']);
        $sheet->setCellValue('E' . $row, $totalesPorAccion['DELETE']);
        $sheet->setCellValue('F' . $row, count($usuariosStats) . ' usuarios activos');
        $this->aplicarEstiloTotal($sheet, 'A' . $row . ':F' . $row);

        // Ajustar anchos
        $sheet->getColumnDimension('A')->setWidth(15);
        $sheet->getColumnDimension('B')->setWidth(15);
        $sheet->getColumnDimension('C')->setWidth(15);
        $sheet->getColumnDimension('D')->setWidth(18);
        $sheet->getColumnDimension('E')->setWidth(15);
        $sheet->getColumnDimension('F')->setWidth(18);

        return $this->descargarExcel($spreadsheet, 'reporte-auditoria-por-usuario');
    }

    /**
     * Generar reporte por tabla en Excel
     */
    private function generarReportePorTablaExcel(Request $request)
    {
        // Usar el mismo método que el resumen pero con más detalle
        return $this->generarReporteResumenExcel($request);
    }

    /**
     * Configurar headers del documento Excel
     */
    private function configurarHeadersExcel($sheet, $request)
    {
        // Título principal
        $sheet->setCellValue('A1', 'MAGIC TRAVEL GUATEMALA');
        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(18)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFFFF'));
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1F2937');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Subtítulo
        $sheet->setCellValue('A2', 'REPORTE DE AUDITORÍA DEL SISTEMA');
        $sheet->mergeCells('A2:F2');
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Información del reporte
        $sheet->setCellValue('A4', 'Período de consulta:');
        $sheet->setCellValue('B4', $request->fecha_inicio . ' al ' . $request->fecha_fin);
        $sheet->getStyle('A4')->getFont()->setBold(true);

        $sheet->setCellValue('A5', 'Generado el:');
        $sheet->setCellValue('B5', now()->format('d/m/Y H:i:s'));
        $sheet->getStyle('A5')->getFont()->setBold(true);

        if ($request->tabla) {
            $sheet->setCellValue('A6', 'Tabla filtrada:');
            $sheet->setCellValue('B6', ucfirst(str_replace('_', ' ', $request->tabla)));
            $sheet->getStyle('A6')->getFont()->setBold(true);
        }

        if ($request->accion) {
            $sheet->setCellValue('C6', 'Acción filtrada:');
            $sheet->setCellValue('D6', $request->accion);
            $sheet->getStyle('C6')->getFont()->setBold(true);
        }
    }

    /**
     * Aplicar estilo a headers de tabla
     */
    private function aplicarEstiloHeader($sheet, $rango)
    {
        $sheet->getStyle($rango)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => '3B82F6']
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
    }

    /**
     * Aplicar estilo a filas de datos
     */
    private function aplicarEstiloFila($sheet, $rango)
    {
        $sheet->getStyle($rango)->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
    }

    /**
     * Aplicar estilo a filas con color según acción
     */
    private function aplicarEstiloFilaConColor($sheet, $rango, $colorFondo)
    {
        $sheet->getStyle($rango)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => $colorFondo]
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
    }

    /**
     * Aplicar estilo a fila de totales
     */
    private function aplicarEstiloTotal($sheet, $rango)
    {
        $sheet->getStyle($rango)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => 'F59E0B']
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THICK]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
    }

    /**
     * Obtener color según tipo de acción
     */
    private function obtenerColorAccion($accion)
    {
        switch ($accion) {
            case 'INSERT':
                return 'D1FAE5'; // Verde claro
            case 'UPDATE':
                return 'FEF3C7'; // Amarillo claro
            case 'DELETE':
                return 'FEE2E2'; // Rojo claro
            default:
                return 'F3F4F6'; // Gris claro
        }
    }

    /**
     * Extraer campo principal para mostrar en Excel
     */
    private function extraerCampoPrincipal($auditoria)
    {
        $tabla = str_replace('_auditoria', '', $auditoria['tabla_auditoria']);

        // Campos específicos por tabla
        $camposEspecificos = [
            'reserva' => ['reserva_codigo', 'reserva_nombres_cliente', 'reserva_apellidos_cliente'],
            'vehiculo' => ['vehiculo_codigo', 'vehiculo_placa'],
            'persona' => ['persona_codigo', 'persona_nombres', 'persona_apellidos'],
            'agencia' => ['agencia_codigo', 'agencia_razon_social'],
            'usuario' => ['usuario_codigo'],
            'servicio' => ['servicio_codigo', 'servicio_servicio'],
            'ruta' => ['ruta_codigo', 'ruta_ruta']
        ];

        $campos = $camposEspecificos[$tabla] ?? [$tabla . '_codigo', $tabla . '_nombre'];

        foreach ($campos as $campo) {
            if (isset($auditoria[$campo]) && $auditoria[$campo]) {
                // Para nombres completos
                if ($tabla === 'reserva' && $campo === 'reserva_nombres_cliente' && isset($auditoria['reserva_apellidos_cliente'])) {
                    return $auditoria['reserva_nombres_cliente'] . ' ' . $auditoria['reserva_apellidos_cliente'];
                }
                if ($tabla === 'persona' && $campo === 'persona_nombres' && isset($auditoria['persona_apellidos'])) {
                    return $auditoria['persona_nombres'] . ' ' . $auditoria['persona_apellidos'];
                }

                return $auditoria[$campo];
            }
        }

        return 'ID Auditoría: ' . ($auditoria['auditoria_id'] ?? 'N/A');
    }

    /**
     * Obtener estadísticas por usuario
     */
    private function obtenerEstadisticasPorUsuario($request)
    {
        $tablasAuditoria = [
            'tipo_persona_auditoria',
            'rol_auditoria',
            'estado_auditoria',
            'servicio_auditoria',
            'ruta_auditoria',
            'agencia_auditoria',
            'persona_auditoria',
            'vehiculo_auditoria',
            'contactos_agencia_auditoria',
            'usuario_auditoria',
            'ruta_activada_auditoria',
            'reserva_auditoria'
        ];

        $estadisticasCompletas = collect();

        foreach ($tablasAuditoria as $tabla) {
            // Aplicar filtro de tabla si se especifica
            if ($request->tabla && $tabla !== $request->tabla . '_auditoria') {
                continue;
            }

            try {
                // Query básico con los filtros
                $query = DB::table($tabla)
                    ->select('usuario_modificacion', 'accion')
                    ->selectRaw('COUNT(*) as total_acciones')
                    ->selectRaw('MAX(fecha_modificacion) as ultima_actividad')
                    ->whereBetween('fecha_modificacion', [
                        $request->fecha_inicio . ' 00:00:00',
                        $request->fecha_fin . ' 23:59:59'
                    ]);

                if ($request->accion) {
                    $query->where('accion', $request->accion);
                }

                if ($request->usuario_id) {
                    $query->where('usuario_modificacion', $request->usuario_id);
                }

                $resultados = $query->groupBy('usuario_modificacion', 'accion')->get();

                // Agregar información de la tabla para debugging
                foreach ($resultados as $resultado) {
                    $resultado->tabla_origen = $tabla;
                }

                $estadisticasCompletas = $estadisticasCompletas->concat($resultados);
            } catch (\Exception $e) {
                // Log del error pero continuar con otras tablas
                \Log::warning("Error procesando tabla {$tabla}: " . $e->getMessage());
                continue;
            }
        }

        // Si no hay datos, retornar array vacío
        if ($estadisticasCompletas->isEmpty()) {
            \Log::info("No se encontraron estadísticas para el período: {$request->fecha_inicio} - {$request->fecha_fin}");
            return [];
        }

        // Agrupar por usuario y procesar
        $estadisticasPorUsuario = $estadisticasCompletas->groupBy('usuario_modificacion')
            ->map(function ($grupo, $usuarioId) {
                $stats = [
                    'usuario_id' => $usuarioId,
                    'total' => 0,
                    'INSERT' => 0,
                    'UPDATE' => 0,
                    'DELETE' => 0,
                    'ultima_actividad' => null,
                    'tablas_afectadas' => []
                ];

                foreach ($grupo as $item) {
                    $stats['total'] += $item->total_acciones;
                    $stats[$item->accion] = ($stats[$item->accion] ?? 0) + $item->total_acciones;

                    // Actualizar última actividad
                    if (!$stats['ultima_actividad'] || $item->ultima_actividad > $stats['ultima_actividad']) {
                        $stats['ultima_actividad'] = $item->ultima_actividad;
                    }

                    // Agregar tabla afectada
                    if (!in_array($item->tabla_origen, $stats['tablas_afectadas'])) {
                        $stats['tablas_afectadas'][] = $item->tabla_origen;
                    }
                }

                return $stats;
            })
            ->sortByDesc('total')
            ->take(50)
            ->values()
            ->toArray();

        return $estadisticasPorUsuario;
    }


    /**
     * Descargar archivo Excel
     */
    private function descargarExcel($spreadsheet, $nombreBase)
    {
        $filename = $nombreBase . '-' . date('Y-m-d-H-i-s') . '.xlsx';

        $writer = new Xlsx($spreadsheet);

        // Configurar headers para descarga
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }

    /**
     * Generar reporte de auditoría (método original para texto)
     */
    public function reporte(Request $request)
    {
        try {
            $request->validate([
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
                'tabla' => 'nullable|string',
                'accion' => 'nullable|in:INSERT,UPDATE,DELETE',
                'usuario_id' => 'nullable|integer'
            ]);

            $reporte = [
                'periodo' => [
                    'inicio' => $request->fecha_inicio,
                    'fin' => $request->fecha_fin
                ],
                'filtros' => [
                    'tabla' => $request->tabla,
                    'accion' => $request->accion,
                    'usuario_id' => $request->usuario_id
                ],
                'resumen' => [],
                'detalle' => []
            ];

            $tablasAuditoria = [
                'tipo_persona_auditoria' => 'Tipos Persona',
                'rol_auditoria' => 'Roles',
                'estado_auditoria' => 'Estados',
                'servicio_auditoria' => 'Servicios',
                'ruta_auditoria' => 'Rutas',
                'agencia_auditoria' => 'Agencias',
                'persona_auditoria' => 'Personas',
                'vehiculo_auditoria' => 'Vehículos',
                'contactos_agencia_auditoria' => 'Contactos Agencia',
                'usuario_auditoria' => 'Usuarios',
                'ruta_activada_auditoria' => 'Rutas Activadas',
                'reserva_auditoria' => 'Reservas'
            ];

            // Generar resumen por tabla
            foreach ($tablasAuditoria as $tabla => $nombre) {
                if ($request->tabla && $tabla !== $request->tabla . '_auditoria') {
                    continue;
                }

                $query = DB::table($tabla)
                    ->whereBetween('fecha_modificacion', [$request->fecha_inicio, $request->fecha_fin]);

                if ($request->accion) {
                    $query->where('accion', $request->accion);
                }

                if ($request->usuario_id) {
                    $query->where('usuario_modificacion', $request->usuario_id);
                }

                $total = $query->count();
                $porAccion = $query->select('accion')
                    ->selectRaw('COUNT(*) as total')
                    ->groupBy('accion')
                    ->get()
                    ->pluck('total', 'accion')
                    ->toArray();

                $reporte['resumen'][$nombre] = [
                    'total' => $total,
                    'por_accion' => $porAccion
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $reporte
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Limpiar auditorías antiguas
     */
    public function limpiar(Request $request)
    {
        try {
            $request->validate([
                'dias' => 'required|integer|min:30'
            ]);

            $fechaLimite = Carbon::now()->subDays($request->dias);
            $totalEliminados = 0;

            $tablasAuditoria = [
                'tipo_persona_auditoria',
                'rol_auditoria',
                'estado_auditoria',
                'servicio_auditoria',
                'ruta_auditoria',
                'agencia_auditoria',
                'persona_auditoria',
                'vehiculo_auditoria',
                'contactos_agencia_auditoria',
                'usuario_auditoria',
                'ruta_activada_auditoria',
                'reserva_auditoria'
            ];

            foreach ($tablasAuditoria as $tabla) {
                $eliminados = DB::table($tabla)
                    ->where('fecha_modificacion', '<', $fechaLimite)
                    ->delete();
                $totalEliminados += $eliminados;
            }

            return response()->json([
                'success' => true,
                'message' => "Se eliminaron {$totalEliminados} registros de auditoría anteriores a {$fechaLimite->format('Y-m-d')}"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al limpiar auditorías: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Método privado para obtener auditorías de una tabla CON BÚSQUEDA
     */
    private function obtenerAuditoriasPorTabla($tabla, $accion = null, $usuario = null, $fechaInicio = null, $fechaFin = null, $busqueda = null)
    {
        $query = DB::table($tabla)
            ->select('*')
            ->addSelect(DB::raw("'{$tabla}' as tabla_auditoria"));

        if ($accion) {
            $query->where('accion', $accion);
        }

        if ($usuario) {
            $query->where('usuario_modificacion', $usuario);
        }

        if ($fechaInicio) {
            $query->whereDate('fecha_modificacion', '>=', $fechaInicio);
        }

        if ($fechaFin) {
            $query->whereDate('fecha_modificacion', '<=', $fechaFin);
        }

        // Aplicar filtro de búsqueda de texto libre
        if ($busqueda) {
            $this->aplicarFiltroBusqueda($query, $tabla, $busqueda);
        }

        $auditorias = $query->orderByDesc('fecha_modificacion')->get();

        // Agregar información adicional
        return $auditorias->map(function ($auditoria) use ($tabla) {
            $auditoria = (array) $auditoria;
            $auditoria['tabla_original'] = str_replace('_auditoria', '', $tabla);
            return $auditoria;
        });
    }

    /**
     * Aplicar filtro de búsqueda de texto libre por tabla
     */
    private function aplicarFiltroBusqueda($query, $tabla, $busqueda)
    {
        $tablaBase = str_replace('_auditoria', '', $tabla);

        $query->where(function ($subQuery) use ($tablaBase, $busqueda) {
            switch ($tablaBase) {
                case 'reserva':
                    $subQuery->where('reserva_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('reserva_nombres_cliente', 'like', "%{$busqueda}%")
                        ->orWhere('reserva_apellidos_cliente', 'like', "%{$busqueda}%")
                        ->orWhere('reserva_telefono_cliente', 'like', "%{$busqueda}%")
                        ->orWhere('reserva_email_cliente', 'like', "%{$busqueda}%");
                    break;

                case 'vehiculo':
                    $subQuery->where('vehiculo_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('vehiculo_placa', 'like', "%{$busqueda}%")
                        ->orWhere('vehiculo_marca', 'like', "%{$busqueda}%")
                        ->orWhere('vehiculo_modelo', 'like', "%{$busqueda}%");
                    break;

                case 'persona':
                    $subQuery->where('persona_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('persona_nombres', 'like', "%{$busqueda}%")
                        ->orWhere('persona_apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('persona_email', 'like', "%{$busqueda}%")
                        ->orWhere('persona_telefono', 'like', "%{$busqueda}%");
                    break;

                case 'agencia':
                    $subQuery->where('agencia_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('agencia_razon_social', 'like', "%{$busqueda}%")
                        ->orWhere('agencia_nit', 'like', "%{$busqueda}%")
                        ->orWhere('agencia_email', 'like', "%{$busqueda}%")
                        ->orWhere('agencia_telefono', 'like', "%{$busqueda}%");
                    break;

                case 'ruta_activada':
                    $subQuery->where('ruta_activada_codigo', 'like', "%{$busqueda}%");
                    break;

                case 'contactos_agencia':
                    $subQuery->where('contactos_agencia_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('contactos_agencia_nombres', 'like', "%{$busqueda}%")
                        ->orWhere('contactos_agencia_apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('contactos_agencia_telefono', 'like', "%{$busqueda}%");
                    break;

                case 'usuario':
                    $subQuery->where('usuario_codigo', 'like', "%{$busqueda}%");
                    break;

                case 'servicio':
                    $subQuery->where('servicio_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('servicio_servicio', 'like', "%{$busqueda}%");
                    break;

                case 'ruta':
                    $subQuery->where('ruta_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('ruta_ruta', 'like', "%{$busqueda}%");
                    break;

                case 'tipo_persona':
                    $subQuery->where('tipo_persona_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('tipo_persona_tipo', 'like', "%{$busqueda}%");
                    break;

                case 'rol':
                    $subQuery->where('rol_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('rol_rol', 'like', "%{$busqueda}%");
                    break;

                case 'estado':
                    $subQuery->where('estado_codigo', 'like', "%{$busqueda}%")
                        ->orWhere('estado_estado', 'like', "%{$busqueda}%");
                    break;

                default:
                    // Para otras tablas, buscar en campo código genérico
                    $campo_codigo = $tablaBase . '_codigo';
                    $subQuery->where($campo_codigo, 'like', "%{$busqueda}%");
                    break;
            }
        });
    }
}
