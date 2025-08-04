import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
    const [tiposPersona, setTiposPersona] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/tipos-persona')
                setTiposPersona(response.data)
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                    🎉 Magic Travel SPA - Tailwind Funciona! 🎉
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                        <h3 className="text-lg font-semibold">Reservas</h3>
                        <p className="text-3xl font-bold">24</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                        <h3 className="text-lg font-semibold">Clientes</h3>
                        <p className="text-3xl font-bold">89</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                        <h3 className="text-lg font-semibold">Rutas</h3>
                        <p className="text-3xl font-bold">6</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                        <h3 className="text-lg font-semibold">Ingresos</h3>
                        <p className="text-3xl font-bold">Q12,450</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tipos de Persona</h2>
                    {loading ? (
                        <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando...</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tiposPersona.map((tipo) => (
                                <div key={tipo.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition-shadow">
                                    <h3 className="font-semibold text-lg">{tipo.nombre}</h3>
                                    <p className="text-gray-600">{tipo.descripcion}</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${tipo.situacion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {tipo.situacion ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    ✅ <strong>Tailwind CSS funcionando correctamente!</strong> ✅
                </div>
            </div>
        </div>
    )
}

export default App
