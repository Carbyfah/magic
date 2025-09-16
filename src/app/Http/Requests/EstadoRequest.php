<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EstadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $estadoId = $this->route('estado') ? $this->route('estado')->estado_id : null;

        return [
            'estado_nombre' => [
                'required',
                'string',
                'max:45',
                Rule::unique('estado', 'estado_nombre')->ignore($estadoId, 'estado_id')
            ],
            'estado_descripcion' => 'nullable|string|max:45'
        ];
    }
}
