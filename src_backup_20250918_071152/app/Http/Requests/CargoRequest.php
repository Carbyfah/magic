<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CargoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cargoId = $this->route('cargo') ? $this->route('cargo')->id_cargo : null;

        return [
            'cargo_nombre' => [
                'required',
                'string',
                'max:45',
                Rule::unique('cargo', 'cargo_nombre')->ignore($cargoId, 'id_cargo')
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'cargo_nombre.required' => 'El nombre del cargo es obligatorio.',
            'cargo_nombre.unique' => 'Ya existe un cargo con este nombre.',
            'cargo_nombre.max' => 'El nombre no puede exceder 45 caracteres.'
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('cargo_nombre')) {
            $this->merge([
                'cargo_nombre' => trim(ucwords(strtolower($this->cargo_nombre)))
            ]);
        }
    }
}
