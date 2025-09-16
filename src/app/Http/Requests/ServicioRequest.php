<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServicioRequest extends FormRequest
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
            'precio_servicio' => 'required|numeric|min:0|max:99999.99',
            'servicio_precio_descuento' => 'nullable|numeric|min:0|max:99999.99',
            'servicio_descuento_porcentaje' => 'nullable|numeric|min:0|max:100',
            'servicio_activo' => 'boolean',
            'servicio_observaciones' => 'nullable|string|max:1000',
            'id_ruta_activa' => 'nullable|integer|exists:ruta_activa,id_ruta_activa',
            'id_tour_activo' => 'nullable|integer|exists:tour_activo,id_tour_activo',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'precio_servicio.required' => 'El precio del servicio es obligatorio.',
            'precio_servicio.numeric' => 'El precio del servicio debe ser un número.',
            'precio_servicio.min' => 'El precio del servicio no puede ser negativo.',
            'precio_servicio.max' => 'El precio del servicio no puede exceder Q99,999.99.',
            'servicio_precio_descuento.numeric' => 'El precio con descuento debe ser un número.',
            'servicio_precio_descuento.min' => 'El precio con descuento no puede ser negativo.',
            'servicio_precio_descuento.max' => 'El precio con descuento no puede exceder Q99,999.99.',
            'servicio_descuento_porcentaje.numeric' => 'El porcentaje de descuento debe ser un número.',
            'servicio_descuento_porcentaje.min' => 'El porcentaje de descuento no puede ser negativo.',
            'servicio_descuento_porcentaje.max' => 'El porcentaje de descuento no puede exceder 100%.',
            'servicio_activo.boolean' => 'El estado activo debe ser verdadero o falso.',
            'servicio_observaciones.max' => 'Las observaciones no pueden exceder 1000 caracteres.',
            'id_ruta_activa.exists' => 'La ruta activa seleccionada no existe.',
            'id_tour_activo.exists' => 'El tour activo seleccionado no existe.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'precio_servicio' => 'precio del servicio',
            'servicio_precio_descuento' => 'precio con descuento',
            'servicio_descuento_porcentaje' => 'porcentaje de descuento',
            'servicio_activo' => 'estado activo',
            'servicio_observaciones' => 'observaciones',
            'id_ruta_activa' => 'ruta activa',
            'id_tour_activo' => 'tour activo'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Validación condicional: debe tener ruta O tour, no ambos
        $this->merge([
            'tiene_ruta' => !empty($this->id_ruta_activa),
            'tiene_tour' => !empty($this->id_tour_activo)
        ]);

        // Convertir a boolean
        if ($this->has('servicio_activo')) {
            $valor = $this->servicio_activo;
            if (is_string($valor)) {
                $this->merge([
                    'servicio_activo' => in_array(strtolower($valor), ['true', '1', 'yes', 'on'])
                ]);
            }
        }

        // Valores por defecto
        if (!$this->has('servicio_activo')) {
            $this->merge(['servicio_activo' => true]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $tieneRuta = !empty($this->id_ruta_activa);
            $tieneTour = !empty($this->id_tour_activo);

            if (!$tieneRuta && !$tieneTour) {
                $validator->errors()->add('id_ruta_activa', 'El servicio debe estar asociado a una ruta activa o un tour activo.');
            }

            if ($tieneRuta && $tieneTour) {
                $validator->errors()->add('id_ruta_activa', 'El servicio no puede estar asociado a ambos: ruta y tour al mismo tiempo.');
            }

            // Validar que el precio con descuento no sea mayor al precio base
            if ($this->precio_servicio && $this->servicio_precio_descuento) {
                if ($this->servicio_precio_descuento > $this->precio_servicio) {
                    $validator->errors()->add('servicio_precio_descuento', 'El precio con descuento no puede ser mayor al precio base.');
                }
            }

            // Validar coherencia entre descuento y porcentaje
            if ($this->precio_servicio && $this->servicio_precio_descuento && $this->servicio_descuento_porcentaje) {
                $descuentoCalculado = $this->precio_servicio * ($this->servicio_descuento_porcentaje / 100);
                $precioConDescuentoCalculado = $this->precio_servicio - $descuentoCalculado;

                // Permitir una diferencia pequeña por redondeo
                if (abs($this->servicio_precio_descuento - $precioConDescuentoCalculado) > 0.01) {
                    $validator->errors()->add('servicio_descuento_porcentaje', 'El porcentaje de descuento no coincide con el precio con descuento.');
                }
            }
        });
    }
}
