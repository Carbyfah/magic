<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmpleadoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_empleados,
            'informacion_personal' => [
                'nombres' => $this->empleados_nombres,
                'apellidos' => $this->empleados_apellidos,
                'nombre_completo' => $this->empleados_nombres . ' ' . $this->empleados_apellidos,
                'telefono' => $this->empleados_telefono,
                'correo' => $this->empleados_correo,
                'direccion' => $this->empleados_direccion,
                'dpi' => $this->empleados_dpi,
                'dpi_formateado' => $this->empleados_dpi ? $this->formatearDPI($this->empleados_dpi) : null,
            ],
            'fechas_importantes' => [
                'fecha_nacimiento' => $this->empleados_fecha_nacimiento?->format('Y-m-d'),
                'fecha_nacimiento_formateada' => $this->empleados_fecha_nacimiento?->format('d/m/Y'),
                'fecha_ingreso' => $this->empleados_fecha_ingreso?->format('Y-m-d'),
                'fecha_ingreso_formateada' => $this->empleados_fecha_ingreso?->format('d/m/Y'),
                'edad' => $this->empleados_fecha_nacimiento
                    ? $this->empleados_fecha_nacimiento->diffInYears(today())
                    : null,
                'antiguedad_anos' => $this->empleados_fecha_ingreso
                    ? $this->empleados_fecha_ingreso->diffInYears(today())
                    : null,
                'antiguedad_meses' => $this->empleados_fecha_ingreso
                    ? $this->empleados_fecha_ingreso->diffInMonths(today())
                    : null,
                'antiguedad_texto' => $this->empleados_fecha_ingreso
                    ? $this->calcularAntiguedadTexto()
                    : null,
            ],
            'informacion_laboral' => [
                'estado' => $this->empleados_estado,
                'activo' => $this->empleados_activo,
                'estado_texto' => $this->empleados_activo ? 'Activo' : 'Inactivo',
                'salario' => $this->empleados_salario,
                'salario_formateado' => $this->empleados_salario
                    ? 'Q' . number_format($this->empleados_salario, 2)
                    : null,
                'observaciones' => $this->empleados_observaciones,
            ],
            'agencia' => $this->when($this->relationLoaded('agencia'), function () {
                return [
                    'id' => $this->agencia->id_agencias,
                    'nombre' => $this->agencia->agencias_nombre,
                ];
            }),
            'cargo' => $this->when($this->relationLoaded('cargo'), function () {
                return [
                    'id' => $this->cargo->id_cargo,
                    'nombre' => $this->cargo->cargo_nombre,
                    'descripcion' => $this->cargo->cargo_descripcion,
                ];
            }),
            'usuario_sistema' => $this->when($this->relationLoaded('usuario'), function () {
                return $this->usuario ? [
                    'id' => $this->usuario->id_usuarios,
                    'email' => $this->usuario->usuarios_correo,
                    'username' => $this->usuario->usuarios_nombre,
                    'activo' => $this->usuario->usuarios_activo,
                    'ultimo_acceso' => $this->usuario->last_login_at?->format('Y-m-d H:i:s'),
                ] : null;
            }),
            'estadisticas_trabajo' => $this->when($this->relationLoaded('rutasAsignadas'), function () {
                $rutasAsignadas = $this->rutasAsignadas ?? collect();
                $totalRutas = $rutasAsignadas->count();

                return [
                    'total_rutas_asignadas' => $totalRutas,
                    'rutas_este_mes' => $rutasAsignadas->where('ruta_activa_fecha', '>=', today()->startOfMonth())->count(),
                    'ultima_ruta_asignada' => $rutasAsignadas->max('ruta_activa_fecha')?->format('Y-m-d'),
                    'proxima_ruta' => $rutasAsignadas->where('ruta_activa_fecha', '>=', today())->min('ruta_activa_fecha')?->format('Y-m-d'),
                ];
            }),
            'metadatos' => [
                'creado_en' => $this->created_at?->format('Y-m-d H:i:s'),
                'actualizado_en' => $this->updated_at?->format('Y-m-d H:i:s'),
                'eliminado_en' => $this->deleted_at?->format('Y-m-d H:i:s'),
                'creado_por' => $this->created_by,
            ],
            'computed' => [
                'es_activo' => $this->empleados_activo,
                'tiene_usuario_sistema' => $this->relationLoaded('usuario') && $this->usuario !== null,
                'tiene_correo' => !empty($this->empleados_correo),
                'tiene_dpi' => !empty($this->empleados_dpi),
                'tiene_salario_configurado' => !empty($this->empleados_salario),
                'es_nuevo_empleado' => $this->empleados_fecha_ingreso && $this->empleados_fecha_ingreso->diffInMonths(today()) <= 3,
                'empleado_veterano' => $this->empleados_fecha_ingreso && $this->empleados_fecha_ingreso->diffInYears(today()) >= 5,
                'cumple_anos_este_mes' => $this->empleados_fecha_nacimiento && $this->empleados_fecha_nacimiento->month === today()->month,
                'aniversario_este_mes' => $this->empleados_fecha_ingreso && $this->empleados_fecha_ingreso->month === today()->month,
                'codigo_empleado' => 'EMP-' . str_pad($this->id_empleados, 4, '0', STR_PAD_LEFT),
                'iniciales' => $this->generarIniciales(),
            ],
        ];
    }

    /**
     * Formatear DPI guatemalteco
     */
    private function formatearDPI(string $dpi): string
    {
        if (strlen($dpi) === 13) {
            return substr($dpi, 0, 4) . ' ' . substr($dpi, 4, 5) . ' ' . substr($dpi, 9, 4);
        }

        return $dpi;
    }

    /**
     * Calcular antigüedad en texto legible
     */
    private function calcularAntiguedadTexto(): string
    {
        if (!$this->empleados_fecha_ingreso) {
            return 'No definido';
        }

        $anos = $this->empleados_fecha_ingreso->diffInYears(today());
        $meses = $this->empleados_fecha_ingreso->diffInMonths(today()) % 12;

        if ($anos === 0 && $meses === 0) {
            $dias = $this->empleados_fecha_ingreso->diffInDays(today());
            return $dias === 1 ? '1 día' : "{$dias} días";
        }

        if ($anos === 0) {
            return $meses === 1 ? '1 mes' : "{$meses} meses";
        }

        $texto = $anos === 1 ? '1 año' : "{$anos} años";

        if ($meses > 0) {
            $texto .= $meses === 1 ? ' y 1 mes' : " y {$meses} meses";
        }

        return $texto;
    }

    /**
     * Generar iniciales del empleado
     */
    private function generarIniciales(): string
    {
        $nombres = explode(' ', trim($this->empleados_nombres));
        $apellidos = explode(' ', trim($this->empleados_apellidos));

        $iniciales = '';

        // Primera letra del primer nombre
        if (isset($nombres[0])) {
            $iniciales .= strtoupper(substr($nombres[0], 0, 1));
        }

        // Primera letra del primer apellido
        if (isset($apellidos[0])) {
            $iniciales .= strtoupper(substr($apellidos[0], 0, 1));
        }

        return $iniciales;
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'links' => [
                'self' => route('empleados.show', ['empleado' => $this->id_empleados]),
                'update' => route('empleados.update', ['empleado' => $this->id_empleados]),
                'destroy' => route('empleados.destroy', ['empleado' => $this->id_empleados]),
            ],
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Empleado');
    }
}
