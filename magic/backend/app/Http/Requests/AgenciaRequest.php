<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AgenciaRequest extends FormRequest
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
        $agenciaId = $this->route('agencia') ? $this->route('agencia')->id_agencias : null;

        return [
            'agencias_nombre' => [
                'required',
                'string',
                'max:45',
                // ÚNICA consulta DB - valida nombre único
                Rule::unique('agencias', 'agencias_nombre')
                    ->ignore($agenciaId, 'id_agencias')
                    ->whereNull('deleted_at') // Solo considerar agencias activas
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'agencias_nombre.required' => 'El nombre de la agencia es obligatorio.',
            'agencias_nombre.string' => 'El nombre debe ser texto.',
            'agencias_nombre.max' => 'El nombre no puede exceder 45 caracteres.',
            'agencias_nombre.unique' => 'Ya existe una agencia con este nombre.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'agencias_nombre' => 'nombre de la agencia'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('agencias_nombre')) {
            $nombre = trim($this->agencias_nombre);

            // Formatear: Primera letra mayúscula de cada palabra
            $nombre = ucwords(strtolower($nombre));

            $this->merge([
                'agencias_nombre' => $nombre
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // ÚNICA validación adicional: nombre no vacío después del formateo
            if (empty(trim($this->agencias_nombre ?? ''))) {
                $validator->errors()->add('agencias_nombre', 'El nombre no puede estar vacío.');
            }

            // NO validar Magic Travel aquí - se hace en el controlador
            // Mantiene separación de responsabilidades
        });
    }
}
