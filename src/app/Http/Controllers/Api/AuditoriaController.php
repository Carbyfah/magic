<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditoriaController extends Controller
{
    /**
     * Lista combinada de eventos de auditoría de todas las tablas
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 50);
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;

        // Query builder para combinar todas las tablas de auditoría
        $query = $this->buildCombinedAuditQuery($request);

        // Obtener total para paginación
        $total = DB::select("SELECT COUNT(*) as total FROM ({$query}) as combined_audit")[0]->total;

        // Agregar paginación
        $query .= " LIMIT {$perPage} OFFSET {$offset}";

        $auditorias = DB::select($query);

        // Enriquecer con nombres de usuario
        $auditorias = $this->enrichWithUserNames($auditorias);

        return response()->json([
            'data' => $auditorias,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage)
            ]
        ]);
    }

    /**
     * Estadísticas de auditoría
     */
    public function stats(Request $request)
    {
        $fechaInicio = $request->get('fecha_inicio', now()->subDays(30)->format('Y-m-d'));
        $fechaFin = $request->get('fecha_fin', now()->format('Y-m-d'));

        // Estadísticas generales
        $stats = [
            'total_eventos' => $this->getTotalEventos($fechaInicio, $fechaFin),
            'eventos_hoy' => $this->getEventosHoy(),
            'eventos_semana' => $this->getEventosSemana(),
            'usuarios_activos' => $this->getUsuariosActivos($fechaInicio, $fechaFin),
            'por_accion' => $this->getEventosPorAccion($fechaInicio, $fechaFin),
            'por_tabla' => $this->getEventosPorTabla($fechaInicio, $fechaFin),
            'por_usuario' => $this->getEventosPorUsuario($fechaInicio, $fechaFin),
            'actividad_diaria' => $this->getActividadDiaria($fechaInicio, $fechaFin),
            'ultimo_evento' => $this->getUltimoEvento()
        ];

        return response()->json($stats);
    }

    /**
     * Eventos por tabla específica
     */
    public function porTabla(Request $request, $tabla)
    {
        $tablasPermitidas = [
            'reserva',
            'agencia',
            'usuario',
            'persona',
            'vehiculo',
            'servicio',
            'ruta_activada',
            'facturas',
            'rol',
            'estado'
        ];

        if (!in_array($tabla, $tablasPermitidas)) {
            return response()->json(['message' => 'Tabla no válida'], 400);
        }

        $perPage = $request->get('per_page', 50);
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;

        $query = "
            SELECT
                auditoria_id,
                '{$tabla}' as tabla,
                {$tabla}_id as registro_id,
                accion,
                usuario_modificacion,
                fecha_modificacion,
                ip_modificacion
            FROM {$tabla}_auditoria
            WHERE 1=1
        ";

        // Filtros adicionales
        if ($request->filled('accion')) {
            $accion = $request->get('accion');
            $query .= " AND accion = '{$accion}'";
        }

        if ($request->filled('usuario_id')) {
            $usuarioId = $request->get('usuario_id');
            $query .= " AND usuario_modificacion = {$usuarioId}";
        }

        if ($request->filled('fecha_inicio')) {
            $fechaInicio = $request->get('fecha_inicio');
            $query .= " AND DATE(fecha_modificacion) >= '{$fechaInicio}'";
        }

        if ($request->filled('fecha_fin')) {
            $fechaFin = $request->get('fecha_fin');
            $query .= " AND DATE(fecha_modificacion) <= '{$fechaFin}'";
        }

        $query .= " ORDER BY fecha_modificacion DESC";

        // Total para paginación
        $countQuery = preg_replace('/SELECT.*?FROM/', 'SELECT COUNT(*) as total FROM', $query);
        $countQuery = preg_replace('/ORDER BY.*/', '', $countQuery);
        $total = DB::select($countQuery)[0]->total;

        // Agregar paginación
        $query .= " LIMIT {$perPage} OFFSET {$offset}";

        $eventos = DB::select($query);
        $eventos = $this->enrichWithUserNames($eventos);

        return response()->json([
            'data' => $eventos,
            'tabla' => $tabla,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage)
            ]
        ]);
    }

    /**
     * Eventos por usuario específico
     */
    public function porUsuario(Request $request, $usuarioId)
    {
        $perPage = $request->get('per_page', 50);
        $fechaInicio = $request->get('fecha_inicio', now()->subDays(7)->format('Y-m-d'));
        $fechaFin = $request->get('fecha_fin', now()->format('Y-m-d'));

        $query = $this->buildCombinedAuditQuery($request, $usuarioId);
        $query .= " AND DATE(fecha_modificacion) BETWEEN '{$fechaInicio}' AND '{$fechaFin}'";
        $query .= " ORDER BY fecha_modificacion DESC LIMIT {$perPage}";

        $eventos = DB::select($query);
        $eventos = $this->enrichWithUserNames($eventos);

        return response()->json([
            'data' => $eventos,
            'usuario_id' => $usuarioId,
            'periodo' => [
                'inicio' => $fechaInicio,
                'fin' => $fechaFin
            ]
        ]);
    }

    /**
     * Detalle específico de un evento de auditoría
     */
    public function show(Request $request, $tabla, $auditoriaId)
    {
        $tablasPermitidas = [
            'reserva',
            'agencia',
            'usuario',
            'persona',
            'vehiculo',
            'servicio',
            'ruta_activada',
            'facturas',
            'rol',
            'estado'
        ];

        if (!in_array($tabla, $tablasPermitidas)) {
            return response()->json(['message' => 'Tabla no válida'], 400);
        }

        $evento = DB::select("
            SELECT * FROM {$tabla}_auditoria
            WHERE auditoria_id = ?
        ", [$auditoriaId]);

        if (empty($evento)) {
            return response()->json(['message' => 'Evento de auditoría no encontrado'], 404);
        }

        $evento = $evento[0];

        // Enriquecer con información del usuario
        $usuario = DB::select("
            SELECT CONCAT(p.persona_nombres, ' ', p.persona_apellidos) as nombre_completo,
                   u.usuario_codigo
            FROM usuario u
            JOIN persona p ON u.persona_id = p.persona_id
            WHERE u.usuario_id = ?
        ", [$evento->usuario_modificacion]);

        $evento->usuario_nombre = $usuario[0]->nombre_completo ?? 'Usuario eliminado';
        $evento->usuario_codigo = $usuario[0]->usuario_codigo ?? 'N/A';
        $evento->tabla = $tabla;

        return response()->json([
            'data' => $evento,
            'tabla' => $tabla
        ]);
    }

    /**
     * Reporte de actividad por período
     */
    public function reporte(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'tabla' => 'nullable|string',
            'usuario_id' => 'nullable|integer'
        ]);

        $reporte = [
            'periodo' => [
                'inicio' => $validated['fecha_inicio'],
                'fin' => $validated['fecha_fin']
            ],
            'resumen' => $this->getResumenActividad(
                $validated['fecha_inicio'],
                $validated['fecha_fin'],
                $validated['tabla'] ?? null,
                $validated['usuario_id'] ?? null
            ),
            'detalle_diario' => $this->getDetalleDiario(
                $validated['fecha_inicio'],
                $validated['fecha_fin']
            ),
            'top_usuarios' => $this->getTopUsuarios(
                $validated['fecha_inicio'],
                $validated['fecha_fin']
            ),
            'tablas_mas_modificadas' => $this->getTablasMasModificadas(
                $validated['fecha_inicio'],
                $validated['fecha_fin']
            )
        ];

        return response()->json($reporte);
    }

    // ========== MÉTODOS PRIVADOS DE UTILIDAD ==========

    /**
     * Construye query combinada de todas las tablas de auditoría
     */
    private function buildCombinedAuditQuery($request, $usuarioId = null)
    {
        $tablas = [
            'tipo_persona',
            'rol',
            'estado',
            'servicio',
            'ruta',
            'agencia',
            'persona',
            'vehiculo',
            'contactos_agencia',
            'usuario',
            'ruta_activada',
            'reserva',
            'facturas'
        ];

        $unions = [];
        foreach ($tablas as $tabla) {
            $primaryKey = $tabla . '_id';
            $subQuery = "
                SELECT
                    auditoria_id,
                    '{$tabla}' as tabla,
                    {$primaryKey} as registro_id,
                    accion,
                    usuario_modificacion,
                    fecha_modificacion,
                    ip_modificacion
                FROM {$tabla}_auditoria
                WHERE 1=1
            ";

            // Filtros comunes
            if ($request->filled('accion')) {
                $accion = $request->get('accion');
                $subQuery .= " AND accion = '{$accion}'";
            }

            if ($usuarioId) {
                $subQuery .= " AND usuario_modificacion = {$usuarioId}";
            }

            if ($request->filled('fecha_inicio')) {
                $fechaInicio = $request->get('fecha_inicio');
                $subQuery .= " AND DATE(fecha_modificacion) >= '{$fechaInicio}'";
            }

            if ($request->filled('fecha_fin')) {
                $fechaFin = $request->get('fecha_fin');
                $subQuery .= " AND DATE(fecha_modificacion) <= '{$fechaFin}'";
            }

            $unions[] = $subQuery;
        }

        return "SELECT * FROM (" . implode(' UNION ALL ', $unions) . ") as combined_audit ORDER BY fecha_modificacion DESC";
    }

    /**
     * Enriquece los eventos con nombres de usuario
     */
    private function enrichWithUserNames($eventos)
    {
        // Obtener todos los IDs únicos de usuario
        $usuarioIds = collect($eventos)->pluck('usuario_modificacion')->unique()->filter();

        if ($usuarioIds->isEmpty()) {
            return $eventos;
        }

        // Cargar nombres de usuario en una sola query
        $usuarios = DB::select("
            SELECT u.usuario_id,
                   u.usuario_codigo,
                   CONCAT(p.persona_nombres, ' ', p.persona_apellidos) as nombre_completo
            FROM usuario u
            JOIN persona p ON u.persona_id = p.persona_id
            WHERE u.usuario_id IN (" . $usuarioIds->implode(',') . ")
        ");

        $usuariosMap = collect($usuarios)->keyBy('usuario_id');

        // Enriquecer eventos
        foreach ($eventos as $evento) {
            $usuario = $usuariosMap->get($evento->usuario_modificacion);
            $evento->usuario_nombre = $usuario->nombre_completo ?? 'Usuario eliminado';
            $evento->usuario_codigo = $usuario->usuario_codigo ?? 'N/A';
        }

        return $eventos;
    }

    /**
     * Total de eventos en período
     */
    private function getTotalEventos($fechaInicio, $fechaFin)
    {
        $tablas = [
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
            'reserva_auditoria',
            'facturas_auditoria'
        ];

        $total = 0;
        foreach ($tablas as $tabla) {
            $resultado = DB::select("
                SELECT COUNT(*) as count
                FROM {$tabla}
                WHERE DATE(fecha_modificacion) BETWEEN ? AND ?
            ", [$fechaInicio, $fechaFin]);

            $total += $resultado[0]->count;
        }

        return $total;
    }

    /**
     * Eventos de hoy
     */
    private function getEventosHoy()
    {
        return $this->getTotalEventos(now()->format('Y-m-d'), now()->format('Y-m-d'));
    }

    /**
     * Eventos de esta semana
     */
    private function getEventosSemana()
    {
        $inicioSemana = now()->startOfWeek()->format('Y-m-d');
        $finSemana = now()->endOfWeek()->format('Y-m-d');

        return $this->getTotalEventos($inicioSemana, $finSemana);
    }

    /**
     * Usuarios únicos que han hecho cambios
     */
    private function getUsuariosActivos($fechaInicio, $fechaFin)
    {
        $tablas = [
            'reserva_auditoria',
            'agencia_auditoria',
            'usuario_auditoria',
            'persona_auditoria',
            'vehiculo_auditoria'
        ];

        $usuarios = collect();
        foreach ($tablas as $tabla) {
            $resultado = DB::select("
                SELECT DISTINCT usuario_modificacion
                FROM {$tabla}
                WHERE DATE(fecha_modificacion) BETWEEN ? AND ?
            ", [$fechaInicio, $fechaFin]);

            $usuarios = $usuarios->merge(collect($resultado)->pluck('usuario_modificacion'));
        }

        return $usuarios->unique()->count();
    }

    /**
     * Eventos agrupados por acción
     */
    private function getEventosPorAccion($fechaInicio, $fechaFin)
    {
        $tablas = [
            'reserva_auditoria',
            'agencia_auditoria',
            'usuario_auditoria',
            'persona_auditoria',
            'vehiculo_auditoria',
            'servicio_auditoria'
        ];

        $acciones = ['INSERT' => 0, 'UPDATE' => 0, 'DELETE' => 0];

        foreach ($tablas as $tabla) {
            $resultado = DB::select("
                SELECT accion, COUNT(*) as count
                FROM {$tabla}
                WHERE DATE(fecha_modificacion) BETWEEN ? AND ?
                GROUP BY accion
            ", [$fechaInicio, $fechaFin]);

            foreach ($resultado as $row) {
                $acciones[$row->accion] = ($acciones[$row->accion] ?? 0) + $row->count;
            }
        }

        return $acciones;
    }

    /**
     * Eventos agrupados por tabla
     */
    private function getEventosPorTabla($fechaInicio, $fechaFin)
    {
        $tablas = [
            'reserva' => 'Reservas',
            'agencia' => 'Agencias',
            'usuario' => 'Usuarios',
            'persona' => 'Personas',
            'vehiculo' => 'Vehículos',
            'servicio' => 'Servicios',
            'ruta_activada' => 'Rutas Activadas',
            'facturas' => 'Facturas'
        ];

        $resultado = [];
        foreach ($tablas as $tabla => $nombre) {
            $count = DB::select("
                SELECT COUNT(*) as count
                FROM {$tabla}_auditoria
                WHERE DATE(fecha_modificacion) BETWEEN ? AND ?
            ", [$fechaInicio, $fechaFin]);

            $resultado[$tabla] = [
                'nombre' => $nombre,
                'eventos' => $count[0]->count
            ];
        }

        return $resultado;
    }

    /**
     * Top usuarios más activos
     */
    private function getEventosPorUsuario($fechaInicio, $fechaFin)
    {
        $query = $this->buildCombinedAuditQuery(new Request([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin
        ]));

        $usuarios = DB::select("
            SELECT usuario_modificacion, COUNT(*) as total_eventos
            FROM ({$query}) as eventos
            GROUP BY usuario_modificacion
            ORDER BY total_eventos DESC
            LIMIT 10
        ");

        return $this->enrichWithUserNames($usuarios);
    }

    /**
     * Actividad diaria en el período
     */
    private function getActividadDiaria($fechaInicio, $fechaFin)
    {
        $query = $this->buildCombinedAuditQuery(new Request([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin
        ]));

        return DB::select("
            SELECT
                DATE(fecha_modificacion) as fecha,
                COUNT(*) as eventos,
                COUNT(CASE WHEN accion = 'INSERT' THEN 1 END) as creaciones,
                COUNT(CASE WHEN accion = 'UPDATE' THEN 1 END) as modificaciones,
                COUNT(CASE WHEN accion = 'DELETE' THEN 1 END) as eliminaciones
            FROM ({$query}) as eventos
            GROUP BY DATE(fecha_modificacion)
            ORDER BY fecha DESC
        ");
    }

    /**
     * Último evento registrado
     */
    private function getUltimoEvento()
    {
        $query = $this->buildCombinedAuditQuery(new Request());
        $query .= " LIMIT 1";

        $eventos = DB::select($query);
        if (empty($eventos)) {
            return null;
        }

        $evento = $eventos[0];
        $evento = $this->enrichWithUserNames([$evento])[0];

        return $evento;
    }

    /**
     * Resumen de actividad para reportes
     */
    private function getResumenActividad($fechaInicio, $fechaFin, $tabla = null, $usuarioId = null)
    {
        $request = new Request([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin
        ]);

        if ($tabla) {
            $request->merge(['tabla' => $tabla]);
        }

        $query = $this->buildCombinedAuditQuery($request, $usuarioId);

        return DB::select("
            SELECT
                COUNT(*) as total_eventos,
                COUNT(CASE WHEN accion = 'INSERT' THEN 1 END) as creaciones,
                COUNT(CASE WHEN accion = 'UPDATE' THEN 1 END) as modificaciones,
                COUNT(CASE WHEN accion = 'DELETE' THEN 1 END) as eliminaciones,
                COUNT(DISTINCT usuario_modificacion) as usuarios_involucrados,
                COUNT(DISTINCT tabla) as tablas_afectadas,
                MIN(fecha_modificacion) as primer_evento,
                MAX(fecha_modificacion) as ultimo_evento
            FROM ({$query}) as eventos
        ")[0];
    }

    /**
     * Detalle día por día
     */
    private function getDetalleDiario($fechaInicio, $fechaFin)
    {
        $query = $this->buildCombinedAuditQuery(new Request([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin
        ]));

        return DB::select("
            SELECT
                DATE(fecha_modificacion) as fecha,
                tabla,
                accion,
                COUNT(*) as cantidad
            FROM ({$query}) as eventos
            GROUP BY DATE(fecha_modificacion), tabla, accion
            ORDER BY fecha DESC, tabla, accion
        ");
    }

    /**
     * Top usuarios del período
     */
    private function getTopUsuarios($fechaInicio, $fechaFin)
    {
        $query = $this->buildCombinedAuditQuery(new Request([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin
        ]));

        $usuarios = DB::select("
            SELECT
                usuario_modificacion,
                COUNT(*) as total_eventos,
                COUNT(CASE WHEN accion = 'INSERT' THEN 1 END) as creaciones,
                COUNT(CASE WHEN accion = 'UPDATE' THEN 1 END) as modificaciones,
                COUNT(CASE WHEN accion = 'DELETE' THEN 1 END) as eliminaciones,
                COUNT(DISTINCT tabla) as tablas_afectadas
            FROM ({$query}) as eventos
            GROUP BY usuario_modificacion
            ORDER BY total_eventos DESC
            LIMIT 10
        ");

        return $this->enrichWithUserNames($usuarios);
    }

    /**
     * Tablas más modificadas del período
     */
    private function getTablasMasModificadas($fechaInicio, $fechaFin)
    {
        $query = $this->buildCombinedAuditQuery(new Request([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin
        ]));

        return DB::select("
            SELECT
                tabla,
                COUNT(*) as total_eventos,
                COUNT(CASE WHEN accion = 'INSERT' THEN 1 END) as creaciones,
                COUNT(CASE WHEN accion = 'UPDATE' THEN 1 END) as modificaciones,
                COUNT(CASE WHEN accion = 'DELETE' THEN 1 END) as eliminaciones,
                COUNT(DISTINCT usuario_modificacion) as usuarios_involucrados
            FROM ({$query}) as eventos
            GROUP BY tabla
            ORDER BY total_eventos DESC
        ");
    }

    /**
     * Limpieza de auditorías antiguas (mantenimiento)
     */
    public function limpiar(Request $request)
    {
        $validated = $request->validate([
            'dias_antiguedad' => 'required|integer|min:30|max:365',
            'confirmar' => 'required|boolean|accepted'
        ]);

        if (!$validated['confirmar']) {
            return response()->json([
                'message' => 'Debe confirmar la acción de limpieza'
            ], 400);
        }

        $fechaCorte = now()->subDays($validated['dias_antiguedad'])->format('Y-m-d H:i:s');

        $tablas = [
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
            'reserva_auditoria',
            'facturas_auditoria'
        ];

        $totalEliminados = 0;
        foreach ($tablas as $tabla) {
            $eliminados = DB::delete("
                DELETE FROM {$tabla}
                WHERE fecha_modificacion < ?
            ", [$fechaCorte]);

            $totalEliminados += $eliminados;
        }

        return response()->json([
            'message' => 'Limpieza de auditoría completada',
            'eventos_eliminados' => $totalEliminados,
            'fecha_corte' => $fechaCorte,
            'dias_antiguedad' => $validated['dias_antiguedad']
        ]);
    }
}
