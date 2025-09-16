<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agencia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'agencias';
    protected $primaryKey = 'id_agencias';

    protected $fillable = [
        'agencias_nombre',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // =====================================================
    // RELACIONES SEGÚN ESTRUCTURA DE BASE DE DATOS
    // =====================================================

    // Relación con empleados
    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'id_agencias', 'id_agencias');
    }

    // Relación con rutas
    public function rutas()
    {
        return $this->hasMany(Ruta::class, 'id_agencias', 'id_agencias');
    }

    // Relación con tours
    public function tours()
    {
        return $this->hasMany(Tour::class, 'id_agencias', 'id_agencias');
    }

    // Relación con vehiculos
    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'id_agencias', 'id_agencias');
    }

    // Relación con reservas transferidas (como agencia que recibe transferencias)
    public function reservasTransferidas()
    {
        return $this->hasMany(Reserva::class, 'id_agencia_transferida', 'id_agencias');
    }

    // =====================================================
    // SCOPES PARA LÓGICA DE NEGOCIO MAGIC TRAVEL
    // =====================================================

    /**
     * Scope para obtener Magic Travel específicamente
     */
    public function scopeMagicTravel($query)
    {
        return $query->where('agencias_nombre', 'Magic Travel');
    }

    /**
     * Scope para obtener otras agencias (no Magic Travel)
     */
    public function scopeOtrasAgencias($query)
    {
        return $query->where('agencias_nombre', '!=', 'Magic Travel');
    }

    /**
     * Scope para agencias activas (no eliminadas)
     */
    public function scopeActivas($query)
    {
        return $query->whereNull('deleted_at');
    }

    // =====================================================
    // MÉTODOS HELPERS PARA LÓGICA DE TRANSFERENCIAS
    // =====================================================

    /**
     * Verificar si es Magic Travel
     */
    public function esMagicTravel()
    {
        return $this->agencias_nombre === 'Magic Travel';
    }

    /**
     * Obtener estadísticas básicas de la agencia
     */
    public function estadisticas()
    {
        return [
            'empleados_count' => $this->empleados()->count(),
            'rutas_count' => $this->rutas()->count(),
            'tours_count' => $this->tours()->count(),
            'vehiculos_count' => $this->vehiculos()->count(),
            'reservas_transferidas_count' => $this->reservasTransferidas()->count()
        ];
    }

    /**
     * Verificar si puede recibir transferencias
     * (todas las agencias pueden recibir transferencias)
     */
    public function puedeRecibirTransferencias()
    {
        return !$this->trashed();
    }

    // =====================================================
    // MÉTODOS ESTÁTICOS PARA CONSULTAS COMUNES
    // =====================================================

    /**
     * Obtener instancia de Magic Travel
     */
    public static function magicTravel()
    {
        return static::where('agencias_nombre', 'Magic Travel')->first();
    }

    /**
     * Obtener todas las agencias excepto Magic Travel para transferencias
     */
    public static function paraTransferencias()
    {
        return static::otrasAgencias()->activas()->get();
    }

    /**
     * Obtener opciones para formularios (id => nombre)
     */
    public static function opciones()
    {
        return static::activas()
            ->orderBy('agencias_nombre')
            ->pluck('agencias_nombre', 'id_agencias');
    }

    /**
     * Obtener opciones para transferencias (excluyendo Magic Travel)
     */
    public static function opcionesTransferencias()
    {
        return static::otrasAgencias()
            ->activas()
            ->orderBy('agencias_nombre')
            ->pluck('agencias_nombre', 'id_agencias');
    }
}
