<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Agencia extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'agencias';

    protected $fillable = [
        'codigo_agencia',
        'razon_social',
        'nombre_comercial',
        'nit',
        'registro_turistico',
        'direccion',
        'telefono_principal',
        'telefono_secundario',
        'email_principal',
        'whatsapp',
        'pais_id',
        'contacto_nombre',
        'contacto_cargo',
        'contacto_telefono',
        'contacto_email',
        'tipo_agencia_id',
        'comision_porcentaje',
        'limite_credito',
        'fecha_inicio_relacion',
        'forma_pago_id',
        'estado_comercial_id',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'comision_porcentaje' => 'decimal:2',
        'limite_credito' => 'decimal:2',
        'fecha_inicio_relacion' => 'date',
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

        static::creating(function ($agencia) {
            if (empty($agencia->codigo_agencia)) {
                $agencia->codigo_agencia = self::generarCodigoAgencia();
            }
        });
    }

    /**
     * Generar código único de agencia
     */
    public static function generarCodigoAgencia()
    {
        $ultimo = self::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_agencia, 3)) + 1 : 1;
        return sprintf('AGE%04d', $numero);
    }

    /**
     * Relaciones
     */
    public function pais()
    {
        return $this->belongsTo(Pais::class);
    }

    public function tipoAgencia()
    {
        return $this->belongsTo(TipoAgencia::class);
    }

    public function formaPago()
    {
        return $this->belongsTo(FormaPago::class);
    }

    public function estadoComercial()
    {
        return $this->belongsTo(EstadoComercial::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    /**
     * Atributos calculados
     */
    public function getTotalVentasAttribute()
    {
        return $this->ventas()->sum('total_venta');
    }

    public function getTotalComisionesAttribute()
    {
        return $this->ventas()->sum('comision_agencia');
    }

    public function getCreditoDisponibleAttribute()
    {
        $pendiente = $this->ventas()
            ->whereHas('estadoVenta', function ($q) {
                $q->where('cuenta_ingreso', true);
            })
            ->whereDoesntHave('pagos', function ($q) {
                $q->whereHas('estadoPago', function ($q2) {
                    $q2->where('codigo', 'PAG');
                });
            })
            ->sum('total_venta');

        return $this->limite_credito - $pendiente;
    }

    public function getAntiguedadAttribute()
    {
        if (!$this->fecha_inicio_relacion) return null;
        return $this->fecha_inicio_relacion->diffInYears(now());
    }

    /**
     * Scopes
     */
    public function scopeActivas($query)
    {
        return $query->whereHas('estadoComercial', function ($q) {
            $q->where('codigo', 'ACT');
        });
    }

    public function scopePorTipo($query, $tipoId)
    {
        return $query->where('tipo_agencia_id', $tipoId);
    }

    public function scopePorPais($query, $paisId)
    {
        return $query->where('pais_id', $paisId);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('razon_social', 'like', "%{$termino}%")
                ->orWhere('nombre_comercial', 'like', "%{$termino}%")
                ->orWhere('nit', 'like', "%{$termino}%")
                ->orWhere('codigo_agencia', 'like', "%{$termino}%");
        });
    }

    /**
     * Métodos de negocio
     */
    public function puedeOperar()
    {
        return $this->situacion &&
            $this->estadoComercial &&
            $this->estadoComercial->codigo === 'ACT';
    }

    public function calcularComision($monto)
    {
        return $monto * ($this->comision_porcentaje / 100);
    }
}
