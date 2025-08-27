// src/resources/js/utils/notifications.js
// 🔔 SISTEMA DE NOTIFICACIONES MAGIC TRAVEL - IZITOAST ESTILO ORIGINAL

class MagicTravelNotifications {
    constructor() {
        this.checkiziToast();
        this.loadingInstance = null;
        this.setupDefaults();
    }

    // ✅ VERIFICAR QUE IZITOAST ESTÉ DISPONIBLE
    checkiziToast() {
        if (typeof window.iziToast === 'undefined') {
            console.error('❌ iziToast no está cargado. Asegúrate de incluir la librería.');
            return false;
        }
        console.log('✅ iziToast cargado correctamente');
        return true;
    }

    // ⚙️ CONFIGURACIÓN POR DEFECTO MAGIC TRAVEL
    setupDefaults() {
        if (!this.checkiziToast()) return;

        // Configuración global de iziToast
        window.iziToast.settings({
            timeout: 4000,
            resetOnHover: true,
            transitionIn: 'fadeInUp',
            transitionOut: 'fadeOutDown',
            position: 'topRight',
            close: true,
            drag: true,
            pauseOnHover: true,
            displayMode: 'once', // Evita duplicados
            layout: 1,
            balloon: false,
            rtl: false,
            animateInside: true,
            zindex: 9999
        });
    }

    // 🔵 INFORMACIÓN - ESTILO IZITOAST ORIGINAL
    info(message, title = '') {
        if (!this.checkiziToast()) return;

        window.iziToast.info({
            title: title || 'Información',
            message: message,
            icon: 'ico-info',
            color: 'blue',
            timeout: 4000,
            progressBar: true,
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'fadeInUp',
            transitionOut: 'fadeOutDown',
            position: 'topRight',
            theme: 'light', // light o dark
            displayMode: 'once'
        });
    }

    // ✅ ÉXITO - ESTILO IZITOAST ORIGINAL
    success(message, title = '') {
        if (!this.checkiziToast()) return;

        window.iziToast.success({
            title: title || 'Éxito',
            message: message,
            icon: 'ico-success',
            color: 'green',
            timeout: 3000,
            progressBar: true,
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutRight',
            position: 'topRight',
            theme: 'light',
            displayMode: 'once'
        });
    }

    // ⚠️ ADVERTENCIA - ESTILO IZITOAST ORIGINAL
    warning(message, title = '') {
        if (!this.checkiziToast()) return;

        window.iziToast.warning({
            title: title || 'Advertencia',
            message: message,
            icon: 'ico-warning',
            color: 'yellow',
            timeout: 5000,
            progressBar: true,
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'flipInX',
            transitionOut: 'flipOutX',
            position: 'topRight',
            theme: 'light',
            displayMode: 'once'
        });
    }

    // ❌ ERROR - ESTILO IZITOAST ORIGINAL
    error(message, title = '') {
        if (!this.checkiziToast()) return;

        window.iziToast.error({
            title: title || 'Error',
            message: message,
            icon: 'ico-error',
            color: 'red',
            timeout: 6000,
            progressBar: true,
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'bounceInDown',
            transitionOut: 'fadeOutUp',
            position: 'topRight',
            theme: 'light',
            displayMode: 'once'
        });
    }

    // LOADING - ESTILO IZITOAST ORIGINAL - CORREGIDO
    loading(message, title = '') {
        if (!this.checkiziToast()) return;

        // Si ya hay un loading, lo cerramos primero
        if (this.loadingInstance) {
            this.hideLoading();
        }

        this.loadingInstance = window.iziToast.info({
            title: title || 'Cargando...',
            message: message,
            icon: 'ico-loading',
            color: 'blue',
            timeout: false, // No timeout para loading
            progressBar: false,
            close: false, // No se puede cerrar manualmente
            closeOnEscape: false,
            closeOnClick: false,
            drag: false,
            pauseOnHover: false,
            resetOnHover: false,
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',
            position: 'topRight', // CAMBIO: era 'topCenter'
            theme: 'light',
            overlay: false, // CAMBIO: era true
            overlayClose: false,
            overlayColor: 'rgba(0, 0, 0, 0.2)',
            displayMode: 'replace',
            layout: 2,
            backgroundColor: '#3b82f6',
            titleColor: '#ffffff',
            messageColor: '#ffffff',
            iconColor: '#ffffff',
            progressBarColor: '#ffffff'
        });
    }

    // 🚫 OCULTAR LOADING
    hideLoading() {
        if (!this.checkiziToast()) return;

        if (this.loadingInstance) {
            window.iziToast.hide({}, this.loadingInstance);
            this.loadingInstance = null;
        }
    }

    // 🚌 MAGIC TRAVEL PERSONALIZADA - CON COLORES DE LA EMPRESA
    magicTravel(message, title = '') {
        if (!this.checkiziToast()) return;

        window.iziToast.show({
            title: title || 'Magic Travel',
            message: message,
            icon: 'ico-info',
            color: 'blue', // Color base, pero lo personalizamos
            timeout: 4000,
            progressBar: true,
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'bounceInRight',
            transitionOut: 'fadeOutLeft',
            position: 'topRight',
            theme: 'light',
            displayMode: 'once',
            // 🎨 PERSONALIZACIÓN MAGIC TRAVEL
            backgroundColor: '#1e40af', // Azul Magic Travel
            titleColor: '#ffffff',
            messageColor: '#e0f2fe',
            iconColor: '#60a5fa',
            progressBarColor: '#3b82f6',
            balloon: true,
            layout: 2,
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            imageWidth: 50
        });
    }

    // 🔥 NOTIFICACIÓN CRÍTICA - MÁXIMA ATENCIÓN
    critical(message, title = '') {
        if (!this.checkiziToast()) return;

        window.iziToast.error({
            title: title || '🚨 CRÍTICO',
            message: message,
            icon: 'ico-error',
            color: 'red',
            timeout: 10000, // 10 segundos para crítico
            progressBar: true,
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'bounceInDown',
            transitionOut: 'fadeOutUp',
            position: 'topCenter', // Centro para máxima visibilidad
            theme: 'dark', // Tema oscuro para urgencia
            displayMode: 'replace',
            layout: 2,
            balloon: true,
            overlay: true,
            overlayClose: false,
            overlayColor: 'rgba(220, 38, 38, 0.1)',
            backgroundColor: '#dc2626',
            titleColor: '#ffffff',
            messageColor: '#fef2f2',
            iconColor: '#fca5a5',
            progressBarColor: '#ef4444'
        });
    }

    // REEMPLAZAR la función confirm() por esta versión PROFESIONAL:

    confirm(message, onConfirm, onCancel = null, title = 'Confirmar Acción') {
        if (!this.checkiziToast()) return;

        window.iziToast.show({
            theme: 'light',
            color: 'red',
            layout: 2,
            drag: false,
            timeout: false,
            close: false,
            closeOnEscape: false,
            closeOnClick: false,
            displayMode: 'once',
            id: 'confirm-delete',
            zindex: 9999,
            title: title,
            message: message,
            position: 'center',
            overlay: true,
            overlayClose: false,
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            progressBar: false,
            balloon: false,

            // ESTILO PROFESIONAL
            backgroundColor: '#ffffff',
            titleColor: '#dc2626',
            messageColor: '#374151',
            iconColor: '#dc2626',

            // ICONO PROFESIONAL
            icon: 'fas fa-exclamation-triangle',

            // BOTONES PROFESIONALES
            buttons: [
                // Botón CANCELAR (izquierda)
                [`<button type="button" style="
                background: #f3f4f6;
                color: #6b7280;
                border: 1px solid #d1d5db;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 500;
                margin-right: 8px;
                cursor: pointer;
                transition: all 0.2s;
            ">Cancelar</button>`, function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                        if (typeof onCancel === 'function') {
                            onCancel();
                        }
                    }],

                // Botón ELIMINAR (derecha)
                [`<button type="button" style="
                background: #dc2626;
                color: #ffffff;
                border: 1px solid #dc2626;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">Eliminar</button>`, function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                        if (typeof onConfirm === 'function') {
                            onConfirm();
                        }
                    }, true] // true = botón principal
            ],

            // ANIMACIONES SUAVES
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',

            // EVENTOS HOVER PARA BOTONES
            onOpening: function (instance, toast) {
                // Agregar efectos hover a los botones después de que se abra
                setTimeout(() => {
                    const buttons = toast.querySelectorAll('button');

                    // Botón cancelar (primer botón)
                    if (buttons[0]) {
                        buttons[0].addEventListener('mouseenter', function () {
                            this.style.background = '#e5e7eb';
                            this.style.borderColor = '#9ca3af';
                        });
                        buttons[0].addEventListener('mouseleave', function () {
                            this.style.background = '#f3f4f6';
                            this.style.borderColor = '#d1d5db';
                        });
                    }

                    // Botón eliminar (segundo botón)
                    if (buttons[1]) {
                        buttons[1].addEventListener('mouseenter', function () {
                            this.style.background = '#b91c1c';
                            this.style.borderColor = '#b91c1c';
                            this.style.transform = 'translateY(-1px)';
                            this.style.boxShadow = '0 4px 6px rgba(220, 38, 38, 0.3)';
                        });
                        buttons[1].addEventListener('mouseleave', function () {
                            this.style.background = '#dc2626';
                            this.style.borderColor = '#dc2626';
                            this.style.transform = 'translateY(0)';
                            this.style.boxShadow = 'none';
                        });
                    }
                }, 100);
            }
        });
    }

    // 🧹 LIMPIAR TODAS LAS NOTIFICACIONES
    clear() {
        if (!this.checkiziToast()) return;

        window.iziToast.destroy();
        this.loadingInstance = null;
    }

    // 📱 NOTIFICACIÓN TIPO PUSH (PERSISTENTE)
    push(message, title = '', options = {}) {
        if (!this.checkiziToast()) return;

        window.iziToast.show({
            title: title || 'Notificación',
            message: message,
            timeout: false, // Persistente
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'slideInLeft',
            transitionOut: 'slideOutLeft',
            position: 'bottomRight',
            theme: 'dark',
            layout: 2,
            balloon: true,
            progressBar: false,
            backgroundColor: '#374151',
            titleColor: '#f9fafb',
            messageColor: '#d1d5db',
            iconColor: '#9ca3af',
            displayMode: 'once',
            buttons: [
                [`<button><b>Cerrar</b></button>`, function (instance, toast) {
                    window.iziToast.hide({}, toast);
                }, false]
            ],
            ...options
        });
    }

    // 🎉 CELEBRACIÓN - PARA LOGROS IMPORTANTES
    celebration(message, title = '') {
        if (!this.checkiziToast()) return;

        window.iziToast.success({
            title: title || '🎉 ¡Felicidades!',
            message: message,
            icon: 'ico-success',
            color: 'green',
            timeout: 5000,
            progressBar: true,
            close: true,
            closeOnEscape: true,
            closeOnClick: false,
            drag: true,
            pauseOnHover: true,
            resetOnHover: true,
            transitionIn: 'bounceIn',
            transitionOut: 'bounceOut',
            position: 'topCenter',
            theme: 'light',
            displayMode: 'once',
            layout: 2,
            balloon: true,
            backgroundColor: '#059669',
            titleColor: '#ffffff',
            messageColor: '#d1fae5',
            iconColor: '#34d399',
            progressBarColor: '#10b981',
            animateInside: true
        });
    }
}

// 🚀 CREAR INSTANCIA ÚNICA
const Notifications = new MagicTravelNotifications();

// 🔗 EXPORTAR PARA USO GLOBAL
export default Notifications;

// 💡 HACER DISPONIBLE GLOBALMENTE PARA DEBUG
if (typeof window !== 'undefined') {
    window.MagicTravelNotifications = Notifications;
}
