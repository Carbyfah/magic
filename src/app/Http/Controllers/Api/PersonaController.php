<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PersonaResource;
use App\Models\Persona;
use App\Models\TipoPersona;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class PersonaController extends Controller
{
    public function index(Request $request)
    {
        $query = Persona::query();

        // Filtros
        if ($request->filled('activo')) {
            $query->where('persona_situacion', $request->boolean('activo'));
        }

        if ($request->filled('tipo')) {
            $query->porTipo($request->tipo);
        }

        if ($request->filled('empleados_solo')) {
            if ($request->boolean('empleados_solo')) {
                $query->empleados();
            }
        }

        if ($request->filled('clientes_solo')) {
            if ($request->boolean('clientes_solo')) {
                $query->clientes();
            }
        }

        if ($request->filled('con_usuario')) {
            if ($request->boolean('con_usuario')) {
                $query->conUsuario();
            } else {
                $query->doesntHave('usuario');
            }
        }

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Incluir relaciones
        if ($request->has('with_tipo')) {
            $query->with('tipoPersona');
        }

        if ($request->has('with_usuario')) {
            $query->with(['usuario' => function ($q) {
                $q->with('rol');
            }]);
        }

        $sortField = $request->get('sort', 'persona_nombres');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return PersonaResource::collection($query->get());
        }

        $personas = $query->paginate($request->get('per_page', 15));
        return PersonaResource::collection($personas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'persona_codigo' => 'nullable|string|max:45|unique:persona',
            'persona_nombres' => 'required|string|max:100',
            'persona_apellidos' => 'required|string|max:100',
            'persona_telefono' => 'nullable|integer|min:10000000|max:999999999999',
            'persona_email' => 'nullable|email|max:45',
            'persona_situacion' => 'boolean',
            'tipo_persona_id' => 'required|exists:tipo_persona,tipo_persona_id'
        ]);

        $persona = Persona::create($validated);

        // Generar código si no se proporcionó
        if (!$validated['persona_codigo']) {
            $persona->persona_codigo = $persona->generarCodigoUnico();
            $persona->save();
        }

        $persona->load('tipoPersona');
        return new PersonaResource($persona);
    }

    public function show(Persona $persona)
    {
        $persona->load(['tipoPersona', 'usuario.rol']);
        return new PersonaResource($persona);
    }

    public function update(Request $request, Persona $persona)
    {
        $validated = $request->validate([
            'persona_codigo' => [
                'nullable',
                'string',
                'max:45',
                Rule::unique('persona')->ignore($persona->persona_id, 'persona_id')
            ],
            'persona_nombres' => 'required|string|max:100',
            'persona_apellidos' => 'required|string|max:100',
            'persona_telefono' => 'nullable|integer|min:10000000|max:999999999999',
            'persona_email' => 'nullable|email|max:45',
            'persona_situacion' => 'boolean',
            'tipo_persona_id' => 'required|exists:tipo_persona,tipo_persona_id'
        ]);

        $persona->update($validated);

        $persona->load('tipoPersona');
        return new PersonaResource($persona);
    }

    public function destroy(Persona $persona)
    {
        // Verificar si tiene usuario asociado
        if ($persona->usuario) {
            return response()->json([
                'message' => 'No se puede eliminar esta persona porque tiene un usuario asociado.'
            ], Response::HTTP_CONFLICT);
        }

        $persona->delete();

        return response()->json([
            'message' => 'Persona eliminada exitosamente'
        ]);
    }

    public function activate(Persona $persona)
    {
        $persona->update(['persona_situacion' => true]);
        return new PersonaResource($persona->load('tipoPersona'));
    }

    public function deactivate(Persona $persona)
    {
        $persona->update(['persona_situacion' => false]);
        return new PersonaResource($persona->load('tipoPersona'));
    }

    public function empleados(Request $request)
    {
        $query = Persona::empleados()->activo()->with(['tipoPersona', 'usuario.rol']);

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $empleados = $query->orderBy('persona_nombres')->get();
        return PersonaResource::collection($empleados);
    }

    public function clientes(Request $request)
    {
        $query = Persona::clientes()->activo()->with('tipoPersona');

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $clientes = $query->orderBy('persona_nombres')->get();
        return PersonaResource::collection($clientes);
    }

    public function vendedores()
    {
        $vendedores = Persona::porTipo('VEND')
            ->activo()
            ->with(['tipoPersona', 'usuario.rol'])
            ->orderBy('persona_nombres')
            ->get();

        return PersonaResource::collection($vendedores);
    }

    public function choferes()
    {
        $choferes = Persona::porTipo('CHOF')
            ->activo()
            ->with(['tipoPersona', 'usuario.rol'])
            ->orderBy('persona_nombres')
            ->get();

        return PersonaResource::collection($choferes);
    }

    public function sinUsuario()
    {
        $personas = Persona::empleados()
            ->activo()
            ->doesntHave('usuario')
            ->with('tipoPersona')
            ->orderBy('persona_nombres')
            ->get();

        return PersonaResource::collection($personas);
    }

    public function validarDatos(Request $request, Persona $persona)
    {
        $validaciones = [
            'datos_completos' => $persona->datosCompletos(),
            'email_valido' => $persona->tieneEmailValido(),
            'telefono_valido' => $persona->tieneTelefonoValido(),
            'tiene_usuario' => $persona->tieneUsuario(),
            'esta_activo' => $persona->estaActivo()
        ];

        $errores = [];

        if (!$validaciones['datos_completos']) {
            $errores[] = 'Los datos de la persona están incompletos';
        }

        if ($persona->persona_email && !$validaciones['email_valido']) {
            $errores[] = 'El email no tiene un formato válido';
        }

        if ($persona->persona_telefono && !$validaciones['telefono_valido']) {
            $errores[] = 'El teléfono debe tener al menos 8 dígitos';
        }

        return response()->json([
            'persona' => new PersonaResource($persona),
            'validaciones' => $validaciones,
            'errores' => $errores,
            'es_valido' => empty($errores)
        ]);
    }

    public function whatsappLink(Persona $persona, Request $request)
    {
        if (!$persona->tieneTelefonoValido()) {
            return response()->json([
                'message' => 'Esta persona no tiene un teléfono válido para WhatsApp'
            ], Response::HTTP_BAD_REQUEST);
        }

        $mensaje = $request->get('mensaje');
        $link = $persona->linkWhatsApp($mensaje);

        return response()->json([
            'persona' => new PersonaResource($persona),
            'whatsapp_link' => $link,
            'telefono_formateado' => $persona->telefono_formateado,
            'mensaje' => $mensaje
        ]);
    }

    public function generarCodigo(Persona $persona)
    {
        $codigoAnterior = $persona->persona_codigo;
        $persona->actualizarCodigo();

        return response()->json([
            'persona' => new PersonaResource($persona),
            'codigo_anterior' => $codigoAnterior,
            'codigo_nuevo' => $persona->persona_codigo
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => Persona::count(),
            'activas' => Persona::activo()->count(),
            'empleados' => Persona::empleados()->count(),
            'clientes' => Persona::clientes()->count(),
            'con_usuario' => Persona::conUsuario()->count(),
            'por_tipo' => TipoPersona::activo()
                ->withCount('personas')
                ->get()
                ->map(function ($tipo) {
                    return [
                        'tipo' => $tipo->tipo_persona_codigo,
                        'nombre' => $tipo->tipo_persona_tipo,
                        'cantidad' => $tipo->personas_count
                    ];
                }),
            'datos_incompletos' => Persona::activo()
                ->get()
                ->filter(function ($persona) {
                    return !$persona->datosCompletos();
                })
                ->count()
        ];

        return response()->json($stats);
    }
}
