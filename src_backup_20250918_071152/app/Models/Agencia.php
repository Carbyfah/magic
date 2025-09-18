<?php
// =====================================================
// MODELO AGENCIA v4.0 - SOLO LÓGICA REAL
// =====================================================

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
    // RELACIONES SEGÚN DB v4.0
    // =====================================================

    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'id_agencias', 'id_agencias');
    }

    public function rutas()
    {
        return $this->belongsToMany(Ruta::class, 'agencias_rutas', 'id_agencias', 'id_rutas');
    }

    public function tours()
    {
        return $this->belongsToMany(Tour::class, 'agencias_tours', 'id_agencias', 'id_tours');
    }

    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'id_agencias', 'id_agencias');
    }

    public function reservasTransferidas()
    {
        return $this->hasMany(Reserva::class, 'id_agencia_transferida', 'id_agencias');
    }

    public function reservasOrigen()
    {
        return $this->hasMany(Reserva::class, 'agencia_origen', 'id_agencias');
    }

    public function serviciosPrecios()
    {
        return $this->hasMany(AgenciaServicioPrecio::class, 'id_agencias', 'id_agencias');
    }

    // =====================================================
    // LÓGICA MAGIC TRAVEL - 5 ESCENARIOS
    // =====================================================

    public function esMagicTravel()
    {
        return $this->agencias_nombre === 'Magic Travel';
    }

    public function scopeMagicTravel($query)
    {
        return $query->where('agencias_nombre', 'Magic Travel');
    }

    public function scopeOtrasAgencias($query)
    {
        return $query->where('agencias_nombre', '!=', 'Magic Travel');
    }

    public function scopeActivas($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function puedeRecibirTransferencias()
    {
        return !$this->trashed();
    }

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

    // =====================================================
    // MÉTODOS ESTÁTICOS PARA LOS 5 ESCENARIOS
    // =====================================================

    public static function magicTravel()
    {
        return static::where('agencias_nombre', 'Magic Travel')->first();
    }

    public static function paraTransferencias()
    {
        return static::otrasAgencias()->activas()->get();
    }

    public static function opciones()
    {
        return static::activas()
            ->orderBy('agencias_nombre')
            ->pluck('agencias_nombre', 'id_agencias');
    }

    public static function opcionesTransferencias()
    {
        return static::otrasAgencias()
            ->activas()
            ->orderBy('agencias_nombre')
            ->pluck('agencias_nombre', 'id_agencias');
    }
}

// =====================================================
// MODELO RUTA v4.0 - SOLO CAMPOS REALES
// =====================================================

class Ruta extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rutas';
    protected $primaryKey = 'id_rutas';

    protected $fillable = [
        'rutas_origen',
        'rutas_destino',
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

    public function agencias()
    {
        return $this->belongsToMany(Agencia::class, 'agencias_rutas', 'id_rutas', 'id_agencias');
    }

    public function rutasActivas()
    {
        return $this->hasMany(RutaActiva::class, 'id_rutas', 'id_rutas');
    }

    // =====================================================
    // SOLO LÓGICA NECESARIA MAGIC TRAVEL
    // =====================================================

    public function getRutaCompletaAttribute()
    {
        return "{$this->rutas_origen} → {$this->rutas_destino}";
    }

    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->whereHas('agencias', function ($q) use ($agenciaId) {
            $q->where('agencias.id_agencias', $agenciaId);
        });
    }

    public function scopePorOrigen($query, $origen)
    {
        return $query->where('rutas_origen', 'like', "%{$origen}%");
    }

    public function scopePorDestino($query, $destino)
    {
        return $query->where('rutas_destino', 'like', "%{$destino}%");
    }
}

// =====================================================
// MODELO TOUR v4.0 - SOLO CAMPOS REALES
// =====================================================

class Tour extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tours';
    protected $primaryKey = 'id_tours';

    protected $fillable = [
        'tours_nombre',
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

    public function agencias()
    {
        return $this->belongsToMany(Agencia::class, 'agencias_tours', 'id_tours', 'id_agencias');
    }

    public function toursActivos()
    {
        return $this->hasMany(TourActivo::class, 'id_tours', 'id_tours');
    }

    // =====================================================
    // SOLO LÓGICA NECESARIA MAGIC TRAVEL
    // =====================================================

    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->whereHas('agencias', function ($q) use ($agenciaId) {
            $q->where('agencias.id_agencias', $agenciaId);
        });
    }

    public function scopePorNombre($query, $nombre)
    {
        return $query->where('tours_nombre', 'like', "%{$nombre}%");
    }
}
