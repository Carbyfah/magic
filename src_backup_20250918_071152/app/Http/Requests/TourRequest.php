<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TourRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'tours_nombre' => 'required|string|max:45',
            'id_agencias' => 'required|exists:agencias,id_agencias'
        ];
    }
}
