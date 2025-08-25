<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class ChoferDetalle extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'choferes_detalle';

    protected $fillable = [
        'empleado_id',
        'numero_licencia',
        'tipo_licencia_id',
        'fecha_emision_licencia',
        'fecha_vencimiento_licencia',
        'fecha_ultimo_examen_medico',
        'apto_turismo',
        'anos_experiencia',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'apto_turismo' => 'boolean',
        'fecha_emision_licencia' => 'date',
        'fecha_vencimiento_licencia' => 'date',
        'fecha_ultimo_examen_medico' => 'date',
        'anos_experiencia' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * Relaciones
     */
    public function empleado()
    {
        return $this->belongsTo(Empleado::class);
    }

    public function tipoLicencia()
    {
        return $this->belongsTo(TipoLicencia::class);
    }

    /**
     * Atributos calculados
     */
    public function getLicenciaVigenteAttribute()
    {
        return $this->fecha_vencimiento_licencia > now();
    }

    public function getDiasParaVencimientoAttribute()
    {
        return now()->diffInDays($this->fecha_vencimiento_licencia, false);
    }

    public function getExamenMedicoVigenteAttribute()
    {
        if (!$this->fecha_ultimo_examen_medico) return false;
        // Asumiendo que el examen médico es válido por 1 año
        return $this->fecha_ultimo_examen_medico->addYear() > now();
    }

    /**
     * Scopes
     */
    public function scopeLicenciasVigentes($query)
    {
        return $query->where('fecha_vencimiento_licencia', '>', now());
    }

    public function scopeAptosTurismo($query)
    {
        return $query->where('apto_turismo', true);
    }

    public function scopePorVencer($query, $dias = 30)
    {
        return $query->whereBetween('fecha_vencimiento_licencia', [
            now(),
            now()->addDays($dias)
        ]);
    }
}
