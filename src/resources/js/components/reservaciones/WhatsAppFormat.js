// src/resources/js/components/reservaciones/WhatsAppFormat.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function WhatsAppFormat({ show, reserva, onClose }) {
    const [mensajeWhatsApp, setMensajeWhatsApp] = useState('');
    const [mensajeSimple, setMensajeSimple] = useState('');
    const [loading, setLoading] = useState(false);
    const [tipoMensaje, setTipoMensaje] = useState('confirmacion'); // 'confirmacion', 'recordatorio', 'modificacion'
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (show && reserva) {
            generarMensaje();
        }
    }, [show, reserva, tipoMensaje]);

    const generarMensaje = async () => {
        if (!reserva?.id) return;

        setLoading(true);
        try {
            const endpoint = tipoMensaje === 'confirmacion'
                ? `/api/v1/reservas/${reserva.id}/formato-whatsapp`
                : `/api/v1/reservas/${reserva.id}/formato-whatsapp?tipo=${tipoMensaje}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.mensaje) {
                setMensajeWhatsApp(data.mensaje);
                setMensajeSimple(data.formato_plano || data.mensaje);
            } else {
                // Generar mensaje local si el backend no responde
                generarMensajeLocal();
            }
        } catch (error) {
            console.error('Error al obtener mensaje del backend:', error);
            generarMensajeLocal();
        } finally {
            setLoading(false);
        }
    };

    const generarMensajeLocal = () => {
        const fecha = new Date(reserva.fecha_viaje).toLocaleDateString('es-GT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const totalPax = reserva.pax_adultos + (reserva.pax_ninos || 0);

        const mensajes = {
            confirmacion: `🎫 *CONFIRMACIÓN DE RESERVA - MAGIC TRAVEL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *Reserva Confirmada*
📋 *Número:* ${reserva.numero_reserva}

👤 *DATOS DEL PASAJERO*
• *Nombre:* ${reserva.nombre_pasajero_principal}
• *Pasajeros:* ${reserva.pax_adultos} adultos${reserva.pax_ninos ? `, ${reserva.pax_ninos} niños` : ''}
• *Total PAX:* ${totalPax}
${reserva.telefono_contacto ? `• *Teléfono:* ${reserva.telefono_contacto}` : ''}

🚌 *INFORMACIÓN DEL SERVICIO*
• *Ruta:* ${reserva.ruta?.nombre_ruta || 'Por confirmar'}
• *Fecha:* ${fecha}
${reserva.hotel_pickup ? `• *Pickup:* ${reserva.hotel_pickup}` : ''}
${reserva.hora_pickup ? `• *Hora:* ${reserva.hora_pickup}` : ''}

💰 *INFORMACIÓN COMERCIAL*
• *Precio Total:* Q${parseFloat(reserva.precio_total || 0).toFixed(2)}
${reserva.responsable_pago ? `• *Responsable de Pago:* ${reserva.responsable_pago}` : ''}
${reserva.voucher ? `• *Voucher:* ${reserva.voucher}` : ''}

${reserva.notas_pickup ? `📝 *NOTAS ESPECIALES*\n${reserva.notas_pickup}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *MAGIC TRAVEL*
📞 WhatsApp: [NÚMERO DE CONTACTO]
📧 Email: [EMAIL DE CONTACTO]
🌐 Síguenos en redes sociales

¡Gracias por confiar en nosotros! 🚌✨`,

            recordatorio: `🔔 *RECORDATORIO DE VIAJE - MAGIC TRAVEL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎫 *Su viaje es mañana*
📋 *Reserva:* ${reserva.numero_reserva}

👤 *DATOS*
• *Pasajero:* ${reserva.nombre_pasajero_principal}
• *PAX:* ${totalPax}
${reserva.telefono_contacto ? `• *Teléfono:* ${reserva.telefono_contacto}` : ''}

🚌 *INFORMACIÓN DEL VIAJE*
• *Ruta:* ${reserva.ruta?.nombre_ruta || 'Por confirmar'}
• *Fecha:* ${fecha}
${reserva.hotel_pickup ? `• *Pickup:* ${reserva.hotel_pickup}` : ''}
${reserva.hora_pickup ? `• *Hora:* ${reserva.hora_pickup}` : ''}

⏰ *RECORDATORIOS IMPORTANTES*
• Estar listo 15 minutos antes de la hora
• Llevar documento de identidad
• Verificar el clima para vestimenta adecuada

¿Alguna duda? ¡Contáctanos!
🏢 *MAGIC TRAVEL*`,

            modificacion: `📝 *MODIFICACIÓN DE RESERVA - MAGIC TRAVEL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 *Reserva Modificada*
📋 *Número:* ${reserva.numero_reserva}

👤 *DATOS ACTUALIZADOS*
• *Nombre:* ${reserva.nombre_pasajero_principal}
• *Pasajeros:* ${reserva.pax_adultos} adultos${reserva.pax_ninos ? `, ${reserva.pax_ninos} niños` : ''}
• *Total PAX:* ${totalPax}

🚌 *NUEVA INFORMACIÓN DEL SERVICIO*
• *Ruta:* ${reserva.ruta?.nombre_ruta || 'Por confirmar'}
• *Fecha:* ${fecha}
${reserva.hotel_pickup ? `• *Pickup:* ${reserva.hotel_pickup}` : ''}

💰 *PRECIO ACTUALIZADO*
• *Total:* Q${parseFloat(reserva.precio_total || 0).toFixed(2)}

Por favor confirme que está de acuerdo con los cambios.
¡Gracias! 🏢 *MAGIC TRAVEL*`
        };

        const mensaje = mensajes[tipoMensaje] || mensajes.confirmacion;
        setMensajeWhatsApp(mensaje);
        setMensajeSimple(mensaje.replace(/[*_~`]/g, '').replace(/[📋🎫🚌👤💰📝🔔🔄⏰✅]/g, ''));
    };

    const handleCopyToClipboard = async (texto) => {
        try {
            await navigator.clipboard.writeText(texto);
            setCopied(true);
            Notifications.success('Mensaje copiado al portapapeles', 'Éxito');

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error('Error al copiar:', error);
            // Fallback para navegadores que no soportan clipboard
            const textArea = document.createElement('textarea');
            textArea.value = texto;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            Notifications.success('Mensaje copiado al portapapeles', 'Éxito');
        }
    };

    const abrirWhatsApp = (texto) => {
        // Encode el texto para URL
        const textoEncoded = encodeURIComponent(texto);

        // Detectar si es móvil o desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Para móvil, usar el protocolo whatsapp://
            window.open(`whatsapp://send?text=${textoEncoded}`, '_blank');
        } else {
            // Para desktop, usar WhatsApp Web
            window.open(`https://web.whatsapp.com/send?text=${textoEncoded}`, '_blank');
        }
    };

    if (!show) return null;

    return e('div', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        },
        onClick: onClose
    }, [
        e('div', {
            key: 'whatsapp-modal-content',
            onClick: (e) => e.stopPropagation(),
            style: {
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }
        }, [
            // Header
            e('div', {
                key: 'whatsapp-header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#25d366',
                    color: 'white',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                }
            }, [
                e('div', {
                    key: 'whatsapp-title-section',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }
                }, [
                    Icons.messageCircle('white'),
                    e('div', { key: 'titles' }, [
                        e('h2', {
                            key: 'main-title',
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                margin: '0'
                            }
                        }, 'Formato WhatsApp'),
                        e('p', {
                            key: 'subtitle',
                            style: {
                                fontSize: '0.875rem',
                                margin: '0.25rem 0 0 0',
                                opacity: 0.9
                            }
                        }, `Reserva: ${reserva?.numero_reserva}`)
                    ])
                ]),
                e('button', {
                    key: 'close-whatsapp',
                    onClick: onClose,
                    style: {
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                }, Icons.x('white'))
            ]),

            // Selector de tipo de mensaje
            e('div', {
                key: 'tipo-selector',
                style: {
                    padding: '1.5rem',
                    borderBottom: '1px solid #f3f4f6'
                }
            }, [
                e('label', {
                    key: 'tipo-label',
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, 'Tipo de Mensaje'),
                e('div', {
                    key: 'tipo-options',
                    style: {
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }
                }, [
                    {
                        id: 'confirmacion',
                        label: 'Confirmación',
                        icon: Icons.checkCircle,
                        color: '#10b981'
                    },
                    {
                        id: 'recordatorio',
                        label: 'Recordatorio',
                        icon: Icons.bell,
                        color: '#f59e0b'
                    },
                    {
                        id: 'modificacion',
                        label: 'Modificación',
                        icon: Icons.edit,
                        color: '#3b82f6'
                    }
                ].map(tipo =>
                    e('button', {
                        key: tipo.id,
                        onClick: () => setTipoMensaje(tipo.id),
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            border: tipoMensaje === tipo.id ? `2px solid ${tipo.color}` : '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: tipoMensaje === tipo.id ? `${tipo.color}15` : 'white',
                            color: tipoMensaje === tipo.id ? tipo.color : '#374151',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }
                    }, [
                        tipo.icon(tipoMensaje === tipo.id ? tipo.color : '#6b7280'),
                        tipo.label
                    ])
                ))
            ]),

            // Contenido principal
            e('div', {
                key: 'whatsapp-body',
                style: { padding: '1.5rem' }
            }, [
                loading ? e('div', {
                    key: 'whatsapp-loading',
                    style: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px',
                        flexDirection: 'column',
                        gap: '1rem',
                        color: '#6b7280'
                    }
                }, [
                    e('div', {
                        key: 'spinner',
                        style: {
                            width: '32px',
                            height: '32px',
                            border: '3px solid #f3f4f6',
                            borderTop: '3px solid #25d366',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    e('p', { key: 'loading-text' }, 'Generando mensaje...')
                ]) : e('div', {
                    key: 'message-content'
                }, [
                    // Vista previa del mensaje
                    e('div', {
                        key: 'preview-section',
                        style: {
                            marginBottom: '1.5rem'
                        }
                    }, [
                        e('label', {
                            key: 'preview-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Vista Previa'),
                        e('div', {
                            key: 'whatsapp-preview',
                            style: {
                                backgroundColor: '#e7f5e7',
                                border: '1px solid #25d366',
                                borderRadius: '12px',
                                padding: '1rem',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                position: 'relative'
                            }
                        }, mensajeWhatsApp)
                    ]),

                    // Botones de acción
                    e('div', {
                        key: 'whatsapp-actions',
                        style: {
                            display: 'flex',
                            gap: '0.75rem',
                            flexWrap: 'wrap'
                        }
                    }, [
                        // Copiar mensaje con formato
                        e('button', {
                            key: 'btn-copy-formatted',
                            onClick: () => handleCopyToClipboard(mensajeWhatsApp),
                            style: {
                                flex: 1,
                                minWidth: '200px',
                                padding: '0.75rem 1rem',
                                backgroundColor: copied ? '#10b981' : '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            },
                            onMouseEnter: (e) => {
                                if (!copied) e.target.style.backgroundColor = '#4f46e5';
                            },
                            onMouseLeave: (e) => {
                                if (!copied) e.target.style.backgroundColor = '#6366f1';
                            }
                        }, [
                            copied ? Icons.check('white') : Icons.copy('white'),
                            copied ? 'Copiado!' : 'Copiar con Formato'
                        ]),

                        // Copiar mensaje simple
                        e('button', {
                            key: 'btn-copy-simple',
                            onClick: () => handleCopyToClipboard(mensajeSimple),
                            style: {
                                flex: 1,
                                minWidth: '200px',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'white',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.backgroundColor = '#f9fafb',
                            onMouseLeave: (e) => e.target.style.backgroundColor = 'white'
                        }, [
                            Icons.copy('#6b7280'),
                            'Copiar Simple'
                        ]),

                        // Abrir WhatsApp
                        e('button', {
                            key: 'btn-open-whatsapp',
                            onClick: () => abrirWhatsApp(mensajeWhatsApp),
                            style: {
                                flex: 1,
                                minWidth: '200px',
                                padding: '0.75rem 1rem',
                                backgroundColor: '#25d366',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.backgroundColor = '#22c55e',
                            onMouseLeave: (e) => e.target.style.backgroundColor = '#25d366'
                        }, [
                            Icons.messageCircle('white'),
                            'Abrir WhatsApp'
                        ])
                    ]),

                    // Información adicional
                    e('div', {
                        key: 'info-section',
                        style: {
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginTop: '1.5rem'
                        }
                    }, [
                        e('div', {
                            key: 'info-title',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            Icons.info('#3b82f6'),
                            e('span', {
                                key: 'info-title-text',
                                style: {
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                }
                            }, 'Instrucciones de Uso')
                        ]),
                        e('ul', {
                            key: 'info-list',
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                margin: '0',
                                paddingLeft: '1rem',
                                lineHeight: '1.5'
                            }
                        }, [
                            e('li', { key: 'info-1' }, 'El mensaje con formato incluye emojis y texto en negrita para WhatsApp'),
                            e('li', { key: 'info-2' }, 'El mensaje simple es texto plano sin formato especial'),
                            e('li', { key: 'info-3' }, 'En móvil se abrirá la app de WhatsApp, en desktop WhatsApp Web'),
                            e('li', { key: 'info-4' }, 'Puede modificar el mensaje antes de enviarlo al cliente')
                        ])
                    ])
                ])
            ])
        ])
    ]);
}

export default WhatsAppFormat;
