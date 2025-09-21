<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estado extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'estado';
    protected $primaryKey = 'estado_id';

    protected $fillable = [
        'estado_nombre',
        'estado_descripcion',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // =====================================================
    // RELACIONES SEGÚN DB v4.0
    // =====================================================

    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'estado_id', 'estado_id');
    }

    public function rutasActivas()
    {
        return $this->hasMany(RutaActiva::class, 'estado_id', 'estado_id');
    }

    public function toursActivos()
    {
        return $this->hasMany(TourActivo::class, 'estado_id', 'estado_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'estado_id', 'estado_id');
    }

    public function cajas()
    {
        return $this->hasMany(Caja::class, 'estado_id', 'estado_id');
    }

    // =====================================================
    // SCOPES POR TIPO DE ESTADO - DINÁMICOS SEGÚN SEEDER
    // =====================================================

    public function scopeVehiculos($query)
    {
        return $query->where(function ($q) {
            $q->where('estado_descripcion', 'like', '%asignarse%')
                ->orWhere('estado_descripcion', 'like', '%taller%')
                ->orWhere('estado_descripcion', 'like', '%ruta activa%');
        });
    }

    public function scopeRutas($query)
    {
        return $query->where(function ($q) {
            $q->where('estado_descripcion', 'like', '%recibir reservas%')
                ->orWhere('estado_descripcion', 'like', '%capacidad%')
                ->orWhere('estado_descripcion', 'like', '%viaje%')
                ->orWhere('estado_descripcion', 'like', '%Completada%')
                ->orWhere('estado_descripcion', 'like', '%liquidar%');
        });
    }

    public function scopeReservas($query)
    {
        return $query->where(function ($q) {
            $q->where('estado_descripcion', 'like', '%confirma%')
                ->orWhere('estado_descripcion', 'like', '%ejecutar%')
                ->orWhere('estado_descripcion', 'like', '%transfiere%')
                ->orWhere('estado_descripcion', 'like', '%otra ruta%')
                ->orWhere('estado_descripcion', 'like', '%no se ejecutará%');
        });
    }

    public function scopeContabilidad($query)
    {
        return $query->where(function ($q) {
            $q->where('estado_descripcion', 'like', '%cobro%')
                ->orWhere('estado_descripcion', 'like', '%cobrado%')
                ->orWhere('estado_descripcion', 'like', '%pagó%')
                ->orWhere('estado_descripcion', 'like', '%entregó%');
        });
    }

    public function scopeGenerales($query)
    {
        return $query->where(function ($q) {
            $q->where('estado_descripcion', 'like', '%activo%')
                ->orWhere('estado_descripcion', 'like', '%inactivo%');
        });
    }

    // =====================================================
    // BÚSQUEDA Y FILTROS
    // =====================================================

    public function scopePorNombre($query, $nombre)
    {
        return $query->where('estado_nombre', 'like', "%{$nombre}%");
    }

    public function scopePorDescripcion($query, $descripcion)
    {
        return $query->where('estado_descripcion', 'like', "%{$descripcion}%");
    }

    public function scopeActivos($query)
    {
        return $query->whereNull('deleted_at');
    }

    // =====================================================
    // MÉTODOS ESTÁTICOS PARA OPCIONES
    // =====================================================

    public static function obtenerPorNombre($nombre)
    {
        return static::where('estado_nombre', $nombre)->first();
    }

    public static function opciones()
    {
        return static::activos()
            ->orderBy('estado_nombre')
            ->pluck('estado_nombre', 'estado_id');
    }

    public static function opcionesVehiculos()
    {
        return static::vehiculos()
            ->activos()
            ->orderBy('estado_nombre')
            ->pluck('estado_nombre', 'estado_id');
    }

    public static function opcionesRutas()
    {
        return static::rutas()
            ->activos()
            ->orderBy('estado_nombre')
            ->pluck('estado_nombre', 'estado_id');
    }

    public static function opcionesReservas()
    {
        return static::reservas()
            ->activos()
            ->orderBy('estado_nombre')
            ->pluck('estado_nombre', 'estado_id');
    }

    public static function opcionesContabilidad()
    {
        return static::contabilidad()
            ->activos()
            ->orderBy('estado_nombre')
            ->pluck('estado_nombre', 'estado_id');
    }

    // =====================================================
    // ESTADOS CRÍTICOS DEL SISTEMA - NO HARDCODEAR
    // =====================================================

    public function esCritico()
    {
        // Usando lógica dinámica basada en uso del sistema
        $stats = $this->estadisticas();
        return $stats['uso_total'] > 0;
    }

    public function puedeEliminar()
    {
        // No puede eliminar si está en uso en cualquier tabla
        return $this->vehiculos()->count() === 0 &&
            $this->rutasActivas()->count() === 0 &&
            $this->toursActivos()->count() === 0 &&
            $this->reservas()->count() === 0 &&
            $this->cajas()->count() === 0;
    }

    public function puedeEditar()
    {
        // Puede editar descripción siempre, nombre solo si no está en uso crítico
        return true; // La validación específica se hace en el controller
    }

    // =====================================================
    // ESTADÍSTICAS Y CONTEOS
    // =====================================================

    public function estadisticas()
    {
        $vehiculos_count = $this->vehiculos()->count();
        $rutas_activas_count = $this->rutasActivas()->count();
        $tours_activos_count = $this->toursActivos()->count();
        $reservas_count = $this->reservas()->count();
        $cajas_count = $this->cajas()->count();

        return [
            'vehiculos_count' => $vehiculos_count,
            'rutas_activas_count' => $rutas_activas_count,
            'tours_activos_count' => $tours_activos_count,
            'reservas_count' => $reservas_count,
            'cajas_count' => $cajas_count,
            'uso_total' => $vehiculos_count + $rutas_activas_count + $tours_activos_count + $reservas_count + $cajas_count
        ];
    }
}
