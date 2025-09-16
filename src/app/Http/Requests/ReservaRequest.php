<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReservaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $reservaId = $this->route('reserva') ? $this->route('reserva')->id_reservas : null;

        $rules = [
            'reservas_nombres_cliente' => 'required|string|max:255',
            'reservas_apellidos_cliente' => 'required|string|max:255',
            'reservas_telefono' => 'required|string|max:20',
            'reservas_cantidad_adultos' => 'required|integer|min:1|max:50',
            'reservas_cantidad_ninos' => 'nullable|integer|min:0|max:50',
            'reservas_direccion_abordaje' => 'nullable|string|max:500',
            'reservas_observaciones' => 'nullable|string|max:1000',
            'reservas_voucher' => 'nullable|string|max:100',
            'reservas_cobrar_a_pax' => 'nullable|numeric|min:0',
            'id_servicio' => 'required|integer|exists:servicio,id_servicio',
            'estado_id' => 'required|integer|exists:estado,estado_id',
            'id_agencia_transferida' => 'nullable|integer|exists:agencias,id_agencias',
        ];

        // Validación condicional: debe tener ruta O tour, no ambos
        $rules['id_ruta_activa'] = [
            'nullable',
            'integer',
            'exists:ruta_activa,id_ruta_activa',
            function ($attribute, $value, $fail) {
                $tourActivo = $this->input('id_tour_activo');

                if (!$value && !$tourActivo) {
                    $fail('La reserva debe estar asociada a una ruta activa o un tour activo.');
                }

                if ($value && $tourActivo) {
                    $fail('La reserva no puede estar asociada a ambos: ruta y tour al mismo tiempo.');
                }
            },
        ];

        $rules['id_tour_activo'] = [
            'nullable',
            'integer',
            'exists:tour_activo,id_tour_activo'
        ];

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reservas_nombres_cliente.required' => 'El nombre del cliente es obligatorio.',
            'reservas_apellidos_cliente.required' => 'Los apellidos del cliente son obligatorios.',
            'reservas_telefono.required' => 'El teléfono del cliente es obligatorio.',
            'reservas_cantidad_adultos.required' => 'La cantidad de adultos es obligatoria.',
            'reservas_cantidad_adultos.min' => 'Debe haber al menos 1 adulto.',
            'reservas_cantidad_adultos.max' => 'No pueden ser más de 50 adultos.',
            'reservas_cantidad_ninos.max' => 'No pueden ser más de 50 niños.',
            'id_servicio.required' => 'Debe seleccionar un servicio.',
            'id_servicio.exists' => 'El servicio seleccionado no existe.',
            'estado_id.required' => 'Debe seleccionar un estado.',
            'estado_id.exists' => 'El estado seleccionado no existe.',
            'id_ruta_activa.exists' => 'La ruta activa seleccionada no existe.',
            'id_tour_activo.exists' => 'El tour activo seleccionado no existe.',
            'id_agencia_transferida.exists' => 'La agencia transferida seleccionada no existe.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'reservas_nombres_cliente' => 'nombres del cliente',
            'reservas_apellidos_cliente' => 'apellidos del cliente',
            'reservas_telefono' => 'teléfono',
            'reservas_cantidad_adultos' => 'cantidad de adultos',
            'reservas_cantidad_ninos' => 'cantidad de niños',
            'reservas_direccion_abordaje' => 'dirección de abordaje',
            'reservas_observaciones' => 'observaciones',
            'reservas_voucher' => 'voucher',
            'reservas_cobrar_a_pax' => 'monto a cobrar',
            'id_servicio' => 'servicio',
            'estado_id' => 'estado',
            'id_ruta_activa' => 'ruta activa',
            'id_tour_activo' => 'tour activo',
            'id_agencia_transferida' => 'agencia transferida'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Limpiar datos antes de validación
        if ($this->has('reservas_nombres_cliente')) {
            $this->merge([
                'reservas_nombres_cliente' => trim(ucwords(strtolower($this->reservas_nombres_cliente)))
            ]);
        }

        if ($this->has('reservas_apellidos_cliente')) {
            $this->merge([
                'reservas_apellidos_cliente' => trim(ucwords(strtolower($this->reservas_apellidos_cliente)))
            ]);
        }

        // Asegurar que valores nulos sean realmente null
        if ($this->reservas_cantidad_ninos === '') {
            $this->merge(['reservas_cantidad_ninos' => null]);
        }

        if ($this->id_agencia_transferida === '') {
            $this->merge(['id_agencia_transferida' => null]);
        }
    }
}
