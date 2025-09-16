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
                'max:45', // Según la migración: string(45)
                Rule::unique('agencias', 'agencias_nombre')->ignore($agenciaId, 'id_agencias')
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
        // Limpiar y formatear nombre
        if ($this->has('agencias_nombre')) {
            $nombre = trim($this->agencias_nombre);

            // Formatear nombre: Primera letra mayúscula de cada palabra
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
            // Validación especial: No permitir crear otra "Magic Travel"
            if ($this->agencias_nombre && strtolower(trim($this->agencias_nombre)) === 'magic travel') {
                $agenciaId = $this->route('agencia') ? $this->route('agencia')->id_agencias : null;

                // Si es creación (no update)
                if (!$agenciaId) {
                    $existeMagicTravel = \App\Models\Agencia::where('agencias_nombre', 'Magic Travel')->first();
                    if ($existeMagicTravel) {
                        $validator->errors()->add('agencias_nombre', 'Magic Travel ya existe en el sistema.');
                    }
                }
                // Si es actualización, verificar que no se cambie desde otro nombre a Magic Travel
                else {
                    $agenciaActual = $this->route('agencia');
                    if ($agenciaActual->agencias_nombre !== 'Magic Travel') {
                        $validator->errors()->add('agencias_nombre', 'No se puede cambiar el nombre a Magic Travel.');
                    }
                }
            }

            // Validación: Nombre no puede estar vacío después del formateo
            if (empty(trim($this->agencias_nombre ?? ''))) {
                $validator->errors()->add('agencias_nombre', 'El nombre no puede estar vacío.');
            }
        });
    }
}
