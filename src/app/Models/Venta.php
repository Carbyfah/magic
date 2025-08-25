<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;
use Carbon\Carbon;

class Venta extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'ventas';

    protected $fillable = [
        'numero_venta',
        'reserva_id',
        'cliente_id',
        'agencia_id',
        'empleado_vendedor_id',
        'fecha_hora_venta',
        'tipo_venta_id',
        'cantidad_adultos',
        'cantidad_ninos',
        'precio_unitario_adulto',
        'precio_unitario_nino',
        'subtotal',
        'descuento_monto',
        'impuesto_monto',
        'total_venta',
        'comision_agencia',
        'comision_vendedor',
        'estado_venta_id',
        'notas',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'fecha_hora_venta' => 'datetime',
        'cantidad_adultos' => 'integer',
        'cantidad_ninos' => 'integer',
        'precio_unitario_adulto' => 'decimal:2',
        'precio_unitario_nino' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'descuento_monto' => 'decimal:2',
        'impuesto_monto' => 'decimal:2',
        'total_venta' => 'decimal:2',
        'comision_agencia' => 'decimal:2',
        'comision_vendedor' => 'decimal:2',
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

        static::creating(function ($venta) {
            if (empty($venta->numero_venta)) {
                $venta->numero_venta = self::generarNumeroVenta();
            }

            if (empty($venta->fecha_hora_venta)) {
                $venta->fecha_hora_venta = Carbon::now();
            }

            // Calcular subtotal si no está establecido
            if (empty($venta->subtotal)) {
                $venta->subtotal = ($venta->cantidad_adultos * $venta->precio_unitario_adulto) +
                    ($venta->cantidad_ninos * $venta->precio_unitario_nino);
            }

            // Calcular total si no está establecido
            if (empty($venta->total_venta)) {
                $venta->total_venta = $venta->subtotal - $venta->descuento_monto + $venta->impuesto_monto;
            }
        });
    }

    /**
     * Generar número de venta único
     */
    public static function generarNumeroVenta()
    {
        $año = date('Y');
        $mes = date('m');

        $ultima = self::whereYear('created_at', $año)
            ->whereMonth('created_at', $mes)
            ->orderBy('id', 'desc')
            ->first();

        if ($ultima) {
            $partes = explode('-', $ultima->numero_venta);
            $secuencial = isset($partes[2]) ? intval($partes[2]) + 1 : 1;
        } else {
            $secuencial = 1;
        }

        return sprintf('VTA-%s%s-%05d', $año, $mes, $secuencial);
    }

    /**
     * Relaciones
     */
    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function agencia()
    {
        return $this->belongsTo(Agencia::class);
    }

    public function empleadoVendedor()
    {
        return $this->belongsTo(Empleado::class, 'empleado_vendedor_id');
    }

    public function tipoVenta()
    {
        return $this->belongsTo(TipoVenta::class);
    }

    public function estadoVenta()
    {
        return $this->belongsTo(EstadoVenta::class);
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }

    /**
     * Atributos calculados
     */
    public function getTotalPagadoAttribute()
    {
        return $this->pagos()
            ->whereHas('estadoPago', function ($q) {
                $q->where('codigo', 'PAG');
            })
            ->sum('monto');
    }

    public function getSaldoPendienteAttribute()
    {
        return $this->total_venta - $this->total_pagado;
    }

    public function getEstaPagadaAttribute()
    {
        return $this->saldo_pendiente <= 0;
    }

    public function getEsModificableAttribute()
    {
        return $this->estadoVenta && $this->estadoVenta->modificable;
    }

    public function getPorcentajeDescuentoAttribute()
    {
        if ($this->subtotal == 0) return 0;
        return round(($this->descuento_monto / $this->subtotal) * 100, 2);
    }

    /**
     * Scopes
     */
    public function scopePorPeriodo($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha_hora_venta', [$inicio, $fin]);
    }

    public function scopePagadas($query)
    {
        return $query->whereHas('pagos', function ($q) {
            $q->whereHas('estadoPago', function ($q2) {
                $q2->where('codigo', 'PAG');
            });
        });
    }

    public function scopePendientes($query)
    {
        return $query->whereDoesntHave('pagos', function ($q) {
            $q->whereHas('estadoPago', function ($q2) {
                $q2->where('codigo', 'PAG');
            });
        });
    }

    public function scopePorVendedor($query, $empleadoId)
    {
        return $query->where('empleado_vendedor_id', $empleadoId);
    }

    /**
     * Métodos de negocio
     */
    public function anular($motivo = null)
    {
        $estadoAnulado = EstadoVenta::where('codigo', 'ANUL')->first();
        if (!$estadoAnulado) {
            throw new \Exception('Estado ANUL no encontrado');
        }

        $this->estado_venta_id = $estadoAnulado->id;
        if ($motivo) {
            $this->notas = $this->notas . "\nANULADO: " . $motivo;
        }
        $this->save();

        return $this;
    }

    public function aplicarDescuento($porcentaje, $autorizado_por = null)
    {
        $descuento = $this->subtotal * ($porcentaje / 100);
        $this->descuento_monto = $descuento;
        $this->total_venta = $this->subtotal - $descuento + $this->impuesto_monto;

        if ($autorizado_por) {
            $this->notas = $this->notas . "\nDescuento {$porcentaje}% autorizado por: {$autorizado_por}";
        }

        $this->save();

        return $this;
    }

    public function calcularComisiones()
    {
        // Comisión de agencia
        if ($this->agencia && $this->tipoVenta->genera_comision) {
            $this->comision_agencia = $this->total_venta * ($this->agencia->comision_porcentaje / 100);
        }

        // Comisión de vendedor (ejemplo: 2% de la venta)
        $this->comision_vendedor = $this->total_venta * 0.02;

        $this->save();

        return $this;
    }
}
