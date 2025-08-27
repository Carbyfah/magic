<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Rol extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'rol';
    protected $primaryKey = 'rol_id';

    protected $fillable = [
        'rol_codigo',
        'rol_rol',
        'rol_descripcion',
        'rol_situacion'
    ];

    protected $casts = [
        'rol_situacion' => 'boolean',
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
        'nivel_acceso'
    ];

    /**
     * Relaciones
     */
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'rol_id', 'rol_id');
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->rol_situacion === true;
    }

    public function getNivelAccesoAttribute()
    {
        $niveles = [
            'ADMIN' => 5,
            'GERENTE' => 4,
            'VENDEDOR' => 3,
            'OPERADOR' => 2,
            'CHOFER' => 1
        ];

        return $niveles[$this->rol_codigo] ?? 0;
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('rol_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('rol_codigo', $codigo);
    }

    public function scopeConUsuarios($query)
    {
        return $query->has('usuarios');
    }

    /**
     * Métodos estáticos para obtener roles específicos
     */
    public static function admin()
    {
        return self::where('rol_codigo', 'ADMIN')->first();
    }

    public static function gerente()
    {
        return self::where('rol_codigo', 'GERENTE')->first();
    }

    public static function vendedor()
    {
        return self::where('rol_codigo', 'VENDEDOR')->first();
    }

    public static function chofer()
    {
        return self::where('rol_codigo', 'CHOFER')->first();
    }

    public static function operador()
    {
        return self::where('rol_codigo', 'OPERADOR')->first();
    }

    /**
     * Métodos de permisos
     */
    public function puedeGestionar($recurso)
    {
        $permisos = [
            'ADMIN' => ['usuarios', 'roles', 'configuracion', 'reportes', 'auditoria'],
            'GERENTE' => ['reportes', 'vehiculos', 'rutas', 'servicios', 'empleados'],
            'VENDEDOR' => ['reservas', 'clientes', 'agencias', 'facturas'],
            'OPERADOR' => ['rutas_activadas', 'vehiculos', 'reservas'],
            'CHOFER' => ['rutas_asignadas']
        ];

        return in_array($recurso, $permisos[$this->rol_codigo] ?? []);
    }

    public function esAdministrador()
    {
        return $this->rol_codigo === 'ADMIN';
    }

    public function esGerente()
    {
        return in_array($this->rol_codigo, ['ADMIN', 'GERENTE']);
    }

    public function puedeVender()
    {
        return in_array($this->rol_codigo, ['ADMIN', 'GERENTE', 'VENDEDOR']);
    }

    public function puedeOperar()
    {
        return in_array($this->rol_codigo, ['ADMIN', 'GERENTE', 'OPERADOR']);
    }

    public function tieneAccesoCompleto()
    {
        return $this->rol_codigo === 'ADMIN';
    }

    public function tieneNivelMinimo($nivelMinimo)
    {
        return $this->nivel_acceso >= $nivelMinimo;
    }
}
