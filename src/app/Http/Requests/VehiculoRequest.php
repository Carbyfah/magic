<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehiculoRequest extends FormRequest
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
        $vehiculoId = $this->route('vehiculo') ? $this->route('vehiculo')->vehiculo_id : null;

        return [
            'vehiculo_placa' => [
                'required',
                'string',
                'max:20',
                Rule::unique('vehiculo', 'vehiculo_placa')->ignore($vehiculoId, 'vehiculo_id')
            ],
            'vehiculo_marca' => 'required|string|max:100',
            'vehiculo_modelo' => 'required|string|max:100',
            'vehiculo_ano' => 'required|integer|min:1950|max:' . (date('Y') + 2),
            'vehiculo_color' => 'nullable|string|max:50',
            'vehiculo_capacidad' => 'required|integer|min:1|max:100',
            'vehiculo_tipo' => 'required|string|max:50',
            'vehiculo_combustible' => 'nullable|string|max:50',
            'vehiculo_kilometraje' => 'nullable|integer|min:0',
            'vehiculo_estado' => 'required|string|max:50',
            'vehiculo_observaciones' => 'nullable|string|max:1000',
            'vehiculo_numero_motor' => 'nullable|string|max:100',
            'vehiculo_numero_chasis' => 'nullable|string|max:100',
            'vehiculo_fecha_compra' => 'nullable|date',
            'vehiculo_valor_compra' => 'nullable|numeric|min:0|max:9999999.99',
            'vehiculo_pago_conductor' => 'nullable|numeric|min:0|max:99999.99',
            'vehiculo_activo' => 'boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'vehiculo_placa.required' => 'La placa del vehículo es obligatoria.',
            'vehiculo_placa.unique' => 'Ya existe un vehículo con esta placa.',
            'vehiculo_placa.max' => 'La placa no puede exceder 20 caracteres.',
            'vehiculo_marca.required' => 'La marca del vehículo es obligatoria.',
            'vehiculo_marca.max' => 'La marca no puede exceder 100 caracteres.',
            'vehiculo_modelo.required' => 'El modelo del vehículo es obligatorio.',
            'vehiculo_modelo.max' => 'El modelo no puede exceder 100 caracteres.',
            'vehiculo_ano.required' => 'El año del vehículo es obligatorio.',
            'vehiculo_ano.integer' => 'El año debe ser un número entero.',
            'vehiculo_ano.min' => 'El año debe ser mayor a 1950.',
            'vehiculo_ano.max' => 'El año no puede ser mayor a ' . (date('Y') + 2) . '.',
            'vehiculo_color.max' => 'El color no puede exceder 50 caracteres.',
            'vehiculo_capacidad.required' => 'La capacidad del vehículo es obligatoria.',
            'vehiculo_capacidad.integer' => 'La capacidad debe ser un número entero.',
            'vehiculo_capacidad.min' => 'La capacidad debe ser al menos 1 pasajero.',
            'vehiculo_capacidad.max' => 'La capacidad no puede exceder 100 pasajeros.',
            'vehiculo_tipo.required' => 'El tipo de vehículo es obligatorio.',
            'vehiculo_tipo.max' => 'El tipo no puede exceder 50 caracteres.',
            'vehiculo_combustible.max' => 'El tipo de combustible no puede exceder 50 caracteres.',
            'vehiculo_kilometraje.integer' => 'El kilometraje debe ser un número entero.',
            'vehiculo_kilometraje.min' => 'El kilometraje no puede ser negativo.',
            'vehiculo_estado.required' => 'El estado del vehículo es obligatorio.',
            'vehiculo_estado.max' => 'El estado no puede exceder 50 caracteres.',
            'vehiculo_observaciones.max' => 'Las observaciones no pueden exceder 1000 caracteres.',
            'vehiculo_numero_motor.max' => 'El número de motor no puede exceder 100 caracteres.',
            'vehiculo_numero_chasis.max' => 'El número de chasis no puede exceder 100 caracteres.',
            'vehiculo_fecha_compra.date' => 'La fecha de compra debe ser una fecha válida.',
            'vehiculo_valor_compra.numeric' => 'El valor de compra debe ser un número.',
            'vehiculo_valor_compra.min' => 'El valor de compra no puede ser negativo.',
            'vehiculo_valor_compra.max' => 'El valor de compra no puede exceder Q9,999,999.99.',
            'vehiculo_pago_conductor.numeric' => 'El pago al conductor debe ser un número.',
            'vehiculo_pago_conductor.min' => 'El pago al conductor no puede ser negativo.',
            'vehiculo_pago_conductor.max' => 'El pago al conductor no puede exceder Q99,999.99.',
            'vehiculo_activo.boolean' => 'El estado activo debe ser verdadero o falso.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'vehiculo_placa' => 'placa',
            'vehiculo_marca' => 'marca',
            'vehiculo_modelo' => 'modelo',
            'vehiculo_ano' => 'año',
            'vehiculo_color' => 'color',
            'vehiculo_capacidad' => 'capacidad',
            'vehiculo_tipo' => 'tipo',
            'vehiculo_combustible' => 'combustible',
            'vehiculo_kilometraje' => 'kilometraje',
            'vehiculo_estado' => 'estado',
            'vehiculo_observaciones' => 'observaciones',
            'vehiculo_numero_motor' => 'número de motor',
            'vehiculo_numero_chasis' => 'número de chasis',
            'vehiculo_fecha_compra' => 'fecha de compra',
            'vehiculo_valor_compra' => 'valor de compra',
            'vehiculo_pago_conductor' => 'pago al conductor',
            'vehiculo_activo' => 'estado activo'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Formatear placa en mayúsculas
        if ($this->has('vehiculo_placa')) {
            $this->merge([
                'vehiculo_placa' => strtoupper(trim($this->vehiculo_placa))
            ]);
        }

        // Formatear marca y modelo
        if ($this->has('vehiculo_marca')) {
            $this->merge([
                'vehiculo_marca' => trim(ucwords(strtolower($this->vehiculo_marca)))
            ]);
        }

        if ($this->has('vehiculo_modelo')) {
            $this->merge([
                'vehiculo_modelo' => trim(ucwords(strtolower($this->vehiculo_modelo)))
            ]);
        }

        // Formatear color
        if ($this->has('vehiculo_color')) {
            $this->merge([
                'vehiculo_color' => trim(ucwords(strtolower($this->vehiculo_color)))
            ]);
        }

        // Convertir a boolean
        if ($this->has('vehiculo_activo')) {
            $valor = $this->vehiculo_activo;
            if (is_string($valor)) {
                $this->merge([
                    'vehiculo_activo' => in_array(strtolower($valor), ['true', '1', 'yes', 'on'])
                ]);
            }
        }

        // Valores por defecto
        if (!$this->has('vehiculo_activo')) {
            $this->merge(['vehiculo_activo' => true]);
        }
    }
}
