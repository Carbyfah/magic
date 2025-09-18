<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FacturaRequest extends FormRequest
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
            'nit_cliente' => 'required|string|max:20',
            'nombre_cliente' => 'required|string|max:255',
            'direccion_cliente' => 'required|string|max:500',
            'total_factura' => 'required|numeric|min:0|max:999999.99',
            'fecha_factura' => 'required|date',
            'descripcion_servicios' => 'required|string|max:2000',
            'id_reservas' => 'nullable|integer|exists:reservas,id_reservas',
            'observaciones' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nit_cliente.required' => 'El NIT del cliente es obligatorio.',
            'nit_cliente.max' => 'El NIT no puede exceder 20 caracteres.',
            'nombre_cliente.required' => 'El nombre del cliente es obligatorio.',
            'nombre_cliente.max' => 'El nombre no puede exceder 255 caracteres.',
            'direccion_cliente.required' => 'La dirección del cliente es obligatoria.',
            'direccion_cliente.max' => 'La dirección no puede exceder 500 caracteres.',
            'total_factura.required' => 'El total de la factura es obligatorio.',
            'total_factura.numeric' => 'El total debe ser un número.',
            'total_factura.min' => 'El total no puede ser negativo.',
            'total_factura.max' => 'El total no puede exceder Q999,999.99.',
            'fecha_factura.required' => 'La fecha de la factura es obligatoria.',
            'fecha_factura.date' => 'La fecha debe ser válida.',
            'descripcion_servicios.required' => 'La descripción de servicios es obligatoria.',
            'descripcion_servicios.max' => 'La descripción no puede exceder 2000 caracteres.',
            'id_reservas.exists' => 'La reserva seleccionada no existe.',
            'observaciones.max' => 'Las observaciones no pueden exceder 1000 caracteres.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Formatear NIT
        if ($this->has('nit_cliente')) {
            $nit = preg_replace('/[^0-9K-]/', '', strtoupper($this->nit_cliente));
            $this->merge(['nit_cliente' => $nit]);
        }

        // Formatear nombre
        if ($this->has('nombre_cliente')) {
            $this->merge([
                'nombre_cliente' => trim(ucwords(strtolower($this->nombre_cliente)))
            ]);
        }

        // Limpiar campos opcionales
        if ($this->has('observaciones')) {
            $this->merge([
                'observaciones' => trim($this->observaciones) ?: null
            ]);
        }

        if ($this->id_reservas === '') {
            $this->merge(['id_reservas' => null]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validar formato de NIT guatemalteco
            if ($this->nit_cliente) {
                if (!preg_match('/^[0-9]{1,8}-?[0-9K]$/', $this->nit_cliente)) {
                    $validator->errors()->add('nit_cliente', 'El formato del NIT no es válido para Guatemala.');
                }
            }

            // Validar fecha de factura
            if ($this->fecha_factura) {
                $fechaFactura = \Carbon\Carbon::parse($this->fecha_factura);

                if ($fechaFactura->isFuture()) {
                    $validator->errors()->add('fecha_factura', 'La fecha de la factura no puede ser futura.');
                }

                if ($fechaFactura->diffInDays(today()) > 30) {
                    $validator->warnings()->add('fecha_factura', 'La fecha de la factura es muy antigua.');
                }
            }
        });
    }
}
