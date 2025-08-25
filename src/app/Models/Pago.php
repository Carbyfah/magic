<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Pago extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'pagos';

    protected $fillable = [
        'numero_pago',
        'venta_id',
        'forma_pago_id',
        'monto',
        'fecha_pago',
        'referencia',
        'banco',
        'numero_autorizacion',
        'estado_pago_id',
        'empleado_cajero_id',
        'observaciones',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'monto' => 'decimal:2',
        'fecha_pago' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pago) {
            if (empty($pago->numero_pago)) {
                $pago->numero_pago = self::generarNumeroPago();
            }

            if (empty($pago->fecha_pago)) {
                $pago->fecha_pago = now();
            }
        });
    }

    /**
     * Generar número de pago único
     */
    public static function generarNumeroPago()
    {
        $fecha = date('Ymd');

        $ultimo = self::whereDate('created_at', now())
            ->orderBy('id', 'desc')
            ->first();

        if ($ultimo) {
            $partes = explode('-', $ultimo->numero_pago);
            $secuencial = isset($partes[2]) ? intval($partes[2]) + 1 : 1;
        } else {
            $secuencial = 1;
        }

        return sprintf('PAG-%s-%04d', $fecha, $secuencial);
    }

    /**
     * Relaciones
     */
    public function venta()
    {
        return $this->belongsTo(Venta::class);
    }

    public function formaPago()
    {
        return $this->belongsTo(FormaPago::class);
    }

    public function estadoPago()
    {
        return $this->belongsTo(EstadoPago::class);
    }

    public function empleadoCajero()
    {
        return $this->belongsTo(Empleado::class, 'empleado_cajero_id');
    }

    /**
     * Scopes
     */
    public function scopeConfirmados($query)
    {
        return $query->whereHas('estadoPago', function ($q) {
            $q->where('codigo', 'PAG');
        });
    }

    public function scopePorFormaPago($query, $formaPagoId)
    {
        return $query->where('forma_pago_id', $formaPagoId);
    }

    public function scopePorPeriodo($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha_pago', [$inicio, $fin]);
    }
}
