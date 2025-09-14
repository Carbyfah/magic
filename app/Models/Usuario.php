<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Hash;

class Usuario extends Model
{
    use SoftDeletes;

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
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'usuario_password',
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * RELACIONES BÁSICAS
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'persona_id', 'persona_id');
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id', 'rol_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('usuario_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->whereHas('persona', function ($q) use ($termino) {
            $q->where('persona_nombres', 'like', "%{$termino}%")
                ->orWhere('persona_apellidos', 'like', "%{$termino}%")
                ->orWhere('persona_codigo', 'like', "%{$termino}%");
        })->orWhere('usuario_codigo', 'like', "%{$termino}%");
    }

    public function scopePorRol($query, $rolId)
    {
        return $query->where('rol_id', $rolId);
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('usuario_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->usuario_codigo, -3)) + 1 : 1;
        return 'USR-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return $this->persona ? $this->persona->nombre_completo : 'Usuario sin persona';
    }

    public function getRolNombreAttribute()
    {
        return $this->rol ? $this->rol->rol_rol : 'Sin rol';
    }

    public function getIniciales()
    {
        if (!$this->persona) return 'US';

        $nombres = explode(' ', trim($this->persona->persona_nombres ?? ''));
        $apellidos = explode(' ', trim($this->persona->persona_apellidos ?? ''));

        $inicial_nombre = !empty($nombres[0]) ? strtoupper(substr($nombres[0], 0, 1)) : '';
        $inicial_apellido = !empty($apellidos[0]) ? strtoupper(substr($apellidos[0], 0, 1)) : '';

        return $inicial_nombre . $inicial_apellido;
    }

    /**
     * VALIDACIONES DE NEGOCIO
     */
    public function tieneRutasActivadas()
    {
        // Los usuarios no tienen rutas directamente, pero pueden verificar a través de su persona
        if (!$this->persona_id) return false;

        return RutaActivada::where('persona_id', $this->persona_id)
            ->where('ruta_activada_situacion', 1)
            ->exists();
    }

    public function puedeSerEliminado()
    {
        // No se puede eliminar si tiene rutas activadas
        return !$this->tieneRutasActivadas();
    }

    /**
     * MÉTODOS DE FORMATO
     */
    public function formatearRol()
    {
        if (!$this->rol) return 'Sin rol';

        return $this->rol->rol_rol;
    }

    public function getCodigoPublico()
    {
        if (!$this->usuario_codigo) return 'Sin código';

        // Para mostrar en listas públicas, ofuscar el código
        $codigo = $this->usuario_codigo;

        if (strlen($codigo) > 3) {
            $codigo = substr($codigo, 0, 2) . '***' . substr($codigo, -1);
        }

        return $codigo;
    }

    /**
     * VALIDACIÓN DE CÓDIGO ÚNICO
     */
    public function esCodigoUnico($codigo, $excepto_id = null)
    {
        $query = self::where('usuario_codigo', $codigo);

        if ($excepto_id) {
            $query->where('usuario_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }

    /**
     * MANEJO DE CONTRASEÑAS
     */
    public function setUsuarioPasswordAttribute($password)
    {
        if ($password) {
            $this->attributes['usuario_password'] = Hash::make($password);
        }
    }

    public function verificarPassword($password)
    {
        return Hash::check($password, $this->usuario_password);
    }

    /**
     * VALIDACIONES DE PERSONA ÚNICA
     */
    public function esPersonaUnica($persona_id, $excepto_id = null)
    {
        $query = self::where('persona_id', $persona_id)->where('usuario_situacion', 1);

        if ($excepto_id) {
            $query->where('usuario_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }
}
