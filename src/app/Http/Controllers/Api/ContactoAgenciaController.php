<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactoAgenciaResource;
use App\Models\ContactoAgencia;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ContactoAgenciaController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactoAgencia::query();

        if ($request->filled('activo')) {
            $query->where('contactos_agencia_situacion', $request->boolean('activo'));
        }

        if ($request->filled('agencia_id')) {
            $query->porAgencia($request->agencia_id);
        }

        if ($request->filled('cargo')) {
            if ($request->cargo === 'gerente') {
                $query->gerentes();
            } elseif ($request->cargo === 'ventas') {
                $query->ventas();
            }
        }

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        if ($request->has('with_agencia')) {
            $query->with('agencia');
        }

        if ($request->has('detalle_completo')) {
            $request->request->add(['detalle_completo' => true]);
        }

        if ($request->has('include_mensajes')) {
            $request->request->add(['include_mensajes' => true]);
        }

        $sortField = $request->get('sort', 'contactos_agencia_nombres');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('all')) {
            return ContactoAgenciaResource::collection($query->get());
        }

        $contactos = $query->paginate($request->get('per_page', 15));
        return ContactoAgenciaResource::collection($contactos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contactos_agencia_codigo' => 'nullable|string|max:45|unique:contactos_agencia',
            'contactos_agencia_nombres' => 'required|string|max:100',
            'contactos_agencia_apellidos' => 'required|string|max:100',
            'contactos_agencia_cargo' => 'required|string|max:45',
            'contactos_agencia_telefono' => 'required|integer|min:10000000|max:999999999999',
            'contactos_agencia_situacion' => 'boolean',
            'agencia_id' => 'required|exists:agencia,agencia_id'
        ]);

        $contacto = ContactoAgencia::create($validated);

        if (!$validated['contactos_agencia_codigo']) {
            $contacto->contactos_agencia_codigo = $contacto->generarCodigoUnico();
            $contacto->save();
        }

        $contacto->load('agencia');
        return new ContactoAgenciaResource($contacto);
    }

    public function show(ContactoAgencia $contactoAgencia)
    {
        $contactoAgencia->load('agencia');
        return new ContactoAgenciaResource($contactoAgencia);
    }

    public function update(Request $request, ContactoAgencia $contactoAgencia)
    {
        $validated = $request->validate([
            'contactos_agencia_codigo' => [
                'nullable',
                'string',
                'max:45',
                Rule::unique('contactos_agencia')->ignore($contactoAgencia->contactos_agencia_id, 'contactos_agencia_id')
            ],
            'contactos_agencia_nombres' => 'required|string|max:100',
            'contactos_agencia_apellidos' => 'required|string|max:100',
            'contactos_agencia_cargo' => 'required|string|max:45',
            'contactos_agencia_telefono' => 'required|integer|min:10000000|max:999999999999',
            'contactos_agencia_situacion' => 'boolean',
            'agencia_id' => 'required|exists:agencia,agencia_id'
        ]);

        $contactoAgencia->update($validated);
        $contactoAgencia->load('agencia');

        return new ContactoAgenciaResource($contactoAgencia);
    }

    public function destroy(ContactoAgencia $contactoAgencia)
    {
        $contactoAgencia->delete();

        return response()->json([
            'message' => 'Contacto eliminado exitosamente'
        ]);
    }

    public function activate(ContactoAgencia $contactoAgencia)
    {
        $contactoAgencia->update(['contactos_agencia_situacion' => true]);
        return new ContactoAgenciaResource($contactoAgencia->load('agencia'));
    }

    public function deactivate(ContactoAgencia $contactoAgencia)
    {
        $contactoAgencia->update(['contactos_agencia_situacion' => false]);
        return new ContactoAgenciaResource($contactoAgencia->load('agencia'));
    }

    public function porAgencia($agenciaId)
    {
        $contactos = ContactoAgencia::porAgencia($agenciaId)
            ->activo()
            ->with('agencia')
            ->orderByRaw("
                                       CASE
                                           WHEN contactos_agencia_cargo LIKE '%gerente%' THEN 1
                                           WHEN contactos_agencia_cargo LIKE '%venta%' THEN 2
                                           WHEN contactos_agencia_cargo LIKE '%operacion%' THEN 3
                                           ELSE 4
                                       END
                                   ")
            ->orderBy('contactos_agencia_nombres')
            ->get();

        return ContactoAgenciaResource::collection($contactos);
    }

    public function gerentes()
    {
        $gerentes = ContactoAgencia::gerentes()
            ->activo()
            ->with('agencia')
            ->orderBy('contactos_agencia_nombres')
            ->get();

        return ContactoAgenciaResource::collection($gerentes);
    }

    public function principales()
    {
        $principales = ContactoAgencia::activo()
            ->with('agencia')
            ->get()
            ->filter(function ($contacto) {
                return $contacto->esPrincipal();
            })
            ->sortBy('agencia.agencia_razon_social')
            ->values();

        return ContactoAgenciaResource::collection($principales);
    }

    public function whatsappLink(ContactoAgencia $contacto, Request $request)
    {
        if (!$contacto->tieneTelefonoValido()) {
            return response()->json([
                'message' => 'Este contacto no tiene un teléfono válido para WhatsApp'
            ], Response::HTTP_BAD_REQUEST);
        }

        $mensaje = $request->get('mensaje');
        $link = $contacto->linkWhatsApp($mensaje);

        return response()->json([
            'contacto' => new ContactoAgenciaResource($contacto),
            'whatsapp_link' => $link,
            'telefono_formateado' => $contacto->telefono_formateado,
            'mensaje' => $mensaje
        ]);
    }

    public function mensajePresentacion(ContactoAgencia $contacto)
    {
        if (!$contacto->tieneTelefonoValido()) {
            return response()->json([
                'message' => 'Este contacto no tiene un teléfono válido para WhatsApp'
            ], Response::HTTP_BAD_REQUEST);
        }

        $mensaje = $contacto->mensajeWhatsAppPresentacion();
        $link = $contacto->linkWhatsApp($mensaje);

        return response()->json([
            'contacto' => new ContactoAgenciaResource($contacto),
            'mensaje' => $mensaje,
            'whatsapp_link' => $link
        ]);
    }

    public function mensajeConfirmacionReserva(Request $request, ContactoAgencia $contacto)
    {
        $validated = $request->validate([
            'reserva_codigo' => 'required|string',
            'pasajeros' => 'required|integer',
            'fecha' => 'required|date',
            'hora' => 'required|string',
            'monto' => 'required|numeric'
        ]);

        if (!$contacto->tieneTelefonoValido()) {
            return response()->json([
                'message' => 'Este contacto no tiene un teléfono válido para WhatsApp'
            ], Response::HTTP_BAD_REQUEST);
        }

        $mensaje = "Hola {$contacto->contactos_agencia_nombres}, confirmamos la reserva " .
            "{$validated['reserva_codigo']} para {$validated['pasajeros']} pasajeros " .
            "el {$validated['fecha']} a las {$validated['hora']}. " .
            "Monto: Q{$validated['monto']}. " .
            "Gracias por confiar en Magic Travel.";

        $link = $contacto->linkWhatsApp($mensaje);

        return response()->json([
            'contacto' => new ContactoAgenciaResource($contacto),
            'mensaje' => $mensaje,
            'whatsapp_link' => $link,
            'datos_reserva' => $validated
        ]);
    }

    public function validarDatos(ContactoAgencia $contacto)
    {
        $validaciones = [
            'datos_completos' => $contacto->datosCompletos(),
            'telefono_valido' => $contacto->tieneTelefonoValido()
        ];

        $errores = [];

        if (!$validaciones['datos_completos']) {
            $errores[] = 'Los datos del contacto están incompletos';
        }

        if (!$validaciones['telefono_valido']) {
            $errores[] = 'El teléfono debe tener al menos 8 dígitos';
        }

        return response()->json([
            'contacto' => new ContactoAgenciaResource($contacto),
            'validaciones' => $validaciones,
            'errores' => $errores,
            'es_valido' => empty($errores)
        ]);
    }

    public function generarCodigo(ContactoAgencia $contacto)
    {
        $codigoAnterior = $contacto->contactos_agencia_codigo;
        $contacto->contactos_agencia_codigo = $contacto->generarCodigoUnico();
        $contacto->save();

        return response()->json([
            'contacto' => new ContactoAgenciaResource($contacto),
            'codigo_anterior' => $codigoAnterior,
            'codigo_nuevo' => $contacto->contactos_agencia_codigo
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => ContactoAgencia::count(),
            'activos' => ContactoAgencia::activo()->count(),
            'por_cargo' => [
                'gerentes' => ContactoAgencia::gerentes()->count(),
                'ventas' => ContactoAgencia::ventas()->count()
            ],
            'principales' => ContactoAgencia::activo()
                ->get()
                ->filter(function ($contacto) {
                    return $contacto->esPrincipal();
                })
                ->count(),
            'con_whatsapp' => ContactoAgencia::activo()
                ->get()
                ->filter(function ($contacto) {
                    return $contacto->tieneTelefonoValido();
                })
                ->count()
        ];

        return response()->json($stats);
    }
}
