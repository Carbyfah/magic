<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class ContactoAgencia extends Model
{
    use SoftDeletes, HasAudit;

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
        'contactos_agencia_telefono' => 'integer',
        'contactos_agencia_situacion' => 'boolean',
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
    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'agencia_id', 'agencia_id');
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->contactos_agencia_situacion === true;
    }

    public function getNombreCompletoAttribute()
    {
        return trim(($this->contactos_agencia_nombres ?? '') . ' ' . ($this->contactos_agencia_apellidos ?? ''));
    }

    public function getTelefonoFormateadoAttribute()
    {
        if (!$this->contactos_agencia_telefono) {
            return null;
        }

        $telefono = (string) $this->contactos_agencia_telefono;

        // Formato guatemalteco: +502 1234-5678
        if (strlen($telefono) === 11 && substr($telefono, 0, 3) === '502') {
            return '+502 ' . substr($telefono, 3, 4) . '-' . substr($telefono, 7);
        }

        return $telefono;
    }

    public function getInicialesAttribute()
    {
        $nombres = explode(' ', trim($this->contactos_agencia_nombres ?? ''));
        $apellidos = explode(' ', trim($this->contactos_agencia_apellidos ?? ''));

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
        return $query->where('contactos_agencia_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('contactos_agencia_codigo', $codigo);
    }

    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->where('agencia_id', $agenciaId);
    }

    public function scopeGerentes($query)
    {
        return $query->where('contactos_agencia_cargo', 'like', '%gerente%');
    }

    public function scopeVentas($query)
    {
        return $query->where('contactos_agencia_cargo', 'like', '%venta%');
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('contactos_agencia_nombres', 'like', "%{$termino}%")
                ->orWhere('contactos_agencia_apellidos', 'like', "%{$termino}%")
                ->orWhere('contactos_agencia_cargo', 'like', "%{$termino}%")
                ->orWhere('contactos_agencia_codigo', 'like', "%{$termino}%");
        });
    }

    /**
     * Métodos de negocio
     */
    public function esGerente()
    {
        return str_contains(strtolower($this->contactos_agencia_cargo ?? ''), 'gerente');
    }

    public function esDeVentas()
    {
        $cargo = strtolower($this->contactos_agencia_cargo ?? '');
        return str_contains($cargo, 'venta') || str_contains($cargo, 'comercial');
    }

    public function esOperativo()
    {
        $cargo = strtolower($this->contactos_agencia_cargo ?? '');
        return str_contains($cargo, 'operacion') || str_contains($cargo, 'coordinador');
    }

    public function tieneTelefonoValido()
    {
        return $this->contactos_agencia_telefono &&
            strlen((string) $this->contactos_agencia_telefono) >= 8;
    }

    public function datosCompletos()
    {
        return !empty($this->contactos_agencia_nombres) &&
            !empty($this->contactos_agencia_apellidos) &&
            !empty($this->contactos_agencia_cargo) &&
            $this->tieneTelefonoValido();
    }

    public function generarCodigoUnico()
    {
        if ($this->agencia) {
            $prefijo = $this->agencia->agencia_codigo;
            $numero = str_pad(
                $this->agencia->contactos()->count() + 1,
                2,
                '0',
                STR_PAD_LEFT
            );

            return $prefijo . '-CONT' . $numero;
        }

        return 'CONT-' . str_pad($this->contactos_agencia_id ?? 0, 4, '0', STR_PAD_LEFT);
    }

    public function linkWhatsApp($mensaje = null)
    {
        if (!$this->tieneTelefonoValido()) {
            return null;
        }

        $telefono = (string) $this->contactos_agencia_telefono;
        $mensaje_encoded = $mensaje ? urlencode($mensaje) : '';

        return "https://wa.me/{$telefono}" . ($mensaje ? "?text={$mensaje_encoded}" : '');
    }

    public function esPrincipal()
    {
        if (!$this->agencia) {
            return false;
        }

        $primerContacto = $this->agencia->contactos()
            ->where('contactos_agencia_situacion', true)
            ->orderBy('created_at')
            ->first();

        return $primerContacto && $primerContacto->contactos_agencia_id === $this->contactos_agencia_id;
    }

    public function nivelPrioridad()
    {
        if ($this->esGerente()) {
            return 1;
        } elseif ($this->esPrincipal()) {
            return 2;
        } elseif ($this->esDeVentas()) {
            return 3;
        }

        return 4;
    }
}
