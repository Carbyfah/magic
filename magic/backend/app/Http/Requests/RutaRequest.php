<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RutaRequest extends FormRequest
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
            'rutas_origen' => 'required|string|max:255',
            'rutas_destino' => 'required|string|max:255',
            'rutas_descripcion' => 'nullable|string|max:500',
            'rutas_tiempo_estimado' => 'nullable|string|max:50',
            'rutas_distancia_km' => 'nullable|numeric|min:0|max:9999.99',
            'rutas_precio_base' => 'required|numeric|min:0|max:99999.99',
            'rutas_activa' => 'boolean',
            'id_agencias' => 'required|integer|exists:agencias,id_agencias'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'rutas_origen.required' => 'El origen de la ruta es obligatorio.',
            'rutas_origen.max' => 'El origen no puede exceder 255 caracteres.',
            'rutas_destino.required' => 'El destino de la ruta es obligatorio.',
            'rutas_destino.max' => 'El destino no puede exceder 255 caracteres.',
            'rutas_descripcion.max' => 'La descripción no puede exceder 500 caracteres.',
            'rutas_tiempo_estimado.max' => 'El tiempo estimado no puede exceder 50 caracteres.',
            'rutas_distancia_km.numeric' => 'La distancia debe ser un número.',
            'rutas_distancia_km.min' => 'La distancia no puede ser negativa.',
            'rutas_distancia_km.max' => 'La distancia no puede exceder 9999.99 km.',
            'rutas_precio_base.required' => 'El precio base es obligatorio.',
            'rutas_precio_base.numeric' => 'El precio base debe ser un número.',
            'rutas_precio_base.min' => 'El precio base no puede ser negativo.',
            'rutas_precio_base.max' => 'El precio base no puede exceder Q99,999.99.',
            'rutas_activa.boolean' => 'El estado activo debe ser verdadero o falso.',
            'id_agencias.required' => 'Debe seleccionar una agencia.',
            'id_agencias.exists' => 'La agencia seleccionada no existe.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'rutas_origen' => 'origen',
            'rutas_destino' => 'destino',
            'rutas_descripcion' => 'descripción',
            'rutas_tiempo_estimado' => 'tiempo estimado',
            'rutas_distancia_km' => 'distancia en kilómetros',
            'rutas_precio_base' => 'precio base',
            'rutas_activa' => 'estado activo',
            'id_agencias' => 'agencia'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Limpiar y formatear datos
        if ($this->has('rutas_origen')) {
            $this->merge([
                'rutas_origen' => trim(ucwords(strtolower($this->rutas_origen)))
            ]);
        }

        if ($this->has('rutas_destino')) {
            $this->merge([
                'rutas_destino' => trim(ucwords(strtolower($this->rutas_destino)))
            ]);
        }

        // Convertir string a boolean si es necesario
        if ($this->has('rutas_activa')) {
            $valor = $this->rutas_activa;
            if (is_string($valor)) {
                $this->merge([
                    'rutas_activa' => in_array(strtolower($valor), ['true', '1', 'yes', 'on'])
                ]);
            }
        }

        // Asegurar valores por defecto
        if (!$this->has('rutas_activa')) {
            $this->merge(['rutas_activa' => true]);
        }
    }
}
