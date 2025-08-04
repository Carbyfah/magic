<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoPersona;
use Illuminate\Http\Request;

class TipoPersonaController extends Controller
{
    public function index()
    {
        $tipos = TipoPersona::where('situacion', 1)->get();
        return response()->json($tipos);
    }

    public function store(Request $request)
    {
        $tipo = TipoPersona::create($request->all());
        return response()->json($tipo, 201);
    }

    public function show($id)
    {
        $tipo = TipoPersona::findOrFail($id);
        return response()->json($tipo);
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoPersona::findOrFail($id);
        $tipo->update($request->all());
        return response()->json($tipo);
    }

    public function destroy($id)
    {
        $tipo = TipoPersona::findOrFail($id);
        $tipo->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}
