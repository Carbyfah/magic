<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgenciaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->agencia_id,
            'codigo' => $this->agencia_codigo,
            'nombre' => $this->agencia_razon_social,
            'nit' => $this->agencia_nit,
            'email' => $this->agencia_email,
            'telefono' => $this->agencia_telefono,
            'activo' => $this->agencia_situacion,

            // Información combinada para la interfaz
            'descripcion_completa' => [
                'completa' => $this->nombre_completo,
                'categoria' => $this->getCategoria(),
            ],

            // Clasificaciones para filtros y lógica
            'caracteristicas' => [
                'es_nacional' => $this->esAgenciaNacional(),
                'es_internacional' => $this->esAgenciaInternacional(),
                'es_operador_directo' => $this->esOperadorDirecto(),
            ],

            // Estadísticas de uso
            'estadisticas' => $this->when(
                $request->has('include_estadisticas'),
                [
                    'total_reservas' => $this->whenCounted('reservas'),
                    'total_contactos' => $this->whenCounted('contactosAgencia'),
                    'en_uso' => $this->tieneRegistrosAsociados(),
                ]
            ),

            // Agencias relacionadas para planificación
            'agencias_relacionadas' => $this->when(
                $request->has('include_relacionadas'),
                function () {
                    return $this->getAgenciasRelacionadas();
                }
            ),

            // Información para filtros y planificación
            'planificacion' => $this->when(
                $request->has('include_planificacion'),
                [
                    'puede_eliminar' => !$this->tieneRegistrosAsociados(),
                    'es_socio_preferente' => $this->esSocioPreferente(),
                ]
            ),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function getCategoria(): string
    {
        $codigo = $this->agencia_codigo;

        if (str_starts_with($codigo, 'NAC_')) return 'Nacional';
        if (str_starts_with($codigo, 'INT_')) return 'Internacional';
        if (str_starts_with($codigo, 'OPE_')) return 'Operador Directo';
        if (str_starts_with($codigo, 'COL_')) return 'Colaborador';

        return 'General';
    }

    private function esAgenciaNacional(): bool
    {
        return str_starts_with($this->agencia_codigo, 'NAC_');
    }

    private function esAgenciaInternacional(): bool
    {
        return str_starts_with($this->agencia_codigo, 'INT_');
    }

    private function esOperadorDirecto(): bool
    {
        return str_starts_with($this->agencia_codigo, 'OPE_');
    }

    private function esSocioPreferente(): bool
    {
        $sociosPreferentes = ['NAC_PREM', 'INT_PREM', 'OPE_PREM'];
        return in_array($this->agencia_codigo, $sociosPreferentes);
    }

    private function getAgenciasRelacionadas(): array
    {
        $categoria = $this->getCategoria();

        return Agencia::where('agencia_codigo', 'like', substr($this->agencia_codigo, 0, 4) . '%')
            ->where('agencia_id', '!=', $this->agencia_id)
            ->activo()
            ->get(['agencia_id', 'agencia_codigo', 'agencia_razon_social'])
            ->toArray();
    }
}
