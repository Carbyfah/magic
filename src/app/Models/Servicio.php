<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Servicio extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'servicio';
    protected $primaryKey = 'servicio_id';

    protected $fillable = [
        'servicio_codigo',
        'servicio_servicio',
        'servicio_precio_normal',
        'servicio_precio_descuento',
        'servicio_precio_total',
        'servicio_situacion'
    ];

    protected $casts = [
        'servicio_precio_normal' => 'decimal:2',
        'servicio_precio_descuento' => 'decimal:2',
        'servicio_precio_total' => 'decimal:2',
        'servicio_situacion' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    protected $appends = [
        'es_activo',
        'tipo_servicio',
        'precio_ninos_normal',
        'precio_ninos_descuento'
    ];

    /**
     * Relaciones
     */
    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'servicio_id', 'servicio_id');
    }

    public function facturas()
    {
        return $this->hasMany(Factura::class, 'servicio_id', 'servicio_id');
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->servicio_situacion === true;
    }

    public function getTipoServicioAttribute()
    {
        $nombre = strtolower($this->servicio_servicio ?? '');

        if (str_contains($nombre, 'tour')) {
            return 'Tour';
        } elseif (str_contains($nombre, 'transport')) {
            return 'Transporte';
        } elseif (str_contains($nombre, 'shuttle')) {
            return 'Shuttle';
        }

        return 'General';
    }

    public function getPrecioNinosNormalAttribute()
    {
        return $this->servicio_precio_normal ? $this->servicio_precio_normal * 0.5 : 0;
    }

    public function getPrecioNinosDescuentoAttribute()
    {
        return $this->servicio_precio_descuento ? $this->servicio_precio_descuento * 0.5 : 0;
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('servicio_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('servicio_codigo', $codigo);
    }

    public function scopeTours($query)
    {
        return $query->where('servicio_servicio', 'like', '%tour%');
    }

    public function scopeTransporte($query)
    {
        return $query->where('servicio_servicio', 'like', '%transport%');
    }

    public function scopeShuttle($query)
    {
        return $query->where('servicio_servicio', 'like', '%shuttle%');
    }

    public function scopeConPrecio($query)
    {
        return $query->whereNotNull('servicio_precio_normal')
            ->where('servicio_precio_normal', '>', 0);
    }

    /**
     * Métodos estáticos para servicios específicos
     */
    public static function transporteEstandar()
    {
        return self::where('servicio_codigo', 'TRANS_STD')->first();
    }

    public static function transportePremium()
    {
        return self::where('servicio_codigo', 'TRANS_PREM')->first();
    }

    public static function tourAntigua()
    {
        return self::where('servicio_codigo', 'TOUR_ANTI')->first();
    }

    public static function tourTikal()
    {
        return self::where('servicio_codigo', 'TOUR_TIKAL')->first();
    }

    public static function tourAtitlan()
    {
        return self::where('servicio_codigo', 'TOUR_ATIT')->first();
    }

    public static function shuttleAeropuerto()
    {
        return self::where('servicio_codigo', 'SHUTTLE')->first();
    }

    /**
     * Métodos de negocio
     */
    public function calcularPrecio($adultos, $ninos = 0, $esAgencia = false)
    {
        if (!$this->servicio_precio_normal || !$this->servicio_precio_descuento) {
            return 0;
        }

        $precioAdulto = $esAgencia ? $this->servicio_precio_descuento : $this->servicio_precio_normal;
        $precioNino = $precioAdulto * 0.5;

        return ($adultos * $precioAdulto) + ($ninos * $precioNino);
    }

    public function esTour()
    {
        return $this->tipo_servicio === 'Tour';
    }

    public function esTransporte()
    {
        return $this->tipo_servicio === 'Transporte';
    }

    public function esShuttle()
    {
        return $this->tipo_servicio === 'Shuttle';
    }

    public function tieneDescuento()
    {
        return $this->servicio_precio_descuento &&
            $this->servicio_precio_normal &&
            $this->servicio_precio_descuento < $this->servicio_precio_normal;
    }

    public function porcentajeDescuento()
    {
        if (!$this->tieneDescuento()) {
            return 0;
        }

        return round((1 - ($this->servicio_precio_descuento / $this->servicio_precio_normal)) * 100, 2);
    }

    public function tienePreciosCompletos()
    {
        return $this->servicio_precio_normal > 0 && $this->servicio_precio_descuento > 0;
    }
}
