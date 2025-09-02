<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactosAgencia extends Model
{
    use SoftDeletes;

    protected $table = 'contactos_agencia';
    protected $primaryKey = 'contactos_agencia_id';

    protected $fillable = [
        'contactos_agencia_codigo',
        'contactos_agencia_nombres',
        'contactos_agencia_apellidos',
        'contactos_agencia_cargo',
        'contactos_agencia_telefono',
        'contactos_agencia_situacion',
        'agencia_id'
    ];

    protected $casts = [
        'contactos_agencia_situacion' => 'boolean',
        'contactos_agencia_telefono' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * RELACIONES BÁSICAS
     */
    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'agencia_id', 'agencia_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('contactos_agencia_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('contactos_agencia_nombres', 'like', "%{$termino}%")
            ->orWhere('contactos_agencia_apellidos', 'like', "%{$termino}%")
            ->orWhere('contactos_agencia_codigo', 'like', "%{$termino}%")
            ->orWhere('contactos_agencia_cargo', 'like', "%{$termino}%");
    }

    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->where('agencia_id', $agenciaId);
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('contactos_agencia_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->contactos_agencia_codigo, -3)) + 1 : 1;
        return 'CAG-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->contactos_agencia_nombres} {$this->contactos_agencia_apellidos}";
    }

    public function getAgenciaNombreAttribute()
    {
        return $this->agencia ? $this->agencia->agencia_razon_social : 'Sin agencia';
    }

    public function getIniciales()
    {
        $nombres = explode(' ', trim($this->contactos_agencia_nombres));
        $apellidos = explode(' ', trim($this->contactos_agencia_apellidos));

        $inicial_nombre = !empty($nombres[0]) ? strtoupper(substr($nombres[0], 0, 1)) : '';
        $inicial_apellido = !empty($apellidos[0]) ? strtoupper(substr($apellidos[0], 0, 1)) : '';

        return $inicial_nombre . $inicial_apellido;
    }

    /**
     * VALIDACIONES DE NEGOCIO
     */
    public function tieneAgenciaActiva()
    {
        return $this->agencia && $this->agencia->agencia_situacion;
    }

    /**
     * CORREGIDO: Lógica similar a Persona.php
     * Verifica si es el único contacto activo de la agencia
     */
    public function esUnicoContactoActivo()
    {
        $contactosActivosAgencia = self::where('agencia_id', $this->agencia_id)
            ->where('contactos_agencia_situacion', 1)
            ->count();

        return $contactosActivosAgencia <= 1;
    }

    public function puedeSerEliminado()
    {
        // No se puede eliminar si es el único contacto activo de la agencia
        return !$this->esUnicoContactoActivo();
    }

    /**
     * MÉTODOS DE FORMATO
     */
    public function formatearTelefono()
    {
        if (!$this->contactos_agencia_telefono) return 'Sin teléfono';

        $telefono = (string) $this->contactos_agencia_telefono;
        if (strlen($telefono) === 8) {
            return substr($telefono, 0, 4) . '-' . substr($telefono, 4);
        }

        return $telefono;
    }

    public function getCargoFormateado()
    {
        return ucwords(strtolower($this->contactos_agencia_cargo));
    }

    /**
     * VALIDACIÓN DE TELÉFONO ÚNICO POR AGENCIA
     */
    public function esTelefonoUnicoEnAgencia($telefono, $excepto_id = null)
    {
        $query = self::where('contactos_agencia_telefono', $telefono)
            ->where('agencia_id', $this->agencia_id);

        if ($excepto_id) {
            $query->where('contactos_agencia_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }

    /**
     * OBTENER CONTACTO PRINCIPAL DE AGENCIA
     */
    public static function getContactoPrincipal($agenciaId)
    {
        return self::where('agencia_id', $agenciaId)
            ->where('contactos_agencia_situacion', 1)
            ->whereIn('contactos_agencia_cargo', ['Gerente', 'Director', 'Propietario', 'Administrador'])
            ->orderByRaw("
                CASE contactos_agencia_cargo
                WHEN 'Propietario' THEN 1
                WHEN 'Director' THEN 2
                WHEN 'Gerente' THEN 3
                WHEN 'Administrador' THEN 4
                ELSE 5 END
            ")
            ->first();
    }

    /**
     * OBTENER INFORMACIÓN COMPLETA PARA REPORTES
     */
    public function getInfoCompletaAttribute()
    {
        return [
            'nombre_completo' => $this->nombre_completo,
            'cargo' => $this->getCargoFormateado(),
            'telefono' => $this->formatearTelefono(),
            'agencia' => $this->agencia_nombre,
            'iniciales' => $this->getIniciales()
        ];
    }
}
