<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\HasAudit;
use Illuminate\Support\Facades\Hash;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes, HasAudit;

    protected $table = 'usuario';
    protected $primaryKey = 'usuario_id';

    protected $fillable = [
        'usuario_codigo',
        'usuario_password',
        'usuario_situacion',
        'persona_id',
        'rol_id'
    ];

    protected $casts = [
        'usuario_situacion' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'email_verified_at' => 'datetime'
    ];

    protected $hidden = [
        'usuario_password',
        'remember_token',
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    protected $appends = [
        'es_activo',
        'nombre_completo'
    ];

    /**
     * Relaciones
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'persona_id', 'persona_id');
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id', 'rol_id');
    }

    public function reservasCreadas()
    {
        return $this->hasMany(Reserva::class, 'usuario_id', 'usuario_id');
    }

    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'usuario_id', 'usuario_id');
    }

    public function facturasEmitidas()
    {
        return $this->hasMany(Factura::class, 'usuario_id', 'usuario_id');
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->usuario_situacion === true;
    }

    public function getNombreCompletoAttribute()
    {
        return $this->persona ? $this->persona->nombre_completo : 'Usuario sin nombre';
    }

    /**
     * Métodos requeridos por Authenticatable
     */
    public function getAuthIdentifierName()
    {
        return 'usuario_id';
    }

    public function getAuthIdentifier()
    {
        return $this->usuario_id;
    }

    public function getAuthPassword()
    {
        return $this->usuario_password;
    }

    public function getRememberToken()
    {
        return $this->remember_token;
    }

    public function setRememberToken($value)
    {
        $this->remember_token = $value;
    }

    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    /**
     * Atributos para email (usando persona)
     */
    public function getEmailAttribute()
    {
        return $this->persona ? $this->persona->persona_email : null;
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('usuario_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('usuario_codigo', $codigo);
    }

    public function scopePorRol($query, $rolCodigo)
    {
        return $query->whereHas('rol', function ($q) use ($rolCodigo) {
            $q->where('rol_codigo', $rolCodigo);
        });
    }

    public function scopeAdministradores($query)
    {
        return $query->whereHas('rol', function ($q) {
            $q->where('rol_codigo', 'ADMIN');
        });
    }

    public function scopeVendedores($query)
    {
        return $query->whereHas('rol', function ($q) {
            $q->where('rol_codigo', 'VENDEDOR');
        });
    }

    public function scopeChoferes($query)
    {
        return $query->whereHas('rol', function ($q) {
            $q->where('rol_codigo', 'CHOFER');
        });
    }

    public function scopeConPersona($query)
    {
        return $query->has('persona');
    }

    /**
     * Métodos de autenticación y seguridad
     */
    public function setPasswordAttribute($password)
    {
        $this->usuario_password = Hash::make($password);
    }

    public function verificarPassword($password)
    {
        return Hash::check($password, $this->usuario_password);
    }

    public function generarCodigoUnico()
    {
        if ($this->rol) {
            $prefijo = substr($this->rol->rol_codigo, 0, 3);
            $numero = str_pad($this->usuario_id ?? 0, 3, '0', STR_PAD_LEFT);

            return strtoupper($prefijo . $numero);
        }

        return 'USR' . str_pad($this->usuario_id ?? 0, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Métodos de permisos
     */
    public function esAdministrador()
    {
        return $this->rol && $this->rol->esAdministrador();
    }

    public function esGerente()
    {
        return $this->rol && $this->rol->esGerente();
    }

    public function puedeVender()
    {
        return $this->rol && $this->rol->puedeVender();
    }

    public function puedeOperar()
    {
        return $this->rol && $this->rol->puedeOperar();
    }

    public function tienePermiso($recurso)
    {
        return $this->rol && $this->rol->puedeGestionar($recurso);
    }

    public function tieneAccesoCompleto()
    {
        return $this->rol && $this->rol->tieneAccesoCompleto();
    }

    public function tieneNivelMinimo($nivel)
    {
        return $this->rol && $this->rol->tieneNivelMinimo($nivel);
    }

    /**
     * Métodos de negocio
     */
    public function estaActivo()
    {
        return $this->usuario_situacion &&
            $this->persona &&
            $this->persona->persona_situacion;
    }

    public function datosCompletos()
    {
        return $this->persona &&
            $this->persona->datosCompletos() &&
            $this->rol;
    }

    public function esChofer()
    {
        return $this->rol && $this->rol->rol_codigo === 'CHOFER';
    }

    public function esVendedor()
    {
        return $this->rol && $this->rol->rol_codigo === 'VENDEDOR';
    }

    public function getVentasDelMes()
    {
        return $this->reservasCreadas()
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
    }

    public function getIngresosGenerados($fechaInicio = null, $fechaFin = null)
    {
        $query = $this->reservasCreadas();

        if ($fechaInicio) {
            $query->where('created_at', '>=', $fechaInicio);
        }

        if ($fechaFin) {
            $query->where('created_at', '<=', $fechaFin);
        }

        return $query->sum('reserva_monto') ?? 0;
    }

    public function getRutasAsignadas()
    {
        if (!$this->esChofer()) {
            return collect();
        }

        return $this->rutasActivadas()
            ->whereHas('estado', function ($q) {
                $q->whereIn('estado_codigo', ['RUT_PROG', 'RUT_INIC']);
            })
            ->get();
    }

    public function tieneRutaActiva()
    {
        return $this->getRutasAsignadas()->count() > 0;
    }

    public function ultimaActividad()
    {
        return $this->updated_at;
    }

    public function informacionCompleta()
    {
        return [
            'usuario' => [
                'codigo' => $this->usuario_codigo,
                'activo' => $this->es_activo,
                'ultima_actividad' => $this->ultimaActividad()
            ],
            'persona' => $this->persona ? [
                'nombre_completo' => $this->persona->nombre_completo,
                'email' => $this->persona->persona_email,
                'telefono' => $this->persona->telefono_formateado
            ] : null,
            'rol' => $this->rol ? [
                'nombre' => $this->rol->rol_rol,
                'codigo' => $this->rol->rol_codigo,
                'nivel_acceso' => $this->rol->nivel_acceso
            ] : null
        ];
    }
}
