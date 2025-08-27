<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Agencia extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'agencia';
    protected $primaryKey = 'agencia_id';

    protected $fillable = [
        'agencia_codigo',
        'agencia_razon_social',
        'agencia_nit',
        'agencia_email',
        'agencia_telefono',
        'agencia_situacion'
    ];

    protected $casts = [
        'agencia_telefono' => 'integer',
        'agencia_situacion' => 'boolean',
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
        'telefono_formateado',
        'tipo_agencia'
    ];

    /**
     * Relaciones
     */
    public function contactos()
    {
        return $this->hasMany(ContactoAgencia::class, 'agencia_id', 'agencia_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'agencia_id', 'agencia_id');
    }

    public function contactoPrincipal()
    {
        return $this->hasOne(ContactoAgencia::class, 'agencia_id', 'agencia_id')
            ->where('contactos_agencia_situacion', true)
            ->oldest();
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->agencia_situacion === true;
    }

    public function getTelefonoFormateadoAttribute()
    {
        if (!$this->agencia_telefono) {
            return null;
        }

        $telefono = (string) $this->agencia_telefono;

        // Formato guatemalteco: +502 1234-5678
        if (strlen($telefono) === 11 && substr($telefono, 0, 3) === '502') {
            return '+502 ' . substr($telefono, 3, 4) . '-' . substr($telefono, 7);
        }

        return $telefono;
    }

    public function getTipoAgenciaAttribute()
    {
        $razon = strtolower($this->agencia_razon_social ?? '');

        if (str_contains($razon, 'internacional')) {
            return 'Internacional';
        } elseif (str_contains($razon, 'tour')) {
            return 'Operador Turístico';
        } elseif (str_contains($razon, 'travel')) {
            return 'Agencia de Viajes';
        }

        return 'Colaborador';
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('agencia_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('agencia_codigo', $codigo);
    }

    public function scopeConReservas($query)
    {
        return $query->has('reservas');
    }

    public function scopeInternacionales($query)
    {
        return $query->where('agencia_razon_social', 'like', '%internacional%');
    }

    public function scopeOperadoresTuristicos($query)
    {
        return $query->where('agencia_razon_social', 'like', '%tour%');
    }

    public function scopeConContactos($query)
    {
        return $query->has('contactos');
    }

    /**
     * Métodos estáticos para agencias específicas
     */
    public static function turismoGuatemala()
    {
        return self::where('agencia_codigo', 'GUAT001')->first();
    }

    public static function mayaWorldTours()
    {
        return self::where('agencia_codigo', 'MAYA001')->first();
    }

    public static function antiguaTours()
    {
        return self::where('agencia_codigo', 'ANTI001')->first();
    }

    /**
     * Métodos de negocio
     */
    public function esInternacional()
    {
        return $this->tipo_agencia === 'Internacional';
    }

    public function esOperadorTuristico()
    {
        return $this->tipo_agencia === 'Operador Turístico';
    }

    public function tieneContactoActivo()
    {
        return $this->contactos()->where('contactos_agencia_situacion', true)->exists();
    }

    public function getTotalReservasMes()
    {
        return $this->reservas()
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
    }

    public function esClienteVip()
    {
        $totalUltimosTresMeses = $this->reservas()
            ->where('created_at', '>=', now()->subMonths(3))
            ->count();

        return $this->getTotalReservasMes() > 10 || $totalUltimosTresMeses > 25;
    }

    public function ingresosTotales($fechaInicio = null, $fechaFin = null)
    {
        $query = $this->reservas();

        if ($fechaInicio) {
            $query->where('created_at', '>=', $fechaInicio);
        }

        if ($fechaFin) {
            $query->where('created_at', '<=', $fechaFin);
        }

        return $query->sum('reserva_monto') ?? 0;
    }

    public function comisionesGeneradas($fechaInicio = null, $fechaFin = null)
    {
        return $this->ingresosTotales($fechaInicio, $fechaFin) * 0.10;
    }

    public function estaActiva()
    {
        $tieneReservasRecientes = $this->reservas()
            ->where('created_at', '>=', now()->subMonths(6))
            ->exists();

        return $this->agencia_situacion &&
            $this->tieneContactoActivo() &&
            $tieneReservasRecientes;
    }

    public function necesitaSeguimiento()
    {
        return !$this->reservas()
            ->where('created_at', '>=', now()->subMonths(2))
            ->exists();
    }
}
