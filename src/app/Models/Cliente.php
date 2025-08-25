<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Cliente extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'clientes';

    protected $fillable = [
        'persona_id',
        'codigo_cliente',
        'tipo_cliente_id',
        'pais_residencia_id',
        'ciudad_residencia',
        'fecha_registro',
        'limite_credito',
        'referido_por',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'fecha_registro' => 'date',
        'limite_credito' => 'decimal:2',
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

        static::creating(function ($cliente) {
            if (empty($cliente->codigo_cliente)) {
                $cliente->codigo_cliente = self::generarCodigoCliente();
            }
            if (empty($cliente->fecha_registro)) {
                $cliente->fecha_registro = now();
            }
        });
    }

    /**
     * Generar código único de cliente
     */
    public static function generarCodigoCliente()
    {
        $ultimo = self::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_cliente, 3)) + 1 : 1;
        return sprintf('CLI%06d', $numero);
    }

    /**
     * Relaciones
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }

    public function tipoCliente()
    {
        return $this->belongsTo(TipoCliente::class);
    }

    public function paisResidencia()
    {
        return $this->belongsTo(Pais::class, 'pais_residencia_id');
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
    public function getNombreCompletoAttribute()
    {
        return $this->persona ? $this->persona->nombre_completo : '';
    }

    public function getTotalComprasAttribute()
    {
        return $this->ventas()->sum('total_venta');
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

    /**
     * Scopes
     */
    public function scopeConCredito($query)
    {
        return $query->where('limite_credito', '>', 0);
    }

    public function scopePorTipo($query, $tipoId)
    {
        return $query->where('tipo_cliente_id', $tipoId);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->whereHas('persona', function ($q) use ($termino) {
            $q->buscar($termino);
        })->orWhere('codigo_cliente', 'like', "%{$termino}%");
    }

    /**
     * Validaciones
     */
    public function puedeComprarACredito($monto)
    {
        return $this->credito_disponible >= $monto;
    }
}
