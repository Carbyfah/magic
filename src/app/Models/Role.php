<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Role extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'roles';

    protected $fillable = [
        'codigo',
        'nombre_rol',
        'descripcion',
        'permisos_json',
        'nivel_jerarquia',
        'puede_autorizar',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'puede_autorizar' => 'boolean',
        'nivel_jerarquia' => 'integer',
        'permisos_json' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * Permisos predefinidos del sistema
     */
    const PERMISOS_DISPONIBLES = [
        // Módulo Personas
        'personas.ver',
        'personas.crear',
        'personas.editar',
        'personas.eliminar',
        'empleados.ver',
        'empleados.crear',
        'empleados.editar',
        'empleados.eliminar',
        'clientes.ver',
        'clientes.crear',
        'clientes.editar',
        'clientes.eliminar',

        // Módulo Vehículos
        'vehiculos.ver',
        'vehiculos.crear',
        'vehiculos.editar',
        'vehiculos.eliminar',

        // Módulo Rutas
        'rutas.ver',
        'rutas.crear',
        'rutas.editar',
        'rutas.eliminar',
        'rutas.ejecutar',
        'rutas.asignar_chofer',

        // Módulo Reservas
        'reservas.ver',
        'reservas.crear',
        'reservas.editar',
        'reservas.eliminar',
        'reservas.confirmar',
        'reservas.cancelar',

        // Módulo Ventas
        'ventas.ver',
        'ventas.crear',
        'ventas.editar',
        'ventas.anular',
        'ventas.aplicar_descuento',
        'ventas.autorizar_credito',

        // Módulo Reportes
        'reportes.ver',
        'reportes.exportar',
        'dashboard.ver',

        // Módulo Auditoría
        'auditoria.ver',

        // Catálogos
        'catalogos.ver',
        'catalogos.editar',

        // Sistema
        'sistema.configurar',
        'sistema.respaldos'
    ];

    /**
     * Relaciones
     */
    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'rol_id');
    }

    /**
     * Métodos de verificación de permisos
     */
    public function tienePermiso($permiso)
    {
        if (!$this->permisos_json) {
            return false;
        }

        return in_array($permiso, $this->permisos_json);
    }

    public function tieneAlgunPermiso(array $permisos)
    {
        if (!$this->permisos_json) {
            return false;
        }

        return count(array_intersect($permisos, $this->permisos_json)) > 0;
    }

    public function tieneTodosLosPermisos(array $permisos)
    {
        if (!$this->permisos_json) {
            return false;
        }

        return count(array_intersect($permisos, $this->permisos_json)) === count($permisos);
    }

    /**
     * Scopes
     */
    public function scopePorNivel($query, $nivel)
    {
        return $query->where('nivel_jerarquia', '>=', $nivel);
    }

    public function scopeConAutorizacion($query)
    {
        return $query->where('puede_autorizar', true);
    }

    /**
     * Validaciones
     */
    public function puedeEliminarse()
    {
        return $this->empleados()->count() === 0;
    }

    /**
     * Roles predefinidos
     */
    public static function crearRolesPredefinidos()
    {
        $roles = [
            [
                'codigo' => 'ADMIN',
                'nombre_rol' => 'Administrador',
                'descripcion' => 'Acceso total al sistema',
                'nivel_jerarquia' => 10,
                'puede_autorizar' => true,
                'permisos_json' => self::PERMISOS_DISPONIBLES
            ],
            [
                'codigo' => 'GERENTE',
                'nombre_rol' => 'Gerente',
                'descripcion' => 'Gestión y supervisión',
                'nivel_jerarquia' => 8,
                'puede_autorizar' => true,
                'permisos_json' => array_diff(self::PERMISOS_DISPONIBLES, ['sistema.configurar', 'sistema.respaldos'])
            ],
            [
                'codigo' => 'VENDEDOR',
                'nombre_rol' => 'Vendedor',
                'descripcion' => 'Ventas y reservas',
                'nivel_jerarquia' => 5,
                'puede_autorizar' => false,
                'permisos_json' => [
                    'clientes.ver',
                    'clientes.crear',
                    'clientes.editar',
                    'reservas.ver',
                    'reservas.crear',
                    'reservas.editar',
                    'reservas.confirmar',
                    'ventas.ver',
                    'ventas.crear',
                    'rutas.ver'
                ]
            ],
            [
                'codigo' => 'CHOFER',
                'nombre_rol' => 'Chofer',
                'descripcion' => 'Conductor de vehículos',
                'nivel_jerarquia' => 3,
                'puede_autorizar' => false,
                'permisos_json' => [
                    'rutas.ver',
                    'rutas.ejecutar',
                    'vehiculos.ver'
                ]
            ]
        ];

        foreach ($roles as $rol) {
            self::updateOrCreate(
                ['codigo' => $rol['codigo']],
                $rol
            );
        }
    }
}
