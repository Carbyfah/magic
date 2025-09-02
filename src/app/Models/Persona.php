<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Persona extends Model
{
    use SoftDeletes;

    protected $table = 'persona';
    protected $primaryKey = 'persona_id';

    protected $fillable = [
        'persona_codigo',
        'persona_nombres',
        'persona_apellidos',
        'persona_telefono',
        'persona_email',
        'persona_situacion',
        'tipo_persona_id'
    ];

    protected $casts = [
        'persona_situacion' => 'boolean',
        'persona_telefono' => 'integer',
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
    public function tipoPersona()
    {
        return $this->belongsTo(TipoPersona::class, 'tipo_persona_id', 'tipo_persona_id');
    }

    public function usuario()
    {
        return $this->hasOne(Usuario::class, 'persona_id', 'persona_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('persona_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('persona_nombres', 'like', "%{$termino}%")
            ->orWhere('persona_apellidos', 'like', "%{$termino}%")
            ->orWhere('persona_codigo', 'like', "%{$termino}%")
            ->orWhere('persona_email', 'like', "%{$termino}%");
    }

    public function scopePorTipo($query, $tipoPersonaId)
    {
        return $query->where('tipo_persona_id', $tipoPersonaId);
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('persona_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->persona_codigo, -3)) + 1 : 1;
        return 'PER-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->persona_nombres} {$this->persona_apellidos}";
    }

    public function getTipoPersonaNombreAttribute()
    {
        return $this->tipoPersona ? $this->tipoPersona->tipo_persona_tipo : 'Sin tipo';
    }

    public function getIniciales()
    {
        $nombres = explode(' ', trim($this->persona_nombres));
        $apellidos = explode(' ', trim($this->persona_apellidos));

        $inicial_nombre = !empty($nombres[0]) ? strtoupper(substr($nombres[0], 0, 1)) : '';
        $inicial_apellido = !empty($apellidos[0]) ? strtoupper(substr($apellidos[0], 0, 1)) : '';

        return $inicial_nombre . $inicial_apellido;
    }

    /**
     * VALIDACIONES DE NEGOCIO
     */
    public function tieneUsuarioActivo()
    {
        return $this->usuario && $this->usuario->usuario_situacion;
    }

    public function puedeSerEliminado()
    {
        // No se puede eliminar si tiene usuario activo
        return !$this->tieneUsuarioActivo();
    }

    /**
     * MÉTODOS DE FORMATO
     */
    public function formatearTelefono()
    {
        if (!$this->persona_telefono) return 'Sin teléfono';

        $telefono = (string) $this->persona_telefono;
        if (strlen($telefono) === 8) {
            return substr($telefono, 0, 4) . '-' . substr($telefono, 4);
        }

        return $telefono;
    }

    public function getEmailPublico()
    {
        if (!$this->persona_email) return 'Sin email';

        // Para mostrar en listas públicas, ofuscar el email
        $partes = explode('@', $this->persona_email);
        if (count($partes) !== 2) return $this->persona_email;

        $usuario = $partes[0];
        $dominio = $partes[1];

        if (strlen($usuario) > 3) {
            $usuario = substr($usuario, 0, 2) . '***' . substr($usuario, -1);
        }

        return $usuario . '@' . $dominio;
    }

    /**
     * VALIDACIÓN DE EMAIL ÚNICO
     */
    public function esEmailUnico($email, $excepto_id = null)
    {
        $query = self::where('persona_email', $email);

        if ($excepto_id) {
            $query->where('persona_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }
}
