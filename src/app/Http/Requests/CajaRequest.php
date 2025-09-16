<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CajaRequest extends FormRequest
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
            'origen' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'fecha_servicio' => 'required|date',
            'pax_adultos' => 'required|integer|min:0|max:100',
            'pax_ninos' => 'nullable|integer|min:0|max:100',
            'precio_unitario' => 'required|numeric|min:0|max:99999.99',
            'precio_total' => 'required|numeric|min:0|max:999999.99',
            'direccion' => 'nullable|string|max:500',
            'servicio_cobrar_pax' => 'required|numeric|min:0|max:999999.99',
            'servicio_precio_descuento' => 'nullable|numeric|min:0|max:99999.99',
            'id_reservas' => 'nullable|integer|exists:reservas,id_reservas',
            'estado_id' => 'required|integer|exists:estado,estado_id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'origen.required' => 'El origen del servicio es obligatorio.',
            'origen.max' => 'El origen no puede exceder 255 caracteres.',
            'destino.required' => 'El destino del servicio es obligatorio.',
            'destino.max' => 'El destino no puede exceder 255 caracteres.',
            'fecha_servicio.required' => 'La fecha del servicio es obligatoria.',
            'fecha_servicio.date' => 'La fecha del servicio debe ser una fecha válida.',
            'pax_adultos.required' => 'La cantidad de adultos es obligatoria.',
            'pax_adultos.integer' => 'La cantidad de adultos debe ser un número entero.',
            'pax_adultos.min' => 'La cantidad de adultos no puede ser negativa.',
            'pax_adultos.max' => 'La cantidad de adultos no puede exceder 100.',
            'pax_ninos.integer' => 'La cantidad de niños debe ser un número entero.',
            'pax_ninos.min' => 'La cantidad de niños no puede ser negativa.',
            'pax_ninos.max' => 'La cantidad de niños no puede exceder 100.',
            'precio_unitario.required' => 'El precio unitario es obligatorio.',
            'precio_unitario.numeric' => 'El precio unitario debe ser un número.',
            'precio_unitario.min' => 'El precio unitario no puede ser negativo.',
            'precio_unitario.max' => 'El precio unitario no puede exceder Q99,999.99.',
            'precio_total.required' => 'El precio total es obligatorio.',
            'precio_total.numeric' => 'El precio total debe ser un número.',
            'precio_total.min' => 'El precio total no puede ser negativo.',
            'precio_total.max' => 'El precio total no puede exceder Q999,999.99.',
            'direccion.max' => 'La dirección no puede exceder 500 caracteres.',
            'servicio_cobrar_pax.required' => 'El monto a cobrar es obligatorio.',
            'servicio_cobrar_pax.numeric' => 'El monto a cobrar debe ser un número.',
            'servicio_cobrar_pax.min' => 'El monto a cobrar no puede ser negativo.',
            'servicio_cobrar_pax.max' => 'El monto a cobrar no puede exceder Q999,999.99.',
            'servicio_precio_descuento.numeric' => 'El precio con descuento debe ser un número.',
            'servicio_precio_descuento.min' => 'El precio con descuento no puede ser negativo.',
            'servicio_precio_descuento.max' => 'El precio con descuento no puede exceder Q99,999.99.',
            'id_reservas.exists' => 'La reserva seleccionada no existe.',
            'estado_id.required' => 'El estado es obligatorio.',
            'estado_id.exists' => 'El estado seleccionado no existe.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'origen' => 'origen',
            'destino' => 'destino',
            'fecha_servicio' => 'fecha del servicio',
            'pax_adultos' => 'cantidad de adultos',
            'pax_ninos' => 'cantidad de niños',
            'precio_unitario' => 'precio unitario',
            'precio_total' => 'precio total',
            'direccion' => 'dirección',
            'servicio_cobrar_pax' => 'monto a cobrar',
            'servicio_precio_descuento' => 'precio con descuento',
            'id_reservas' => 'reserva',
            'estado_id' => 'estado'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Formatear origen y destino
        if ($this->has('origen')) {
            $this->merge([
                'origen' => trim(ucwords(strtolower($this->origen)))
            ]);
        }

        if ($this->has('destino')) {
            $this->merge([
                'destino' => trim(ucwords(strtolower($this->destino)))
            ]);
        }

        // Limpiar dirección
        if ($this->has('direccion')) {
            $this->merge([
                'direccion' => trim($this->direccion) ?: null
            ]);
        }

        // Asegurar que valores nulos sean realmente null
        if ($this->pax_ninos === '') {
            $this->merge(['pax_ninos' => null]);
        }

        if ($this->servicio_precio_descuento === '') {
            $this->merge(['servicio_precio_descuento' => null]);
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
            // El total_pax se calculará automáticamente por el Observer
            // Pero validamos coherencia si se proporciona
            $totalPaxCalculado = $this->pax_adultos + ($this->pax_ninos ?? 0);

            if ($totalPaxCalculado === 0) {
                $validator->errors()->add('pax_adultos', 'Debe haber al menos 1 pasajero en total.');
            }

            // Validar coherencia de precios
            if ($this->precio_unitario && $this->precio_total && $totalPaxCalculado > 0) {
                $precioCalculado = $this->precio_unitario * $totalPaxCalculado;
                $diferencia = abs($this->precio_total - $precioCalculado);
                $porcentajeDiferencia = $precioCalculado > 0 ? ($diferencia / $precioCalculado) * 100 : 0;

                // Permitir hasta 20% de diferencia (por descuentos, etc.)
                if ($porcentajeDiferencia > 20) {
                    $validator->warnings()->add('precio_total', 'El precio total parece inconsistente con el precio unitario.');
                }
            }

            // Validar que el monto a cobrar no exceda demasiado el precio total
            if ($this->servicio_cobrar_pax && $this->precio_total) {
                if ($this->servicio_cobrar_pax > ($this->precio_total * 1.1)) {
                    $validator->warnings()->add('servicio_cobrar_pax', 'El monto a cobrar es mayor al precio total del servicio.');
                }
            }

            // Validar fecha del servicio
            if ($this->fecha_servicio) {
                $fechaServicio = \Carbon\Carbon::parse($this->fecha_servicio);
                $hoy = today();

                // Advertir si la fecha es muy antigua
                if ($fechaServicio->diffInDays($hoy) > 365) {
                    $validator->warnings()->add('fecha_servicio', 'La fecha del servicio es de hace más de un año.');
                }

                // Advertir si la fecha es muy futura
                if ($fechaServicio->diffInDays($hoy, false) > 90) {
                    $validator->warnings()->add('fecha_servicio', 'La fecha del servicio es muy lejana en el futuro.');
                }
            }
        });
    }
}
