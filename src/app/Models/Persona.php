<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Persona extends Model
{
    use SoftDeletes, HasAudit;

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
        'persona_telefono' => 'integer',
        'persona_situacion' => 'boolean',
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
        'nombre_completo',
        'telefono_formateado',
        'iniciales'
    ];

    /**
     * Relaciones
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
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->persona_situacion === true;
    }

    public function getNombreCompletoAttribute()
    {
        return trim(($this->persona_nombres ?? '') . ' ' . ($this->persona_apellidos ?? ''));
    }

    public function getTelefonoFormateadoAttribute()
    {
        if (!$this->persona_telefono) {
            return null;
        }

        $telefono = (string) $this->persona_telefono;

        // Formato guatemalteco: +502 1234-5678
        if (strlen($telefono) === 11 && substr($telefono, 0, 3) === '502') {
            return '+502 ' . substr($telefono, 3, 4) . '-' . substr($telefono, 7);
        }

        return $telefono;
    }

    public function getInicialesAttribute()
    {
        $nombres = explode(' ', trim($this->persona_nombres ?? ''));
        $apellidos = explode(' ', trim($this->persona_apellidos ?? ''));

        $iniciales = '';

        if (count($nombres) > 0 && !empty($nombres[0])) {
            $iniciales .= strtoupper(substr($nombres[0], 0, 1));
        }

        if (count($apellidos) > 0 && !empty($apellidos[0])) {
            $iniciales .= strtoupper(substr($apellidos[0], 0, 1));
        }

        return $iniciales ?: 'NA';
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('persona_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('persona_codigo', $codigo);
    }

    public function scopePorTipo($query, $tipoCodigo)
    {
        return $query->whereHas('tipoPersona', function ($q) use ($tipoCodigo) {
            $q->where('tipo_persona_codigo', $tipoCodigo);
        });
    }

    public function scopeEmpleados($query)
    {
        return $query->whereHas('tipoPersona', function ($q) {
            $q->whereIn('tipo_persona_codigo', ['ADMIN', 'VEND', 'CHOF']);
        });
    }

    public function scopeClientes($query)
    {
        return $query->whereHas('tipoPersona', function ($q) {
            $q->where('tipo_persona_codigo', 'CLIE');
        });
    }

    public function scopeConUsuario($query)
    {
        return $query->has('usuario');
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('persona_nombres', 'like', "%{$termino}%")
                ->orWhere('persona_apellidos', 'like', "%{$termino}%")
                ->orWhere('persona_email', 'like', "%{$termino}%")
                ->orWhere('persona_codigo', 'like', "%{$termino}%");
        });
    }

    /**
     * Métodos de negocio
     */
    public function esAdministrador()
    {
        return $this->tipoPersona && $this->tipoPersona->tipo_persona_codigo === 'ADMIN';
    }

    public function esVendedor()
    {
        return $this->tipoPersona && $this->tipoPersona->tipo_persona_codigo === 'VEND';
    }

    public function esChofer()
    {
        return $this->tipoPersona && $this->tipoPersona->tipo_persona_codigo === 'CHOF';
    }

    public function esCliente()
    {
        return $this->tipoPersona && $this->tipoPersona->tipo_persona_codigo === 'CLIE';
    }

    public function esContactoAgencia()
    {
        return $this->tipoPersona && $this->tipoPersona->tipo_persona_codigo === 'CONT';
    }

    public function esEmpleado()
    {
        return $this->tipoPersona &&
            in_array($this->tipoPersona->tipo_persona_codigo, ['ADMIN', 'VEND', 'CHOF']);
    }

    public function puedeVender()
    {
        return $this->tipoPersona &&
            in_array($this->tipoPersona->tipo_persona_codigo, ['ADMIN', 'VEND']);
    }

    public function tieneUsuario()
    {
        return $this->usuario !== null;
    }

    public function estaActivo()
    {
        return $this->persona_situacion &&
            (!$this->tieneUsuario() || $this->usuario->usuario_situacion);
    }

    public function tieneEmailValido()
    {
        return $this->persona_email &&
            filter_var($this->persona_email, FILTER_VALIDATE_EMAIL);
    }

    public function tieneTelefonoValido()
    {
        return $this->persona_telefono &&
            strlen((string) $this->persona_telefono) >= 8;
    }

    public function datosCompletos()
    {
        return !empty($this->persona_nombres) &&
            !empty($this->persona_apellidos) &&
            $this->tieneTelefonoValido() &&
            ($this->esCliente() || $this->tieneEmailValido());
    }

    public function generarCodigoUnico()
    {
        if ($this->tipoPersona) {
            $prefijo = substr($this->tipoPersona->tipo_persona_codigo, 0, 2);
            $numero = str_pad($this->persona_id, 3, '0', STR_PAD_LEFT);

            return strtoupper($prefijo . $numero);
        }

        return 'PER' . str_pad($this->persona_id, 3, '0', STR_PAD_LEFT);
    }

    public function linkWhatsApp($mensaje = null)
    {
        if (!$this->tieneTelefonoValido()) {
            return null;
        }

        $telefono = (string) $this->persona_telefono;
        $mensaje_encoded = $mensaje ? urlencode($mensaje) : '';

        return "https://wa.me/{$telefono}" . ($mensaje ? "?text={$mensaje_encoded}" : '');
    }
}
