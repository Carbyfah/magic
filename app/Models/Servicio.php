<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Servicio extends Model
{
    use SoftDeletes;

    protected $table = 'servicio';
    protected $primaryKey = 'servicio_id';

    protected $fillable = [
        'servicio_codigo',
        'servicio_servicio',
        'servicio_precio_normal',
        'servicio_precio_descuento',
        'servicio_situacion'
    ];

    protected $casts = [
        'servicio_precio_normal' => 'decimal:2',
        'servicio_precio_descuento' => 'decimal:2',
        'servicio_situacion' => 'boolean',
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
    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'servicio_id', 'servicio_id');
    }

    public function facturas()
    {
        return $this->hasMany(Factura::class, 'servicio_id', 'servicio_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('servicio_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('servicio_servicio', 'like', "%{$termino}%")
            ->orWhere('servicio_codigo', 'like', "%{$termino}%");
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('servicio_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->servicio_codigo, -3)) + 1 : 1;
        return 'SRV-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function tieneReservasActivas()
    {
        return $this->rutasActivadas()
            ->whereHas('reservas', function ($query) {
                $query->where('reserva_situacion', 1);
            })
            ->exists();
    }

    public function getPrecioParaAgenciaAttribute()
    {
        return $this->servicio_precio_descuento ?: $this->servicio_precio_normal;
    }
}
