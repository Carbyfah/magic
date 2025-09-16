<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmpleadoRequest extends FormRequest
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
        $empleadoId = $this->route('empleado') ? $this->route('empleado')->id_empleados : null;

        return [
            'empleados_nombres' => 'required|string|max:255',
            'empleados_apellidos' => 'required|string|max:255',
            'empleados_telefono' => [
                'required',
                'string',
                'max:20',
                Rule::unique('empleados', 'empleados_telefono')->ignore($empleadoId, 'id_empleados')
            ],
            'empleados_direccion' => 'nullable|string|max:500',
            'empleados_dpi' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('empleados', 'empleados_dpi')->ignore($empleadoId, 'id_empleados')
            ],
            'empleados_correo' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('empleados', 'empleados_correo')->ignore($empleadoId, 'id_empleados')
            ],
            'empleados_fecha_nacimiento' => 'nullable|date|before:today',
            'empleados_fecha_ingreso' => 'required|date|before_or_equal:today',
            'empleados_salario' => 'nullable|numeric|min:0|max:999999.99',
            'empleados_estado' => 'required|string|max:50',
            'empleados_observaciones' => 'nullable|string|max:1000',
            'empleados_activo' => 'boolean',
            'id_agencias' => 'required|integer|exists:agencias,id_agencias',
            'id_cargo' => 'required|integer|exists:cargo,id_cargo'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'empleados_nombres.required' => 'Los nombres del empleado son obligatorios.',
            'empleados_nombres.max' => 'Los nombres no pueden exceder 255 caracteres.',
            'empleados_apellidos.required' => 'Los apellidos del empleado son obligatorios.',
            'empleados_apellidos.max' => 'Los apellidos no pueden exceder 255 caracteres.',
            'empleados_telefono.required' => 'El teléfono del empleado es obligatorio.',
            'empleados_telefono.unique' => 'Ya existe un empleado con este teléfono.',
            'empleados_telefono.max' => 'El teléfono no puede exceder 20 caracteres.',
            'empleados_direccion.max' => 'La dirección no puede exceder 500 caracteres.',
            'empleados_dpi.unique' => 'Ya existe un empleado con este DPI.',
            'empleados_dpi.max' => 'El DPI no puede exceder 20 caracteres.',
            'empleados_correo.email' => 'El correo debe tener un formato válido.',
            'empleados_correo.unique' => 'Ya existe un empleado con este correo.',
            'empleados_correo.max' => 'El correo no puede exceder 255 caracteres.',
            'empleados_fecha_nacimiento.date' => 'La fecha de nacimiento debe ser una fecha válida.',
            'empleados_fecha_nacimiento.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'empleados_fecha_ingreso.required' => 'La fecha de ingreso es obligatoria.',
            'empleados_fecha_ingreso.date' => 'La fecha de ingreso debe ser una fecha válida.',
            'empleados_fecha_ingreso.before_or_equal' => 'La fecha de ingreso no puede ser futura.',
            'empleados_salario.numeric' => 'El salario debe ser un número.',
            'empleados_salario.min' => 'El salario no puede ser negativo.',
            'empleados_salario.max' => 'El salario no puede exceder Q999,999.99.',
            'empleados_estado.required' => 'El estado del empleado es obligatorio.',
            'empleados_estado.max' => 'El estado no puede exceder 50 caracteres.',
            'empleados_observaciones.max' => 'Las observaciones no pueden exceder 1000 caracteres.',
            'empleados_activo.boolean' => 'El estado activo debe ser verdadero o falso.',
            'id_agencias.required' => 'Debe seleccionar una agencia.',
            'id_agencias.exists' => 'La agencia seleccionada no existe.',
            'id_cargo.required' => 'Debe seleccionar un cargo.',
            'id_cargo.exists' => 'El cargo seleccionado no existe.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'empleados_nombres' => 'nombres',
            'empleados_apellidos' => 'apellidos',
            'empleados_telefono' => 'teléfono',
            'empleados_direccion' => 'dirección',
            'empleados_dpi' => 'DPI',
            'empleados_correo' => 'correo electrónico',
            'empleados_fecha_nacimiento' => 'fecha de nacimiento',
            'empleados_fecha_ingreso' => 'fecha de ingreso',
            'empleados_salario' => 'salario',
            'empleados_estado' => 'estado',
            'empleados_observaciones' => 'observaciones',
            'empleados_activo' => 'estado activo',
            'id_agencias' => 'agencia',
            'id_cargo' => 'cargo'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Formatear nombres y apellidos
        if ($this->has('empleados_nombres')) {
            $this->merge([
                'empleados_nombres' => trim(ucwords(strtolower($this->empleados_nombres)))
            ]);
        }

        if ($this->has('empleados_apellidos')) {
            $this->merge([
                'empleados_apellidos' => trim(ucwords(strtolower($this->empleados_apellidos)))
            ]);
        }

        // Limpiar teléfono
        if ($this->has('empleados_telefono')) {
            $telefono = preg_replace('/[^0-9+\-\s]/', '', $this->empleados_telefono);
            $this->merge([
                'empleados_telefono' => trim($telefono)
            ]);
        }

        // Formatear DPI
        if ($this->has('empleados_dpi')) {
            $dpi = preg_replace('/[^0-9]/', '', $this->empleados_dpi);
            $this->merge([
                'empleados_dpi' => $dpi ?: null
            ]);
        }

        // Limpiar correo
        if ($this->has('empleados_correo')) {
            $this->merge([
                'empleados_correo' => strtolower(trim($this->empleados_correo)) ?: null
            ]);
        }

        // Formatear estado
        if ($this->has('empleados_estado')) {
            $this->merge([
                'empleados_estado' => trim(ucwords(strtolower($this->empleados_estado)))
            ]);
        }

        // Convertir a boolean
        if ($this->has('empleados_activo')) {
            $valor = $this->empleados_activo;
            if (is_string($valor)) {
                $this->merge([
                    'empleados_activo' => in_array(strtolower($valor), ['true', '1', 'yes', 'on'])
                ]);
            }
        }

        // Valores por defecto
        if (!$this->has('empleados_activo')) {
            $this->merge(['empleados_activo' => true]);
        }

        if (!$this->has('empleados_estado')) {
            $this->merge(['empleados_estado' => 'Activo']);
        }

        if (!$this->has('empleados_fecha_ingreso')) {
            $this->merge(['empleados_fecha_ingreso' => today()->format('Y-m-d')]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validar edad mínima si se proporciona fecha de nacimiento
            if ($this->empleados_fecha_nacimiento) {
                $fechaNacimiento = \Carbon\Carbon::parse($this->empleados_fecha_nacimiento);
                $edad = $fechaNacimiento->diffInYears(today());

                if ($edad < 18) {
                    $validator->errors()->add('empleados_fecha_nacimiento', 'El empleado debe ser mayor de 18 años.');
                }

                if ($edad > 100) {
                    $validator->errors()->add('empleados_fecha_nacimiento', 'La fecha de nacimiento parece incorrecta.');
                }
            }

            // Validar que la fecha de ingreso no sea muy antigua
            if ($this->empleados_fecha_ingreso) {
                $fechaIngreso = \Carbon\Carbon::parse($this->empleados_fecha_ingreso);
                $antiguedad = $fechaIngreso->diffInYears(today());

                if ($antiguedad > 50) {
                    $validator->errors()->add('empleados_fecha_ingreso', 'La fecha de ingreso parece incorrecta.');
                }
            }

            // Validar DPI guatemalteco si se proporciona
            if ($this->empleados_dpi) {
                if (strlen($this->empleados_dpi) !== 13) {
                    $validator->errors()->add('empleados_dpi', 'El DPI debe tener 13 dígitos.');
                }
            }
        });
    }
}
