// src/resources/js/simple.js
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

// Importar componentes
import TopBar from './components/layouts/TopBar';
import Sidebar from './components/layouts/Sidebar';
import Dashboard from './components/layouts/Dashboard';

const { createElement: e, useState } = React;

// Module Content Component
function ModuleContent({ module }) {
    switch (module) {
        case 'dashboard':
            return e(Dashboard);
        case 'reservaciones':
            return e('div', {
                style: { padding: '2rem' }
            }, [
                e('h1', {
                    key: 'title',
                    style: { fontSize: '2rem', color: '#1f2937' }
                }, '📅 Módulo de Reservaciones'),
                e('p', {
                    key: 'desc',
                    style: { color: '#6b7280', marginTop: '1rem' }
                }, 'Gestión completa de reservas - En desarrollo')
            ]);
        case 'rutas':
            return e('div', {
                style: { padding: '2rem' }
            }, [
                e('h1', {
                    key: 'title',
                    style: { fontSize: '2rem', color: '#1f2937' }
                }, '🛣️ Módulo de Rutas'),
                e('p', {
                    key: 'desc',
                    style: { color: '#6b7280', marginTop: '1rem' }
                }, 'Gestión de rutas y servicios - En desarrollo')
            ]);
        default:
            return e('div', {
                style: { padding: '2rem' }
            }, [
                e('h1', {
                    key: 'title',
                    style: { fontSize: '2rem', color: '#1f2937' }
                }, `Módulo: ${module}`),
                e('p', {
                    key: 'desc',
                    style: { color: '#6b7280', marginTop: '1rem' }
                }, 'Módulo en desarrollo')
            ]);
    }
}

// Main App Component
function App() {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // ← NUEVO ESTADO

    return e('div', {
        style: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc'
        }
    }, [
        e(TopBar, {
            key: 'topbar',
            onMenuClick: () => setSidebarCollapsed(!sidebarCollapsed), // ← TOGGLE SIDEBAR
            sidebarCollapsed
        }),
        e(Sidebar, {
            key: 'sidebar',
            activeModule,
            onModuleChange: setActiveModule,
            collapsed: sidebarCollapsed, // ← PASAR ESTADO
            onToggle: () => setSidebarCollapsed(!sidebarCollapsed) // ← FUNCIÓN TOGGLE
        }),
        e('main', {
            key: 'main',
            style: {
                marginLeft: sidebarCollapsed ? '80px' : '260px', // ← AJUSTAR MARGEN
                marginTop: '64px',
                minHeight: 'calc(100vh - 64px)',
                transition: 'margin-left 0.3s ease' // ← ANIMACIÓN
            }
        }, [
            e(ModuleContent, {
                key: 'content',
                module: activeModule
            })
        ])
    ]);
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('app');
    if (container) {
        const root = createRoot(container);
        root.render(e(App));
        console.log('🎉 Magic Travel SPA organizado y cargado!');
    }
});
