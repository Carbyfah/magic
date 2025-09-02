// src/resources/js/components/operacion/reservaciones/GestionReservas.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { reservasConfig } from './reservasConfig';

const { createElement: e, useState, useEffect } = React;

function GestionReservas() {
    // Estados principales
    const [reservas, setReservas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [estados, setEstados] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [rutasActivadas, setRutasActivadas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Estados de modales
    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [modalDetalles, setModalDetalles] = useState(false);
    const [modalWhatsApp, setModalWhatsApp] = useState(false);
    const [modalMasivo, setModalMasivo] = useState(false);

    // Estados de datos específicos
    const [itemEditando, setItemEditando] = useState(null);
    const [itemConfirmacion, setItemConfirmacion] = useState(null);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);
    const [itemDetalles, setItemDetalles] = useState(null);
    const [itemWhatsApp, setItemWhatsApp] = useState(null);
    const [tipoMensajeWhatsApp, setTipoMensajeWhatsApp] = useState('confirmacion');
    const [accionMasiva, setAccionMasiva] = useState(null);
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');

    // Estados del formulario
    const [formulario, setFormulario] = useState({});
    const [errores, setErrores] = useState({});

    // NUEVO: Estados para notificaciones inteligentes
    const [notificacionesReservas, setNotificacionesReservas] = useState({});
    const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);

    // INTEGRAR EL NUEVO SISTEMA REUTILIZABLE
    const currentConfig = reservasConfig.reservas;
    const currentRawData = reservas;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
        validarEstados(); // NUEVO: Validar estados al cargar
    }, []);

    // NUEVO: Cargar notificaciones automáticamente después de cargar reservas
    useEffect(() => {
        if (reservas.length > 0) {
            cargarNotificacionesInteligentes();
        }
    }, [reservas]);

    // NUEVO: SISTEMA DE VALIDACIÓN DE ESTADOS - IGUAL QUE VEHÍCULOS Y RUTAS
    const validarEstados = async () => {
        try {
            const validacion = await currentConfig.validateStates();
            if (!validacion.valido) {
                // Mostrar notificación warning con mensaje específico
                Notifications.warning(
                    `${validacion.mensaje} - El sistema necesita estos estados para funcionar correctamente`,
                    'Estados Faltantes'
                );

                console.warn('Validación de estados falló:', validacion);

                // Opcional: Mostrar botón para crear estados automáticamente
                setTimeout(() => {
                    Notifications.info(
                        'Puede crear los estados faltantes desde el módulo de Estados del Sistema',
                        'Sugerencia'
                    );
                }, 3000);
            } else {
                console.log('Validación de estados exitosa:', validacion.mensaje);
            }
        } catch (error) {
            console.error('Error validando estados:', error);
            Notifications.error('Error al validar estados del sistema');
        }
    };

    // NUEVO: Función para cargar notificaciones inteligentes
    const cargarNotificacionesInteligentes = async () => {
        try {
            setLoadingNotificaciones(true);
            const notificaciones = {};

            // Cargar notificaciones para cada reserva activa
            const reservasActivas = reservas.filter(reserva =>
                reserva.activo && reserva.estado &&
                !currentConfig.stateDetection.cancelada(reserva.estado)
            );

            const promesasNotificaciones = reservasActivas.map(async (reserva) => {
                try {
                    const response = await fetch(`/api/magic/reservas/${reserva.id}/notificaciones`);
                    if (response.ok) {
                        const data = await response.json();
                        return { id: reserva.id, notificaciones: data.notificaciones || [] };
                    }
                } catch (error) {
                    console.warn(`Error cargando notificaciones para reserva ${reserva.id}:`, error);
                }
                return { id: reserva.id, notificaciones: [] };
            });

            const resultados = await Promise.all(promesasNotificaciones);

            resultados.forEach(({ id, notificaciones: notifs }) => {
                if (notifs.length > 0) {
                    notificaciones[id] = notifs;
                }
            });

            setNotificacionesReservas(notificaciones);
        } catch (error) {
            console.warn('Error general cargando notificaciones:', error);
        } finally {
            setLoadingNotificaciones(false);
        }
    };

    // NUEVO: Renderizar notificaciones de una reserva
    const renderizarNotificaciones = (reserva) => {
        const notificaciones = notificacionesReservas[reserva.id] || [];

        if (notificaciones.length === 0) return null;

        return e('div', {
            style: {
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #f59e0b'
            }
        }, [
            e('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                }
            }, [
                Icons.alertTriangle('#f59e0b'),
                e('strong', {
                    style: { fontSize: '0.875rem', color: '#92400e' }
                }, 'Notificaciones del sistema:')
            ]),
            e('div', {
                style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
            }, notificaciones.map((notif, idx) =>
                e('div', {
                    key: idx,
                    style: {
                        fontSize: '0.75rem',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    e('span', {
                        style: {
                            width: '4px',
                            height: '4px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%'
                        }
                    }),
                    notif.mensaje || notif
                ])
            ))
        ]);
    };

    // NUEVO: Función para obtener el color del estado según la lógica de negocio
    const obtenerColorEstado = (reserva) => {
        if (!reserva.estado || !reserva.estado.nombre) return 'gris';

        const estadoNombre = reserva.estado.nombre.toLowerCase();

        if (estadoNombre.includes('pendiente')) return 'naranja';
        if (estadoNombre.includes('confirm')) return 'verde';
        if (estadoNombre.includes('cancel')) return 'rojo';

        return 'gris';
    };

    // NUEVO: Función para obtener texto del estado
    const obtenerTextoEstado = (reserva) => {
        if (!reserva.estado || !reserva.estado.nombre) return 'Sin estado';
        return reserva.estado.nombre;
    };

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [reservasRes, usuariosRes, estadosRes, agenciasRes, rutasActivadasRes] = await Promise.all([
                fetch('/api/magic/reservas', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }),
                fetch('/api/magic/usuarios', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }),
                fetch('/api/magic/estados/contexto/reserva', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }),
                fetch('/api/magic/agencias', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }),
                fetch('/api/magic/rutas-activadas', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
            ]);

            if (reservasRes.ok) {
                const reservasData = await reservasRes.json();
                setReservas(reservasData.data || reservasData);
                console.log('Reservas cargadas:', (reservasData.data || reservasData).length, 'items');
            } else {
                console.error('Error al cargar reservas:', reservasRes.status);
                Notifications.error(`Error al cargar reservas: ${reservasRes.status}`);
            }

            if (usuariosRes.ok) {
                const usuariosData = await usuariosRes.json();
                setUsuarios(usuariosData.data || usuariosData);
                console.log('Usuarios cargados:', (usuariosData.data || usuariosData).length, 'items');
            } else {
                console.error('Error al cargar usuarios:', usuariosRes.status);
                Notifications.error(`Error al cargar usuarios: ${usuariosRes.status}`);
            }

            if (estadosRes.ok) {
                const estadosData = await estadosRes.json();
                setEstados(estadosData.data || estadosData);
                console.log('Estados contextuales cargados:', (estadosData.data || estadosData).length, 'items');
            } else {
                console.error('Error al cargar estados:', estadosRes.status);
                Notifications.error(`Error al cargar estados: ${estadosRes.status}`);
            }

            if (agenciasRes.ok) {
                const agenciasData = await agenciasRes.json();
                setAgencias(agenciasData.data || agenciasData);
                console.log('Agencias cargadas:', (agenciasData.data || agenciasData).length, 'items');
            } else {
                console.error('Error al cargar agencias:', agenciasRes.status);
                Notifications.error(`Error al cargar agencias: ${agenciasRes.status}`);
            }

            if (rutasActivadasRes.ok) {
                const rutasActivadasData = await rutasActivadasRes.json();
                setRutasActivadas(rutasActivadasData.data || rutasActivadasData);
                console.log('Rutas activadas cargadas:', (rutasActivadasData.data || rutasActivadasData).length, 'items');
            } else {
                console.error('Error al cargar rutas activadas:', rutasActivadasRes.status);
                Notifications.error(`Error al cargar rutas activadas: ${rutasActivadasRes.status}`);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Obtener estado por tipo usando la configuración
    const obtenerEstadoPorTipo = (tipo) => {
        return estados.find(estado => {
            const detector = currentConfig.stateDetection[tipo];
            return detector && detector(estado);
        });
    };

    // NUEVO: Función para validar cambio de estado con notificaciones
    const validarCambioEstadoReserva = async (reserva, accion) => {
        try {
            setLoadingAction(true);

            // Validaciones específicas según la acción
            let validacion = { valido: true };

            if (accion === 'confirmar' && !currentConfig.businessLogic.canConfirm(reserva)) {
                validacion = {
                    valido: false,
                    mensaje: 'Solo las reservas pendientes pueden confirmarse'
                };
            } else if (accion === 'cancelar' && !currentConfig.businessLogic.canCancel(reserva)) {
                validacion = {
                    valido: false,
                    mensaje: 'Esta reserva no puede cancelarse en su estado actual'
                };
            } else if (accion === 'facturar' && !currentConfig.businessLogic.canGenerateInvoice(reserva)) {
                validacion = {
                    valido: false,
                    mensaje: 'Solo las reservas confirmadas pueden facturarse'
                };
            }


            if (!validacion.valido) {
                Notifications.warning(validacion.mensaje);
                setLoadingAction(false);
                return false;
            }

            return true;

        } catch (error) {
            console.error('Error validando cambio de estado:', error);
            Notifications.error('Error de validación');
            setLoadingAction(false);
            return false;
        }
    };

    // Generar campos de formulario
    const generarCamposFormulario = () => {
        const campos = [];

        if (itemEditando && itemEditando.codigo) {
            campos.push({
                nombre: 'reserva_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código de la reserva',
                soloLectura: true,
                ancho: 'completo',
                label: 'Código de Reserva'
            });
        }

        // DATOS DEL CLIENTE
        campos.push({
            nombre: 'reserva_nombres_cliente',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Nombres del cliente',
            soloLectura: false,
            ancho: 'medio',
            label: 'Nombres'
        });

        campos.push({
            nombre: 'reserva_apellidos_cliente',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Apellidos del cliente',
            soloLectura: false,
            ancho: 'medio',
            label: 'Apellidos'
        });

        campos.push({
            nombre: 'reserva_telefono_cliente',
            tipo: 'tel',
            requerido: true,
            opciones: [],
            placeholder: 'Teléfono (8 dígitos)',
            soloLectura: false,
            ancho: 'medio',
            label: 'Teléfono'
        });

        campos.push({
            nombre: 'reserva_email_cliente',
            tipo: 'email',
            requerido: false,
            opciones: [],
            placeholder: 'Email del cliente (opcional)',
            soloLectura: false,
            ancho: 'medio',
            label: 'Email'
        });

        campos.push({
            nombre: 'reserva_cliente_nit',
            tipo: 'text',
            requerido: false,
            opciones: [],
            placeholder: 'NIT del cliente (opcional)',
            soloLectura: false,
            ancho: 'completo',
            label: 'NIT'
        });

        // DETALLES DEL VIAJE
        campos.push({
            nombre: 'reserva_cantidad_adultos',
            tipo: 'number',
            requerido: true,
            opciones: [],
            placeholder: 'Cantidad de adultos',
            soloLectura: false,
            ancho: 'medio',
            label: 'Adultos',
            min: 1
        });

        campos.push({
            nombre: 'reserva_cantidad_ninos',
            tipo: 'number',
            requerido: false,
            opciones: [],
            placeholder: 'Cantidad de niños',
            soloLectura: false,
            ancho: 'medio',
            label: 'Niños',
            min: 0
        });

        campos.push({
            nombre: 'reserva_direccion_abordaje',
            tipo: 'textarea',
            requerido: false,
            opciones: [],
            placeholder: 'Hotel, dirección o punto de recogida',
            soloLectura: false,
            ancho: 'completo',
            label: 'Punto de Abordaje'
        });

        campos.push({
            nombre: 'reserva_notas',
            tipo: 'textarea',
            requerido: false,
            opciones: [],
            placeholder: 'Observaciones adicionales',
            soloLectura: false,
            ancho: 'completo',
            label: 'Notas'
        });

        // ASIGNACIONES
        campos.push({
            nombre: 'ruta_activada_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: rutasActivadas
                .filter(ruta => ruta.activo === true)
                .map(ruta => ({
                    value: ruta.id,
                    label: `${ruta.ruta_completa} - ${ruta.fecha} ${ruta.hora}`
                })),
            placeholder: 'Seleccione la ruta programada',
            soloLectura: false,
            ancho: 'completo',
            label: 'Ruta Programada'
        });

        campos.push({
            nombre: 'agencia_id',
            tipo: 'select',
            searchable: true,
            requerido: false,
            opciones: [
                { value: '', label: 'Venta Directa' },
                ...agencias
                    .filter(agencia => agencia.agencia_situacion === true)
                    .map(agencia => ({
                        value: agencia.agencia_id,
                        label: agencia.agencia_razon_social
                    }))
            ],
            placeholder: 'Opcional - Dejar vacío para venta directa',
            soloLectura: false,
            ancho: 'medio',
            label: 'Agencia'
        });

        campos.push({
            nombre: 'usuario_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: usuarios
                .filter(usuario => usuario.activo === true)
                .map(usuario => ({
                    value: usuario.id,
                    label: `${usuario.nombre_completo} (${usuario.rol?.nombre || 'Sin rol'})`
                })),
            placeholder: 'Seleccione el vendedor',
            soloLectura: false,
            ancho: 'medio',
            label: 'Vendedor'
        });

        campos.push({
            nombre: 'estado_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: estados.map(estado => ({
                value: estado.estado_id,
                label: estado.estado_estado
            })),
            placeholder: 'Seleccione el estado',
            soloLectura: false,
            ancho: 'completo',
            label: 'Estado'
        });

        return campos;
    };

    // Renderizar item de lista - ACTUALIZADO con notificaciones y estados
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'nombre_completo_cliente', label: 'Cliente', tipo: 'texto' },
            { campo: 'telefono_formateado', label: 'Teléfono', tipo: 'texto' },
            { campo: 'total_pasajeros', label: 'Pasajeros', tipo: 'numero' },
            { campo: 'viaje', label: 'Viaje', tipo: 'objeto' },
            { campo: 'monto', label: 'Monto', tipo: 'moneda' },
            { campo: 'estado', label: 'Estado', tipo: 'estado' } // NUEVO: tipo estado
        ];

        return e('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
        }, [
            // Información básica
            e('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                }
            }, camposImportantes.map(({ campo, label, tipo }) => {
                let valor = item[campo];
                let contenidoFormateado;

                if (tipo === 'moneda' && valor) {
                    contenidoFormateado = `Q. ${parseFloat(valor).toFixed(2)}`;
                } else if (tipo === 'numero') {
                    contenidoFormateado = String(valor || '0');
                } else if (tipo === 'estado' && valor) {
                    // NUEVO: Renderizado especial para estados
                    const colorEstado = obtenerColorEstado(item);
                    const textoEstado = obtenerTextoEstado(item);

                    contenidoFormateado = BotonesUniversal.badge({
                        texto: textoEstado,
                        color: colorEstado
                    });
                } else if (tipo === 'objeto' && valor) {
                    if (campo === 'viaje') {
                        contenidoFormateado = `${valor.ruta_completa} - ${valor.fecha}`;
                    } else {
                        contenidoFormateado = valor.nombre || String(valor);
                    }
                } else if (tipo !== 'estado') {
                    contenidoFormateado = String(valor || 'N/A');
                }

                return e('div', { key: campo }, [
                    e('strong', { key: `label-${campo}` }, `${label}: `),
                    tipo === 'estado' ? contenidoFormateado : contenidoFormateado
                ]);
            })),

            // NUEVO: Notificaciones inteligentes
            renderizarNotificaciones(item)
        ]);
    };

    // Funciones auxiliares
    const obtenerNombreItem = (item) => {
        return item.nombre_completo_cliente || `Reserva ${item.codigo}` || `Reserva #${item.id}`;
    };

    const obtenerIdItem = (item) => {
        return item.id;
    };

    const obtenerEstadoItem = (item) => {
        const status = item.activo;
        return status === true || status === 1 || status === '1';
    };

    // Funciones de gestión de modales
    const abrirModalFormulario = (item = null) => {
        setItemEditando(item);
        if (item) {
            setFormulario({
                reserva_codigo: item.codigo,
                reserva_nombres_cliente: item.nombres_cliente,
                reserva_apellidos_cliente: item.apellidos_cliente,
                reserva_cliente_nit: item.nit_cliente,
                reserva_telefono_cliente: item.telefono_cliente,
                reserva_email_cliente: item.email_cliente,
                reserva_cantidad_adultos: item.cantidad_adultos,
                reserva_cantidad_ninos: item.cantidad_ninos,
                reserva_direccion_abordaje: item.direccion_abordaje,
                reserva_notas: item.notas,
                usuario_id: item.usuario_id,
                estado_id: item.estado_id,
                agencia_id: item.agencia_id || '',
                ruta_activada_id: item.ruta_activada_id
            });
        } else {
            // Buscar estado pendiente dinámicamente
            const estadoPendiente = obtenerEstadoPorTipo('pendiente');

            setFormulario({
                reserva_cantidad_adultos: 1,
                reserva_cantidad_ninos: 0,
                estado_id: estadoPendiente?.estado_id || estados[0]?.estado_id || 1,
                agencia_id: ''
            });
        }
        setErrores({});
        setModalFormulario(true);
    };

    // ACTUALIZADO - Manejo de cambios con validaciones inteligentes
    const manejarCambioFormulario = (campo, valor) => {
        console.log('Campo cambiado:', campo, 'Valor:', valor);
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }

        // NUEVO: Validaciones inteligentes para cambios de estado
        if (campo === 'estado_id' && valor && itemEditando) {
            const estadoSeleccionado = estados.find(e => e.estado_id == valor);
            if (estadoSeleccionado && itemEditando.estado) {
                const puedeTransicionar = currentConfig.stateFlow.canTransitionTo(
                    itemEditando.estado.estado_estado,
                    estadoSeleccionado.estado_estado
                );
                if (!puedeTransicionar) {
                    Notifications.warning('Esta transición de estado no está permitida');
                }
            }
        }

        // Solo mostrar información, el backend calcula automáticamente
        if (campo === 'agencia_id') {
            if (valor) {
                console.log('Venta por agencia - descuento automático aplicado por triggers de BD');
                Notifications.info('Se aplicará descuento por agencia automáticamente');
            } else {
                console.log('Venta directa - precio normal aplicado por triggers de BD');
            }
        }
    };

    // Validación del formulario - ACTUALIZADA con validaciones inteligentes
    const validarFormulario = async () => {
        console.log('=== VALIDANDO FORMULARIO ===');
        console.log('Buscando reserva_cantidad_adultos:', formulario.reserva_cantidad_adultos);
        console.log('Buscando cantidad_adultos:', formulario.cantidad_adultos);
        console.log('Formulario completo:', Object.keys(formulario));

        const nuevosErrores = await currentConfig.validateForm(formulario);
        console.log('Errores de validación:', nuevosErrores);

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar item - CON REFRESCO DE NOTIFICACIONES
    const guardarItem = async () => {
        console.log('=== INICIANDO GUARDAR ===');
        console.log('Formulario actual:', formulario);

        const formularioValido = await validarFormulario();
        console.log('Formulario válido:', formularioValido);
        console.log('Errores encontrados:', errores);

        if (!formularioValido) {
            console.log('GUARDAR CANCELADO - Formulario inválido');
            return;
        }

        console.log('Continuando con el guardado...');

        try {
            setLoadingAction(true);

            const datosParaEnviar = currentConfig.processBeforeSave({ ...formulario });

            if (!itemEditando) {
                datosParaEnviar.reserva_situacion = 1;
            } else {
                if (datosParaEnviar.reserva_situacion === undefined) {
                    datosParaEnviar.reserva_situacion = itemEditando.reserva_situacion || 1;
                }
            }

            // Convertir agencia_id vacío a null
            if (datosParaEnviar.agencia_id === '') {
                datosParaEnviar.agencia_id = null;
            }

            console.log('Datos a enviar (monto se calculará automáticamente por triggers):', datosParaEnviar);

            const url = itemEditando
                ? `/api/magic/reservas/${obtenerIdItem(itemEditando)}`
                : `/api/magic/reservas`;

            const method = itemEditando ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(datosParaEnviar)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta del servidor:', data);

                Notifications.success(
                    `Reserva ${itemEditando ? 'actualizada' : 'creada'} exitosamente. Monto: Q.${data.monto || '0.00'}`
                );
                setModalFormulario(false);
                cargarDatos(); // Esto recargará las notificaciones automáticamente
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrores(errorData.errors);
                    Notifications.error('Por favor corrige los errores en el formulario');
                } else {
                    Notifications.error(`Error al guardar: ${errorData.message || response.status}`);
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    const abrirModalConfirmacion = (item, accion) => {
        setItemConfirmacion(item);
        setAccionConfirmacion(accion);
        setModalConfirmacion(true);
    };

    // Modal para acciones masivas
    const abrirModalMasivo = () => {
        const rutas = obtenerRutasUnicas();
        console.log('Rutas disponibles:', rutas);

        if (rutas.length === 0) {
            Notifications.warning('No hay rutas con reservas para acciones masivas');
            return;
        }

        setAccionMasiva('confirmar_todas');
        setRutaSeleccionada(rutas[0]?.id?.toString());
        setMotivoCancelacion('');
        setModalMasivo(true);
    };

    // Ejecutar acción masiva - ACTUALIZADA para nuevas rutas
    const ejecutarAccionMasiva = async () => {
        if (!rutaSeleccionada || !accionMasiva) return;

        try {
            setLoadingAction(true);

            let url;
            let body = null;

            switch (accionMasiva) {
                case 'confirmar_todas':
                    url = `/api/magic/reservas/ruta/${rutaSeleccionada}/confirm-all`;
                    break;

                case 'cancelar_todas':
                    if (!motivoCancelacion.trim()) {
                        Notifications.error('El motivo de cancelación es requerido');
                        return;
                    }
                    url = `/api/magic/reservas/ruta/${rutaSeleccionada}/cancel-all`;
                    body = JSON.stringify({ motivo: motivoCancelacion.trim() });
                    break;

                default:
                    return;
            }

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: body
            });

            if (response.ok) {
                const data = await response.json();

                Notifications.success(data.message);

                if (data.errores && data.errores.length > 0) {
                    console.log('Reservas que no pudieron procesarse:', data.errores);
                    Notifications.warning(`${data.errores.length} reservas no pudieron procesarse`);
                }

                setModalMasivo(false);
                setAccionMasiva(null);
                setRutaSeleccionada(null);
                setMotivoCancelacion('');
                cargarDatos();
            } else {
                const errorData = await response.json();
                Notifications.error(`Error en acción masiva: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    // Ejecutar acción individual - CON VALIDACIONES INTELIGENTES
    const ejecutarAccion = async () => {
        if (!itemConfirmacion) return;

        try {
            setLoadingAction(true);
            const itemId = obtenerIdItem(itemConfirmacion);

            let response;
            let url;

            switch (accionConfirmacion) {
                case 'confirmar':
                    url = `/api/magic/reservas/${itemId}/confirm`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'cancelar':
                    url = `/api/magic/reservas/${itemId}/cancel`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        },
                        body: JSON.stringify({
                            motivo: 'Cancelación desde gestión'
                        })
                    });
                    break;

                case 'factura_pdf':
                    // Generar PDF directamente sin cambiar estado
                    await descargarFacturaPDF(itemConfirmacion);
                    setModalConfirmacion(false);
                    return; // No hacer fetch, ya se hizo en descargarFacturaPDF

                case 'facturar':
                    url = `/api/magic/reservas/${itemId}/facturar`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'activar':
                    url = `/api/magic/reservas/${itemId}/activate`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'desactivar':
                    url = `/api/magic/reservas/${itemId}/deactivate`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'duplicar':
                    const estadoPendiente = obtenerEstadoPorTipo('pendiente');
                    const itemDuplicado = {
                        reserva_nombres_cliente: itemConfirmacion.nombres_cliente,
                        reserva_apellidos_cliente: itemConfirmacion.apellidos_cliente,
                        reserva_telefono_cliente: itemConfirmacion.telefono_cliente,
                        reserva_email_cliente: itemConfirmacion.email_cliente,
                        reserva_cliente_nit: itemConfirmacion.nit_cliente,
                        reserva_cantidad_adultos: itemConfirmacion.cantidad_adultos,
                        reserva_cantidad_ninos: itemConfirmacion.cantidad_ninos,
                        reserva_direccion_abordaje: itemConfirmacion.direccion_abordaje,
                        reserva_notas: itemConfirmacion.notas ? `Duplicado: ${itemConfirmacion.notas}` : 'Reserva duplicada',
                        usuario_id: itemConfirmacion.usuario_id,
                        estado_id: estadoPendiente?.estado_id || estados[0]?.estado_id,
                        agencia_id: itemConfirmacion.agencia_id,
                        ruta_activada_id: itemConfirmacion.ruta_activada_id,
                        reserva_situacion: 1
                    };

                    url = `/api/magic/reservas`;
                    response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        },
                        body: JSON.stringify(itemDuplicado)
                    });
                    break;

                default:
                    return;
            }

            if (response && response.ok) {
                const mensajes = {
                    confirmar: 'Reserva confirmada exitosamente',
                    cancelar: 'Reserva cancelada exitosamente',
                    duplicar: 'Reserva duplicada exitosamente',
                    facturar: 'Factura generada exitosamente',
                    activar: 'Reserva activada exitosamente',        // NUEVO
                    desactivar: 'Reserva desactivada exitosamente'   // NUEVO
                };

                Notifications.success(mensajes[accionConfirmacion]);
                setModalConfirmacion(false);
                cargarDatos();
            } else {
                const errorData = await response.json();
                Notifications.error(`Error al ${accionConfirmacion}: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    const abrirModalDetalles = (item) => {
        setItemDetalles(item);
        setModalDetalles(true);
    };

    // FUNCIÓN PARA WHATSAPP
    const abrirModalWhatsApp = (item, tipo = 'confirmacion') => {
        setItemWhatsApp(item);
        setTipoMensajeWhatsApp(tipo);
        setModalWhatsApp(true);
    };

    const generarMensajeWhatsApp = async () => {
        if (!itemWhatsApp) return;

        try {
            setLoadingAction(true);
            const itemId = obtenerIdItem(itemWhatsApp);

            const response = await fetch(`/api/magic/reservas/${itemId}/whatsapp?tipo=${tipoMensajeWhatsApp}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(data.mensaje);
                    Notifications.success('Mensaje copiado al portapapeles! Listo para pegar en WhatsApp');
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = data.mensaje;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    Notifications.success('Mensaje copiado! Listo para pegar en WhatsApp');
                }

                setModalWhatsApp(false);
            } else {
                const errorData = await response.json();
                Notifications.error(`Error al generar mensaje: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    // FUNCIÓN HELPER PARA CREAR BOTÓN PEQUEÑO
    const botonPequeño = (texto, color, onClick) => {
        const colores = {
            verde: '#16a34a',
            azul: '#3b82f6',
            morado: '#8b5cf6',
            rojo: '#dc2626'
        };

        return e('button', {
            onClick,
            style: {
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'white',
                backgroundColor: colores[color] || colores.azul,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }
        }, texto);
    };

    // Función para descargar voucher PDF
    const descargarVoucherPDF = async (reserva) => {
        try {
            setLoadingAction(true);
            Notifications.info('Generando voucher PDF...');

            const itemId = obtenerIdItem(reserva);
            const response = await fetch(`/api/magic/reservas/${itemId}/voucher-pdf`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `voucher-${reserva.codigo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                Notifications.success('Voucher descargado exitosamente');
            } else {
                Notifications.error('Error al generar voucher');
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    // Función para descargar factura PDF
    const descargarFacturaPDF = async (reserva) => {
        try {
            setLoadingAction(true);
            Notifications.info('Generando factura PDF...');

            const itemId = obtenerIdItem(reserva);
            const response = await fetch(`/api/magic/reservas/${itemId}/factura-pdf`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `factura-${reserva.codigo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                Notifications.success('Factura descargada exitosamente');
            } else {
                Notifications.error('Error al generar factura');
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    // Obtener rutas únicas con fecha y hora
    const obtenerRutasUnicas = () => {
        const rutasMap = new Map();

        reservas.forEach(reserva => {
            if (reserva.ruta_activada_id && reserva.viaje) {
                const key = reserva.ruta_activada_id;

                if (!rutasMap.has(key)) {
                    rutasMap.set(key, {
                        id: reserva.ruta_activada_id,
                        nombre: reserva.viaje.ruta_completa,
                        fecha: reserva.viaje.fecha,
                        hora: reserva.viaje.hora || '00:00',
                        reservas_count: 1,
                        reservas: [reserva]
                    });
                } else {
                    const ruta = rutasMap.get(key);
                    ruta.reservas_count++;
                    ruta.reservas.push(reserva);
                }
            }
        });

        return Array.from(rutasMap.values()).sort((a, b) => {
            const fechaA = new Date(`${a.fecha} ${a.hora}`);
            const fechaB = new Date(`${b.fecha} ${b.hora}`);
            return fechaA - fechaB;
        });
    };

    // USAR DATOS DEL NUEVO SISTEMA REUTILIZABLE
    const datosActuales = tableData.data;
    const totalDatos = currentRawData.length;

    return e('div', {
        style: { padding: '1.5rem', maxWidth: '100%', minHeight: '100vh' }
    }, [
        // Header con indicador de notificaciones
        e('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }
        }, [
            e('div', { key: 'title-section' }, [
                e('div', {
                    style: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }
                }, [
                    e('h1', {
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0'
                        }
                    }, 'Gestión de Reservas'),

                    // NUEVO: Indicador de notificaciones
                    Object.keys(notificacionesReservas).length > 0 && e('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            border: '1px solid #f59e0b'
                        }
                    }, [
                        Icons.alertTriangle('#f59e0b'),
                        e('span', {
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#92400e'
                            }
                        }, `${Object.keys(notificacionesReservas).length} reservas con notificaciones`)
                    ])
                ]),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} reservas encontradas`)
            ]),
            e('div', {
                key: 'actions-section',
                style: { display: 'flex', gap: '1rem' }
            }, [
                BotonesUniversal.nuevo({
                    onClick: () => abrirModalFormulario(),
                    texto: 'Nueva Reserva',
                    loading: loading
                }),
                e('button', {
                    onClick: abrirModalMasivo,
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }
                }, 'Acciones Masivas')
            ])
        ]),

        // USAR EL NUEVO COMPONENTE DE CONTROLES
        e(TableControls, {
            key: 'table-controls',
            config: currentConfig,
            filters: tableData.filters,
            statistics: tableData.statistics,
            actions: tableData.actions,
            loading: loading,
            onRefresh: cargarDatos,
            showStatistics: true
        }),

        // Lista principal
        e('div', {
            key: 'lista-principal',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }
        }, [
            loading ? e('div', {
                key: 'loading',
                style: { padding: '3rem', textAlign: 'center' }
            }, 'Cargando...') :
                datosActuales.length > 0 ?
                    datosActuales.map((item, index) => {
                        const itemId = obtenerIdItem(item) || index;
                        const esActivo = obtenerEstadoItem(item);
                        const tieneNotificaciones = notificacionesReservas[item.id] && notificacionesReservas[item.id].length > 0;

                        return e('div', {
                            key: `item-${itemId}`,
                            style: {
                                padding: '1.5rem',
                                borderBottom: index < datosActuales.length - 1 ?
                                    '1px solid #f3f4f6' : 'none',
                                // NUEVO: Resaltar reservas con notificaciones
                                backgroundColor: tieneNotificaciones ? '#fffbeb' : 'white'
                            }
                        }, [
                            e('div', {
                                key: `item-content-${itemId}`,
                                style: {
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '1rem'
                                }
                            }, [
                                e('div', {
                                    key: `item-info-${itemId}`,
                                    style: { flex: 1 }
                                }, [
                                    e('div', {
                                        key: `item-header-${itemId}`,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '0.75rem'
                                        }
                                    }, [
                                        e('h3', {
                                            key: `item-title-${itemId}`,
                                            style: {
                                                fontSize: '1.125rem',
                                                fontWeight: '600',
                                                margin: '0',
                                                color: '#111827'
                                            }
                                        }, obtenerNombreItem(item)),

                                        item.codigo && BotonesUniversal.badge({
                                            texto: item.codigo,
                                            color: 'gris',
                                            key: `badge-codigo-${itemId}`
                                        }),

                                        BotonesUniversal.badge({
                                            texto: esActivo ? 'Activa' : 'Inactiva',
                                            color: esActivo ? 'verde' : 'rojo',
                                            key: `badge-estado-${itemId}`
                                        }),

                                        item.tipo_venta && BotonesUniversal.badge({
                                            texto: item.tipo_venta,
                                            color: item.tipo_venta === 'DIRECTA' ? 'azul' : 'morado',
                                            key: `badge-tipo-${itemId}`
                                        }),

                                        // NUEVO: Badge de notificación
                                        tieneNotificaciones && BotonesUniversal.badge({
                                            texto: `${notificacionesReservas[item.id].length} notificaciones`,
                                            color: 'naranja',
                                            key: `badge-notif-${itemId}`
                                        })
                                    ]),

                                    e('div', {
                                        key: `item-fields-${itemId}`
                                    }, renderizarItem(item))
                                ]),

                                e('div', {
                                    key: `item-actions-${itemId}`,
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }
                                }, [
                                    // Acciones básicas
                                    BotonesUniversal.grupoAcciones({
                                        item: item,
                                        onVer: () => abrirModalDetalles(item),
                                        onEditar: () => abrirModalFormulario(item),
                                        onDuplicar: () => abrirModalConfirmacion(item, 'duplicar'),
                                        onActivar: () => abrirModalConfirmacion(
                                            item,
                                            esActivo ? 'desactivar' : 'activar'
                                        ),
                                        activo: esActivo,
                                        key: `actions-${itemId}`
                                    }),

                                    // Acciones específicas de reserva - ACTUALIZADAS CON VALIDACIONES
                                    e('div', {
                                        key: `specific-actions-${itemId}`,
                                        style: {
                                            display: 'flex',
                                            gap: '0.5rem',
                                            marginTop: '0.5rem',
                                            flexWrap: 'wrap'
                                        }
                                    }, [
                                        // WhatsApp
                                        botonPequeño('WhatsApp', 'verde', () => abrirModalWhatsApp(item)),
                                        botonPequeño('Voucher PDF', 'morado', () => descargarVoucherPDF(item)),

                                        // Estados específicos con validaciones inteligentes
                                        item.puede_ser_confirmada &&
                                        botonPequeño('Confirmar', 'azul', () => abrirModalConfirmacion(item, 'confirmar')),

                                        item.puede_generar_factura &&
                                        botonPequeño('Factura PDF', 'morado', () => descargarFacturaPDF(item)),

                                        item.puede_ser_cancelada &&
                                        botonPequeño('Cancelar', 'rojo', () => abrirModalConfirmacion(item, 'cancelar'))
                                    ])
                                ])
                            ])
                        ]);
                    }) : e('div', {
                        key: 'no-items',
                        style: {
                            padding: '3rem',
                            textAlign: 'center',
                            color: '#6b7280'
                        }
                    }, 'No hay reservas que coincidan con los filtros')
        ]),

        // COMPONENTE DE PAGINACIÓN
        e(TablePagination, {
            key: 'table-pagination',
            pagination: tableData.pagination,
            actions: tableData.actions,
            showInfo: true,
            compact: false
        }),

        // Modales
        ModalUniversal.formulario({
            abierto: modalFormulario,
            cerrar: () => setModalFormulario(false),
            guardar: guardarItem,
            formulario: formulario,
            cambiarCampo: manejarCambioFormulario,
            errores: errores,
            loading: loadingAction,
            tipoItem: 'reserva',
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'reserva',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'reserva',
            camposExcluir: currentConfig.camposDetalles?.excluir || [
                'created_at', 'updated_at', 'deleted_at', 'reserva_situacion',
                'total_pasajeros', 'monto', 'activo'
            ]
        }),

        ModalUniversal.accionesMasivas({
            abierto: modalMasivo,
            cerrar: () => {
                setModalMasivo(false);
                setAccionMasiva(null);
                setRutaSeleccionada(null);
                setMotivoCancelacion('');
            },
            ejecutar: ejecutarAccionMasiva,
            rutas: obtenerRutasUnicas(),
            accionSeleccionada: accionMasiva,
            setAccionSeleccionada: setAccionMasiva,
            rutaSeleccionada: rutaSeleccionada,
            setRutaSeleccionada: setRutaSeleccionada,
            motivoCancelacion: motivoCancelacion,
            setMotivoCancelacion: setMotivoCancelacion,
            loading: loadingAction,
            tipoItem: 'reservas'
        }),

        // Modal específico para WhatsApp
        modalWhatsApp && e('div', {
            key: 'modal-whatsapp',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            },
            onClick: () => setModalWhatsApp(false)
        }, [
            e('div', {
                key: 'modal-content',
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto'
                },
                onClick: (e) => e.stopPropagation()
            }, [
                e('h2', {
                    key: 'modal-title',
                    style: {
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        color: '#111827'
                    }
                }, 'Generar Mensaje WhatsApp'),

                e('div', {
                    key: 'tipo-selector',
                    style: { marginBottom: '1.5rem' }
                }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Tipo de mensaje:'),

                    e('select', {
                        value: tipoMensajeWhatsApp,
                        onChange: (e) => setTipoMensajeWhatsApp(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '1rem'
                        }
                    }, [
                        e('option', { key: 'confirmacion', value: 'confirmacion' }, 'Confirmación'),
                        e('option', { key: 'recordatorio', value: 'recordatorio' }, 'Recordatorio'),
                        e('option', { key: 'cancelacion', value: 'cancelacion' }, 'Cancelación')
                    ])
                ]),

                e('div', {
                    key: 'modal-actions',
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        key: 'cancel-whatsapp',
                        onClick: () => setModalWhatsApp(false),
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer'
                        }
                    }, 'Cancelar'),
                    e('button', {
                        key: 'generate-whatsapp',
                        onClick: generarMensajeWhatsApp,
                        disabled: loadingAction,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loadingAction ? '#9ca3af' : '#25d366',
                            color: 'white',
                            cursor: loadingAction ? 'not-allowed' : 'pointer',
                            opacity: loadingAction ? 0.7 : 1
                        }
                    }, loadingAction ? 'Generando...' : 'Generar y Copiar')
                ])
            ])
        ])
    ]);
}

export default GestionReservas;
