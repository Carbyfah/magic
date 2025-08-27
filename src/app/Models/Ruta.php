<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Ruta extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'ruta';
    protected $primaryKey = 'ruta_id';

    protected $fillable = [
        'ruta_codigo',
        'ruta_ruta',
        'ruta_origen',
        'ruta_destino',
        'ruta_situacion'
    ];

    protected $casts = [
        'ruta_situacion' => 'boolean',
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
        'ruta_completa',
        'direccion_ruta'
    ];

    /**
     * Relaciones
     */
    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'ruta_id', 'ruta_id');
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->ruta_situacion === true;
    }

    public function getRutaCompletaAttribute()
    {
        return $this->ruta_origen . ' → ' . $this->ruta_destino;
    }

    public function getDireccionRutaAttribute()
    {
        $origen = strtolower($this->ruta_origen ?? '');
        $destino = strtolower($this->ruta_destino ?? '');

        if (str_contains($origen, 'guatemala') && !str_contains($destino, 'guatemala')) {
            return 'Salida de Capital';
        } elseif (!str_contains($origen, 'guatemala') && str_contains($destino, 'guatemala')) {
            return 'Llegada a Capital';
        } elseif (str_contains($origen, 'aeroporto') || str_contains($destino, 'aeroporto')) {
            return 'Conexión Aeroporto';
        }

        return 'Intermedio';
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('ruta_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('ruta_codigo', $codigo);
    }

    public function scopeDesdeGuatemala($query)
    {
        return $query->where('ruta_origen', 'like', '%Guatemala%');
    }

    public function scopeHaciaGuatemala($query)
    {
        return $query->where('ruta_destino', 'like', '%Guatemala%');
    }

    public function scopeConAeropuerto($query)
    {
        return $query->where(function ($q) {
            $q->where('ruta_origen', 'like', '%Aeroporto%')
                ->orWhere('ruta_destino', 'like', '%Aeroporto%');
        });
    }

    /**
     * Métodos estáticos para rutas específicas
     */
    public static function guatemalaAntigua()
    {
        return self::where('ruta_codigo', 'GUATE_ANTI')->first();
    }

    public static function guatemalaAtitlan()
    {
        return self::where('ruta_codigo', 'GUATE_ATIT')->first();
    }

    public static function antiguaAtitlan()
    {
        return self::where('ruta_codigo', 'ANTI_ATIT')->first();
    }

    public static function guatemalaTikal()
    {
        return self::where('ruta_codigo', 'GUATE_TIKAL')->first();
    }

    public static function aeropuertoGuatemala()
    {
        return self::where('ruta_codigo', 'AERO_GUATE')->first();
    }

    public static function aeropuertoAntigua()
    {
        return self::where('ruta_codigo', 'AERO_ANTI')->first();
    }

    /**
     * Métodos de negocio
     */
    public function esRutaAeropuerto()
    {
        return str_contains(strtolower($this->ruta_origen ?? ''), 'aeroporto') ||
            str_contains(strtolower($this->ruta_destino ?? ''), 'aeroporto');
    }

    public function esRutaTuristica()
    {
        $destinos_turisticos = ['antigua', 'atitlan', 'tikal', 'quetzaltenango'];

        foreach ($destinos_turisticos as $destino) {
            if (str_contains(strtolower($this->ruta_destino ?? ''), $destino)) {
                return true;
            }
        }

        return false;
    }

    public function rutaInversa()
    {
        return self::where('ruta_origen', $this->ruta_destino)
            ->where('ruta_destino', $this->ruta_origen)
            ->first();
    }

    public function tieneRutasActivas()
    {
        return $this->rutasActivadas()->exists();
    }

    public function esPopular()
    {
        $count = $this->rutasActivadas()
            ->where('created_at', '>=', now()->subMonth())
            ->count();

        return $count > 5;
    }

    public function getDistanciaEstimada()
    {
        $distancias = [
            'guatemala-antigua' => 45,
            'guatemala-atitlan' => 150,
            'guatemala-tikal' => 550,
            'guatemala-quetzaltenango' => 200,
            'antigua-atitlan' => 120,
            'antigua-quetzaltenango' => 180,
            'aeroporto-guatemala' => 35,
            'aeroporto-antigua' => 50
        ];

        $key = strtolower($this->ruta_codigo ?? '');
        foreach ($distancias as $ruta => $km) {
            if (str_contains($key, str_replace('-', '_', $ruta))) {
                return $km;
            }
        }

        return null;
    }
}
