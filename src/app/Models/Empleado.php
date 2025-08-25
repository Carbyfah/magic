<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Empleado extends Authenticatable
{
    use SoftDeletes, HasAudit, Notifiable;

    protected $table = 'empleados';

    protected $fillable = [
        'persona_id',
        'codigo_empleado',
        'password',
        'fecha_ingreso',
        'fecha_baja',
        'rol_id',
        'estado_empleado_id',
        'ultimo_acceso',
        'situacion'
    ];

    protected $hidden = [
        'password',
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'fecha_ingreso' => 'date',
        'fecha_baja' => 'date',
        'ultimo_acceso' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relaciones
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }

    public function rol()
    {
        return $this->belongsTo(Role::class);
    }

    public function estadoEmpleado()
    {
        return $this->belongsTo(EstadoEmpleado::class);
    }

    public function choferDetalle()
    {
        return $this->hasOne(ChoferDetalle::class);
    }

    public function reservasCreadas()
    {
        return $this->hasMany(Reserva::class, 'empleado_id');
    }

    public function ventasRealizadas()
    {
        return $this->hasMany(Venta::class, 'empleado_vendedor_id');
    }

    public function rutasComoChofer()
    {
        return $this->hasMany(RutaEjecutada::class, 'chofer_id');
    }

    public function rutasComoApoyo()
    {
        return $this->hasMany(RutaEjecutada::class, 'chofer_apoyo_id');
    }

    /**
     * Atributos calculados
     */
    public function getNombreCompletoAttribute()
    {
        return $this->persona ? $this->persona->nombre_completo : '';
    }

    public function getEsChoferAttribute()
    {
        return $this->choferDetalle !== null;
    }

    public function getEstaActivoAttribute()
    {
        return $this->estadoEmpleado && $this->estadoEmpleado->permite_trabajar;
    }

    /**
     * Scopes
     */
    public function scopeActivos($query)
    {
        return $query->whereHas('estadoEmpleado', function ($q) {
            $q->where('permite_trabajar', true);
        });
    }

    public function scopeChoferes($query)
    {
        return $query->whereHas('choferDetalle');
    }

    public function scopePorRol($query, $rolId)
    {
        return $query->where('rol_id', $rolId);
    }

    /**
     * Métodos de negocio
     */
    public function puedeConducir()
    {
        if (!$this->es_chofer) return false;
        if (!$this->esta_activo) return false;

        // Verificar licencia vigente
        if ($this->choferDetalle) {
            return $this->choferDetalle->fecha_vencimiento_licencia > now();
        }

        return false;
    }

    public function tienePermiso($permiso)
    {
        return $this->rol && $this->rol->tienePermiso($permiso);
    }
}
