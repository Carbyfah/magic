<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehiculo extends Model
{
    use SoftDeletes;

    protected $table = 'vehiculo';
    protected $primaryKey = 'vehiculo_id';

    protected $fillable = [
        'vehiculo_codigo',
        'vehiculo_placa',
        'vehiculo_marca',
        'vehiculo_modelo',
        'vehiculo_capacidad',
        'vehiculo_situacion',
        'estado_id'
    ];

    protected $casts = [
        'vehiculo_situacion' => 'boolean',
        'vehiculo_capacidad' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * RELACIONES BÁSICAS
     */
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'vehiculo_id', 'vehiculo_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('vehiculo_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('vehiculo_placa', 'like', "%{$termino}%")
            ->orWhere('vehiculo_marca', 'like', "%{$termino}%")
            ->orWhere('vehiculo_modelo', 'like', "%{$termino}%")
            ->orWhere('vehiculo_codigo', 'like', "%{$termino}%");
    }

    public function scopePorEstado($query, $estadoId)
    {
        return $query->where('estado_id', $estadoId);
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('vehiculo_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->vehiculo_codigo, -3)) + 1 : 1;
        return 'VEH-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->vehiculo_marca} {$this->vehiculo_modelo}";
    }

    public function getEstadoNombreAttribute()
    {
        return $this->estado ? $this->estado->estado_estado : 'Sin estado';
    }

    public function getIniciales()
    {
        $marca = explode(' ', trim($this->vehiculo_marca));
        $modelo = explode(' ', trim($this->vehiculo_modelo ?? ''));

        $inicial_marca = !empty($marca[0]) ? strtoupper(substr($marca[0], 0, 1)) : '';
        $inicial_modelo = !empty($modelo[0]) ? strtoupper(substr($modelo[0], 0, 1)) : '';

        return $inicial_marca . $inicial_modelo;
    }

    /**
     * VALIDACIONES DE NEGOCIO
     */
    public function tieneRutasActivadas()
    {
        return $this->rutasActivadas && $this->rutasActivadas()->where('ruta_activada_situacion', 1)->exists();
    }

    public function puedeSerEliminado()
    {
        // No se puede eliminar si tiene rutas activadas
        return !$this->tieneRutasActivadas();
    }

    /**
     * MÉTODOS DE FORMATO
     */
    public function formatearCapacidad()
    {
        if (!$this->vehiculo_capacidad) return 'Sin capacidad';

        return $this->vehiculo_capacidad . ' pasajeros';
    }

    /**
     * MÉTODOS DE GESTIÓN DE ESTADOS - Agregar al modelo Vehiculo
     */

    // Verificar si el vehículo está disponible para asignación
    public function estaDisponible()
    {
        return $this->estado && strtolower($this->estado->estado_estado) === 'disponible';
    }

    // Verificar si el vehículo está asignado a una ruta
    public function estaAsignado()
    {
        return $this->estado && strtolower($this->estado->estado_estado) === 'asignado';
    }

    // Verificar si el vehículo está en mantenimiento
    public function estaEnMantenimiento()
    {
        return $this->estado && strtolower($this->estado->estado_estado) === 'mantenimiento';
    }

    // Verificar si tiene rutas activadas activas (no cerradas)
    public function tieneRutasActivas()
    {
        return $this->rutasActivadas()
            ->whereHas('estado', function ($query) {
                $query->whereIn('estado_estado', ['activada', 'llena', 'ejecucion']);
            })
            ->where('ruta_activada_situacion', 1)
            ->exists();
    }

    /**
     * VALIDACIONES ANTES DE CAMBIO DE ESTADO
     */

    // Validar si puede cambiar a estado 'asignado'
    public function puedeAsignarse()
    {
        $validacion = [
            'puede_asignarse' => false,
            'mensaje' => '',
            'tipo_notificacion' => 'error'
        ];

        if (!$this->estaDisponible()) {
            $estadoActual = $this->estado_nombre;
            $validacion['mensaje'] = "No se puede asignar el vehículo. Estado actual: {$estadoActual}. Solo se pueden asignar vehículos disponibles.";
            return $validacion;
        }

        if ($this->tieneRutasActivas()) {
            $validacion['mensaje'] = "El vehículo ya tiene rutas activas asignadas. No se puede reasignar hasta cerrar las rutas existentes.";
            return $validacion;
        }

        $validacion['puede_asignarse'] = true;
        $validacion['mensaje'] = "Vehículo disponible para asignación.";
        $validacion['tipo_notificacion'] = 'success';

        return $validacion;
    }

    // Validar si puede cambiar a estado 'disponible'
    public function puedeVolverDisponible()
    {
        $validacion = [
            'puede_disponible' => false,
            'mensaje' => '',
            'tipo_notificacion' => 'error'
        ];

        if ($this->estaEnMantenimiento()) {
            $validacion['mensaje'] = "El vehículo está en mantenimiento. Complete las reparaciones antes de marcarlo como disponible.";
            return $validacion;
        }

        if ($this->tieneRutasActivas()) {
            $rutasActivas = $this->rutasActivadas()
                ->whereHas('estado', function ($query) {
                    $query->whereIn('estado_estado', ['activada', 'llena', 'ejecucion']);
                })
                ->where('ruta_activada_situacion', 1)
                ->count();

            $validacion['mensaje'] = "El vehículo tiene {$rutasActivas} ruta(s) activa(s). Debe cerrar todas las rutas antes de marcarlo como disponible.";
            $validacion['tipo_notificacion'] = 'warning';
            return $validacion;
        }

        $validacion['puede_disponible'] = true;
        $validacion['mensaje'] = "El vehículo puede marcarse como disponible.";
        $validacion['tipo_notificacion'] = 'success';

        return $validacion;
    }

    /**
     * CAMBIOS AUTOMÁTICOS DE ESTADO
     */

    // Cambiar automáticamente a estado 'asignado'
    public function asignarAutomaticamente()
    {
        $validacion = $this->puedeAsignarse();

        if (!$validacion['puede_asignarse']) {
            return $validacion;
        }

        $estadoAsignado = \App\Models\Estado::where('estado_estado', 'asignado')->first();

        if (!$estadoAsignado) {
            return [
                'success' => false,
                'mensaje' => 'Error del sistema: Estado "asignado" no encontrado.',
                'tipo_notificacion' => 'error'
            ];
        }

        $this->estado_id = $estadoAsignado->estado_id;
        $this->save();

        return [
            'success' => true,
            'mensaje' => "Vehículo {$this->vehiculo_codigo} asignado automáticamente.",
            'tipo_notificacion' => 'success'
        ];
    }

    /**
     * SISTEMA DE NOTIFICACIONES POR ESTADO
     */

    // Obtener notificaciones según el estado actual del vehículo
    public function obtenerNotificacionesEstado()
    {
        $notificaciones = [];

        if ($this->estaAsignado() && $this->tieneRutasActivas()) {
            $rutasActivas = $this->rutasActivadas()
                ->whereHas('estado', function ($query) {
                    $query->whereIn('estado_estado', ['activada', 'llena', 'ejecucion']);
                })
                ->where('ruta_activada_situacion', 1)
                ->get();

            foreach ($rutasActivas as $ruta) {
                $notificaciones[] = [
                    'tipo' => 'info',
                    'mensaje' => "Vehículo asignado a ruta: {$ruta->ruta_activada_codigo} ({$ruta->estado_nombre})",
                    'accion_requerida' => false
                ];
            }
        }

        if ($this->estaAsignado() && !$this->tieneRutasActivas()) {
            $notificaciones[] = [
                'tipo' => 'warning',
                'mensaje' => "Vehículo marcado como asignado pero sin rutas activas. Considere marcarlo como disponible.",
                'accion_requerida' => true
            ];
        }

        if ($this->estaEnMantenimiento()) {
            $notificaciones[] = [
                'tipo' => 'warning',
                'mensaje' => "Vehículo en mantenimiento. No se puede asignar a rutas hasta completar reparaciones.",
                'accion_requerida' => false
            ];
        }

        return $notificaciones;
    }
}
