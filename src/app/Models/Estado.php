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
    // RELACIONES SEGÚN ESTRUCTURA DE BASE DE DATOS
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

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // =====================================================
    // SCOPES POR CATEGORÍA DE ESTADOS
    // =====================================================

    /**
     * Estados para vehículos
     */
    public function scopeVehiculos($query)
    {
        return $query->whereIn('estado_nombre', [
            'Disponible',
            'Mantenimiento',
            'Asignado'
        ]);
    }

    /**
     * Estados para rutas activas
     */
    public function scopeRutas($query)
    {
        return $query->whereIn('estado_nombre', [
            'Activada',
            'Llena',
            'Ejecución',
            'Cerrada',
            'Liquidar Ruta'
        ]);
    }

    /**
     * Estados para reservas
     */
    public function scopeReservas($query)
    {
        return $query->whereIn('estado_nombre', [
            'Pendiente',
            'Confirmada',
            'Transferida',
            'Reubicar',
            'Cancelada',
            'Pagada',
            'Confirmar Recibido'
        ]);
    }

    /**
     * Estados para contabilidad
     */
    public function scopeContabilidad($query)
    {
        return $query->whereIn('estado_nombre', [
            'Por Cobrar',
            'Cobrados'
        ]);
    }

    /**
     * Estados generales del sistema
     */
    public function scopeGenerales($query)
    {
        return $query->whereIn('estado_nombre', [
            'Activo',
            'Inactivo'
        ]);
    }

    // =====================================================
    // SCOPES POR ESTADO ESPECÍFICO
    // =====================================================

    public function scopePorNombre($query, $nombre)
    {
        return $query->where('estado_nombre', $nombre);
    }

    // Estados de Vehículos
    public function scopeDisponible($query)
    {
        return $query->where('estado_nombre', 'Disponible');
    }

    public function scopeMantenimiento($query)
    {
        return $query->where('estado_nombre', 'Mantenimiento');
    }

    public function scopeAsignado($query)
    {
        return $query->where('estado_nombre', 'Asignado');
    }

    // Estados de Rutas
    public function scopeActivada($query)
    {
        return $query->where('estado_nombre', 'Activada');
    }

    public function scopeLlena($query)
    {
        return $query->where('estado_nombre', 'Llena');
    }

    public function scopeEjecucion($query)
    {
        return $query->where('estado_nombre', 'Ejecución');
    }

    public function scopeCerrada($query)
    {
        return $query->where('estado_nombre', 'Cerrada');
    }

    public function scopeLiquidarRuta($query)
    {
        return $query->where('estado_nombre', 'Liquidar Ruta');
    }

    // Estados de Reservas
    public function scopePendiente($query)
    {
        return $query->where('estado_nombre', 'Pendiente');
    }

    public function scopeConfirmada($query)
    {
        return $query->where('estado_nombre', 'Confirmada');
    }

    public function scopePagada($query)
    {
        return $query->where('estado_nombre', 'Pagada');
    }

    public function scopeTransferida($query)
    {
        return $query->where('estado_nombre', 'Transferida');
    }

    public function scopeCancelada($query)
    {
        return $query->where('estado_nombre', 'Cancelada');
    }

    public function scopeConfirmarRecibido($query)
    {
        return $query->where('estado_nombre', 'Confirmar Recibido');
    }

    // Estados de Contabilidad
    public function scopePorCobrar($query)
    {
        return $query->where('estado_nombre', 'Por Cobrar');
    }

    public function scopeCobrados($query)
    {
        return $query->where('estado_nombre', 'Cobrados');
    }

    // =====================================================
    // MÉTODOS HELPER PARA VERIFICAR ESTADOS
    // =====================================================

    public function esDisponible()
    {
        return $this->estado_nombre === 'Disponible';
    }

    public function esActivada()
    {
        return $this->estado_nombre === 'Activada';
    }

    public function esPendiente()
    {
        return $this->estado_nombre === 'Pendiente';
    }

    public function esPagada()
    {
        return $this->estado_nombre === 'Pagada';
    }

    public function esTransferida()
    {
        return $this->estado_nombre === 'Transferida';
    }

    // =====================================================
    // MÉTODOS ESTÁTICOS PARA OBTENER ESTADOS ESPECÍFICOS
    // =====================================================

    /**
     * Obtener ID de estado por nombre
     */
    public static function obtenerPorNombre(string $nombre)
    {
        return static::where('estado_nombre', $nombre)->first();
    }

    /**
     * Obtener opciones para formularios por categoría
     */
    public static function opcionesVehiculos()
    {
        return static::vehiculos()->pluck('estado_nombre', 'estado_id');
    }

    public static function opcionesRutas()
    {
        return static::rutas()->pluck('estado_nombre', 'estado_id');
    }

    public static function opcionesReservas()
    {
        return static::reservas()->pluck('estado_nombre', 'estado_id');
    }

    public static function opcionesContabilidad()
    {
        return static::contabilidad()->pluck('estado_nombre', 'estado_id');
    }

    /**
     * Obtener todas las opciones para formularios
     */
    public static function opciones()
    {
        return static::orderBy('estado_nombre')
            ->pluck('estado_nombre', 'estado_id');
    }
}
