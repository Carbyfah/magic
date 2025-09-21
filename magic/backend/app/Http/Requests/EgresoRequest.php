<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EgresoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'descripcion_egreso' => 'required|string|max:500',
            'cantidad_egreso' => 'required|numeric|min:0|max:99999.99',
            'fecha_egreso' => 'required|date',
            'tipo_egreso' => 'required|string|max:100',
            'observaciones_egreso' => 'nullable|string|max:1000',
            'id_ruta_activa' => 'required|integer|exists:ruta_activa,id_ruta_activa'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'descripcion_egreso.required' => 'La descripción del egreso es obligatoria.',
            'descripcion_egreso.max' => 'La descripción no puede exceder 500 caracteres.',
            'cantidad_egreso.required' => 'La cantidad del egreso es obligatoria.',
            'cantidad_egreso.numeric' => 'La cantidad debe ser un número.',
            'cantidad_egreso.min' => 'La cantidad no puede ser negativa.',
            'cantidad_egreso.max' => 'La cantidad no puede exceder Q99,999.99.',
            'fecha_egreso.required' => 'La fecha del egreso es obligatoria.',
            'fecha_egreso.date' => 'La fecha debe ser válida.',
            'tipo_egreso.required' => 'El tipo de egreso es obligatorio.',
            'tipo_egreso.max' => 'El tipo no puede exceder 100 caracteres.',
            'observaciones_egreso.max' => 'Las observaciones no pueden exceder 1000 caracteres.',
            'id_ruta_activa.required' => 'La ruta activa es obligatoria.',
            'id_ruta_activa.exists' => 'La ruta activa seleccionada no existe.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Formatear descripción
        if ($this->has('descripcion_egreso')) {
            $this->merge([
                'descripcion_egreso' => trim(ucfirst(strtolower($this->descripcion_egreso)))
            ]);
        }

        // Formatear tipo
        if ($this->has('tipo_egreso')) {
            $this->merge([
                'tipo_egreso' => trim(ucwords(strtolower($this->tipo_egreso)))
            ]);
        }

        // Limpiar observaciones
        if ($this->has('observaciones_egreso')) {
            $this->merge([
                'observaciones_egreso' => trim($this->observaciones_egreso) ?: null
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validar fecha del egreso
            if ($this->fecha_egreso) {
                $fechaEgreso = \Carbon\Carbon::parse($this->fecha_egreso);

                if ($fechaEgreso->isFuture()) {
                    $validator->errors()->add('fecha_egreso', 'La fecha del egreso no puede ser futura.');
                }

                if ($fechaEgreso->diffInYears(today()) > 2) {
                    $validator->warnings()->add('fecha_egreso', 'La fecha del egreso es muy antigua.');
                }
            }
        });
    }
}
