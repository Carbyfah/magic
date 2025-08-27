// src/resources/js/components/common/CityAutocomplete.js
import React from 'react';
import Icons from '../../utils/Icons';

const { createElement: e, useState, useRef, useEffect } = React;

function CityAutocomplete({
    value = '',
    onChange,
    onCitySelect,
    placeholder = 'Escriba el nombre de la ciudad...',
    style = {},
    hasError = false
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    // BASE DE DATOS COMPLETA DE MUNICIPIOS DE GUATEMALA (340 municipios)
    const guatemalaCities = [
        // ALTA VERAPAZ (16 municipios)
        { nombre: "Cobán", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Santa Cruz Verapaz", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "San Cristóbal Verapaz", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Tactic", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Tamahú", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Tucurú", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Panzós", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Senahú", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "San Pedro Carchá", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "San Juan Chamelco", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Lanquín", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Cahabón", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Chisec", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Chahal", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "Fray Bartolomé de las Casas", departamento: "Alta Verapaz", region: "Norte" },
        { nombre: "La Tinta", departamento: "Alta Verapaz", region: "Norte" },

        // BAJA VERAPAZ (8 municipios)
        { nombre: "Salamá", departamento: "Baja Verapaz", region: "Norte" },
        { nombre: "San Miguel Chicaj", departamento: "Baja Verapaz", region: "Norte" },
        { nombre: "Rabinal", departamento: "Baja Verapaz", region: "Norte" },
        { nombre: "Cubulco", departamento: "Baja Verapaz", region: "Norte" },
        { nombre: "Granados", departamento: "Baja Verapaz", region: "Norte" },
        { nombre: "Santa Cruz el Chol", departamento: "Baja Verapaz", region: "Norte" },
        { nombre: "San Jerónimo", departamento: "Baja Verapaz", region: "Norte" },
        { nombre: "Purulhá", departamento: "Baja Verapaz", region: "Norte" },

        // CHIMALTENANGO (16 municipios)
        { nombre: "Chimaltenango", departamento: "Chimaltenango", region: "Central" },
        { nombre: "San José Poaquil", departamento: "Chimaltenango", region: "Central" },
        { nombre: "San Martín Jilotepeque", departamento: "Chimaltenango", region: "Central" },
        { nombre: "San Juan Comalapa", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Santa Apolonia", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Tecpán", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Patzún", departamento: "Chimaltenango", region: "Central" },
        { nombre: "San Miguel Pochuta", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Patzicía", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Santa Cruz Balanyá", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Acatenango", departamento: "Chimaltenango", region: "Central" },
        { nombre: "San Pedro Yepocapa", departamento: "Chimaltenango", region: "Central" },
        { nombre: "San Andrés Itzapa", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Parramos", departamento: "Chimaltenango", region: "Central" },
        { nombre: "Zaragoza", departamento: "Chimaltenango", region: "Central" },
        { nombre: "El Tejar", departamento: "Chimaltenango", region: "Central" },

        // CHIQUIMULA (11 municipios)
        { nombre: "Chiquimula", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "San José la Arada", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "San Juan Ermita", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "Jocotán", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "Camotán", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "Olopa", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "Esquipulas", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "Concepción Las Minas", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "Quezaltepeque", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "San Jacinto", departamento: "Chiquimula", region: "Oriente" },
        { nombre: "Ipala", departamento: "Chiquimula", region: "Oriente" },

        // EL PROGRESO (8 municipios)
        { nombre: "Guastatoya", departamento: "El Progreso", region: "Norte" },
        { nombre: "Morazán", departamento: "El Progreso", region: "Norte" },
        { nombre: "San Agustín Acasaguastlán", departamento: "El Progreso", region: "Norte" },
        { nombre: "San Cristóbal Acasaguastlán", departamento: "El Progreso", region: "Norte" },
        { nombre: "El Jícaro", departamento: "El Progreso", region: "Norte" },
        { nombre: "Sansare", departamento: "El Progreso", region: "Norte" },
        { nombre: "Sanarate", departamento: "El Progreso", region: "Norte" },
        { nombre: "San Antonio La Paz", departamento: "El Progreso", region: "Norte" },

        // ESCUINTLA (13 municipios)
        { nombre: "Escuintla", departamento: "Escuintla", region: "Sur" },
        { nombre: "Santa Lucía Cotzumalguapa", departamento: "Escuintla", region: "Sur" },
        { nombre: "La Democracia", departamento: "Escuintla", region: "Sur" },
        { nombre: "Siquinalá", departamento: "Escuintla", region: "Sur" },
        { nombre: "Masagua", departamento: "Escuintla", region: "Sur" },
        { nombre: "Tiquisate", departamento: "Escuintla", region: "Sur" },
        { nombre: "La Gomera", departamento: "Escuintla", region: "Sur" },
        { nombre: "Guanagazapa", departamento: "Escuintla", region: "Sur" },
        { nombre: "San José", departamento: "Escuintla", region: "Sur" },
        { nombre: "Iztapa", departamento: "Escuintla", region: "Sur" },
        { nombre: "Palín", departamento: "Escuintla", region: "Sur" },
        { nombre: "San Vicente Pacaya", departamento: "Escuintla", region: "Sur" },
        { nombre: "Nueva Concepción", departamento: "Escuintla", region: "Sur" },

        // GUATEMALA (17 municipios)
        { nombre: "Guatemala", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Santa Catarina Pinula", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "San José Pinula", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "San José del Golfo", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Palencia", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Chinautla", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "San Pedro Ayampuc", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Mixco", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "San Pedro Sacatepéquez", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "San Juan Sacatepéquez", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "San Raymundo", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Chuarrancho", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Fraijanes", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Amatitlán", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Villa Nueva", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "Villa Canales", departamento: "Guatemala", region: "Metropolitana" },
        { nombre: "San Miguel Petapa", departamento: "Guatemala", region: "Metropolitana" },

        // HUEHUETENANGO (31 municipios)
        { nombre: "Huehuetenango", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Chiantla", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Malacatancito", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Cuilco", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Nentón", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Pedro Necta", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Jacaltenango", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Pedro Soloma", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Ildefonso Ixtahuacán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Santa Bárbara", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "La Libertad", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "La Democracia", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Miguel Acatán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Rafael La Independencia", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Todos Santos Cuchumatán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Juan Atitán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Santa Eulalia", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Mateo Ixtatán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Colotenango", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Sebastián Huehuetenango", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Tectitán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Concepción Huista", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Juan Ixcoy", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Antonio Huista", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Sebastián Coatán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Barillas", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Aguacatán", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Rafael Petzal", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "San Gaspar Ixchil", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Santiago Chimaltenango", departamento: "Huehuetenango", region: "Noroccidente" },
        { nombre: "Santa Ana Huista", departamento: "Huehuetenango", region: "Noroccidente" },

        // IZABAL (5 municipios)
        { nombre: "Puerto Barrios", departamento: "Izabal", region: "Oriente" },
        { nombre: "Livingston", departamento: "Izabal", region: "Oriente" },
        { nombre: "El Estor", departamento: "Izabal", region: "Oriente" },
        { nombre: "Morales", departamento: "Izabal", region: "Oriente" },
        { nombre: "Los Amates", departamento: "Izabal", region: "Oriente" },

        // JALAPA (7 municipios)
        { nombre: "Jalapa", departamento: "Jalapa", region: "Oriente" },
        { nombre: "San Pedro Pinula", departamento: "Jalapa", region: "Oriente" },
        { nombre: "San Luis Jilotepeque", departamento: "Jalapa", region: "Oriente" },
        { nombre: "San Manuel Chaparrón", departamento: "Jalapa", region: "Oriente" },
        { nombre: "San Carlos Alzatate", departamento: "Jalapa", region: "Oriente" },
        { nombre: "Monjas", departamento: "Jalapa", region: "Oriente" },
        { nombre: "Mataquescuintla", departamento: "Jalapa", region: "Oriente" },

        // JUTIAPA (17 municipios)
        { nombre: "Jutiapa", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "El Progreso", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Santa Catarina Mita", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Agua Blanca", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Asunción Mita", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Yupiltepeque", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Atescatempa", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Jerez", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "El Adelanto", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Zapotitlán", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Comapa", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Jalpatagua", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Conguaco", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Moyuta", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Pasaco", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "San José Acatempa", departamento: "Jutiapa", region: "Oriente" },
        { nombre: "Quesada", departamento: "Jutiapa", region: "Oriente" },

        // PETÉN (12 municipios)
        { nombre: "Flores", departamento: "Petén", region: "Norte" },
        { nombre: "San José", departamento: "Petén", region: "Norte" },
        { nombre: "San Benito", departamento: "Petén", region: "Norte" },
        { nombre: "San Andrés", departamento: "Petén", region: "Norte" },
        { nombre: "La Libertad", departamento: "Petén", region: "Norte" },
        { nombre: "San Francisco", departamento: "Petén", region: "Norte" },
        { nombre: "Santa Ana", departamento: "Petén", region: "Norte" },
        { nombre: "Dolores", departamento: "Petén", region: "Norte" },
        { nombre: "San Luis", departamento: "Petén", region: "Norte" },
        { nombre: "Sayaxché", departamento: "Petén", region: "Norte" },
        { nombre: "Melchor de Mencos", departamento: "Petén", region: "Norte" },
        { nombre: "Poptún", departamento: "Petén", region: "Norte" },

        // QUETZALTENANGO (24 municipios)
        { nombre: "Quetzaltenango", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Salcajá", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Olintepeque", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "San Carlos Sija", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Sibilia", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Cabricán", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Cajolá", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "San Miguel Sigüilá", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "San Juan Ostuncalco", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "San Mateo", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Concepción Chiquirichapa", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "San Martín Sacatepéquez", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Almolonga", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Cantel", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Huitán", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Zunil", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Colomba", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "San Francisco La Unión", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "El Palmar", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Coatepeque", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Génova", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Flores Costa Cuca", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "La Esperanza", departamento: "Quetzaltenango", region: "Occidente" },
        { nombre: "Palestina de Los Altos", departamento: "Quetzaltenango", region: "Occidente" },

        // QUICHÉ (21 municipios)
        { nombre: "Santa Cruz del Quiché", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Chiché", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Chinique", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Zacualpa", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Chajul", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Santo Tomás Chichicastenango", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Patzité", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "San Antonio Ilotenango", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "San Pedro Jocopilas", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Cunén", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "San Juan Cotzal", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Joyabaj", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Nebaj", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "San Andrés Sajcabajá", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "San Miguel Uspantán", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Sacapulas", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "San Bartolomé Jocotenango", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Canillá", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Chicamán", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Ixcán", departamento: "Quiché", region: "Noroccidente" },
        { nombre: "Pachalum", departamento: "Quiché", region: "Noroccidente" },

        // RETALHULEU (9 municipios)
        { nombre: "Retalhuleu", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "San Sebastián", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "Santa Cruz Muluá", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "San Martín Zapotitlán", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "San Felipe", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "San Andrés Villa Seca", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "Champerico", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "Nuevo San Carlos", departamento: "Retalhuleu", region: "Occidente" },
        { nombre: "El Asintal", departamento: "Retalhuleu", region: "Occidente" },

        // SACATEPÉQUEZ (16 municipios)
        { nombre: "Antigua Guatemala", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Jocotenango", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Pastores", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Sumpango", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Santo Domingo Xenacoj", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Santiago Sacatepéquez", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "San Bartolomé Milpas Altas", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "San Lucas Sacatepéquez", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Santa Lucía Milpas Altas", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Magdalena Milpas Altas", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Santa María de Jesús", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Ciudad Vieja", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "San Miguel Dueñas", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "San Juan Alotenango", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "San Antonio Aguas Calientes", departamento: "Sacatepéquez", region: "Central" },
        { nombre: "Santa Catarina Barahona", departamento: "Sacatepéquez", region: "Central" },

        // SAN MARCOS (29 municipios)
        { nombre: "San Marcos", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San Pedro Sacatepéquez", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San Antonio Sacatepéquez", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Comitancillo", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San Miguel Ixtahuacán", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Concepción Tutuapa", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Tacaná", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Sibinal", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Tajumulco", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Tejutla", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San Rafael Pie de la Cuesta", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Nuevo Progreso", departamento: "San Marcos", region: "Occidente" },
        { nombre: "El Tumbador", departamento: "San Marcos", region: "Occidente" },
        { nombre: "El Rodeo", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Malacatán", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Catarina", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Ayutla", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Ocós", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San Pablo", departamento: "San Marcos", region: "Occidente" },
        { nombre: "El Quetzal", departamento: "San Marcos", region: "Occidente" },
        { nombre: "La Reforma", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Pajapita", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Ixchiguán", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San José Ojetenam", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San Cristóbal Cucho", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Sipacapa", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Esquipulas Palo Gordo", departamento: "San Marcos", region: "Occidente" },
        { nombre: "Río Blanco", departamento: "San Marcos", region: "Occidente" },
        { nombre: "San Lorenzo", departamento: "San Marcos", region: "Occidente" },

        // SANTA ROSA (14 municipios)
        { nombre: "Cuilapa", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Barberena", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Santa Rosa de Lima", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Casillas", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "San Rafael Las Flores", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Oratorio", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "San Juan Tecuaco", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Chiquimulilla", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Taxisco", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Santa María Ixhuatán", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Guazacapán", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Santa Cruz Naranjo", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Pueblo Nuevo Viñas", departamento: "Santa Rosa", region: "Sur" },
        { nombre: "Nueva Santa Rosa", departamento: "Santa Rosa", region: "Sur" },

        // SOLOLÁ (19 municipios)
        { nombre: "Sololá", departamento: "Sololá", region: "Occidente" },
        { nombre: "San José Chacayá", departamento: "Sololá", region: "Occidente" },
        { nombre: "Santa María Visitación", departamento: "Sololá", region: "Occidente" },
        { nombre: "Santa Lucía Utatlán", departamento: "Sololá", region: "Occidente" },
        { nombre: "Nahualá", departamento: "Sololá", region: "Occidente" },
        { nombre: "Santa Catarina Ixtahuacán", departamento: "Sololá", region: "Occidente" },
        { nombre: "Santa Clara La Laguna", departamento: "Sololá", region: "Occidente" },
        { nombre: "Concepción", departamento: "Sololá", region: "Occidente" },
        { nombre: "San Andrés Semetabaj", departamento: "Sololá", region: "Occidente" },
        { nombre: "Panajachel", departamento: "Sololá", region: "Occidente" },
        { nombre: "Santa Catarina Palopó", departamento: "Sololá", region: "Occidente" },
        { nombre: "San Antonio Palopó", departamento: "Sololá", region: "Occidente" },
        { nombre: "San Lucas Tolimán", departamento: "Sololá", region: "Occidente" },
        { nombre: "Santa Cruz La Laguna", departamento: "Sololá", region: "Occidente" },
        { nombre: "San Pablo La Laguna", departamento: "Sololá", region: "Occidente" },
        { nombre: "San Marcos La Laguna", departamento: "Sololá", region: "Occidente" },
        { nombre: "San Juan La Laguna", departamento: "Sololá", region: "Occidente" },
        { nombre: "San Pedro La Laguna", departamento: "Sololá", region: "Occidente" },
        { nombre: "Santiago Atitlán", departamento: "Sololá", region: "Occidente" },

        // SUCHITEPÉQUEZ (20 municipios)
        { nombre: "Mazatenango", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Cuyotenango", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Francisco Zapotitlán", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Bernardino", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San José El Ídolo", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Santo Domingo Suchitepéquez", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Lorenzo", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Samayac", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Pablo Jocopilas", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Antonio Suchitepéquez", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Miguel Panán", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Gabriel", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Chicacao", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Patulul", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Santa Bárbara", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "San Juan Bautista", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Santo Tomás La Unión", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Zunilito", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Pueblo Nuevo", departamento: "Suchitepéquez", region: "Occidente" },
        { nombre: "Río Bravo", departamento: "Suchitepéquez", region: "Occidente" },

        // TOTONICAPÁN (8 municipios)
        { nombre: "Totonicapán", departamento: "Totonicapán", region: "Occidente" },
        { nombre: "San Cristóbal Totonicapán", departamento: "Totonicapán", region: "Occidente" },
        { nombre: "San Francisco El Alto", departamento: "Totonicapán", region: "Occidente" },
        { nombre: "San Andrés Xecul", departamento: "Totonicapán", region: "Occidente" },
        { nombre: "Momostenango", departamento: "Totonicapán", region: "Occidente" },
        { nombre: "Santa María Chiquimula", departamento: "Totonicapán", region: "Occidente" },
        { nombre: "Santa Lucía La Reforma", departamento: "Totonicapán", region: "Occidente" },
        { nombre: "San Bartolo", departamento: "Totonicapán", region: "Occidente" },

        // ZACAPA (10 municipios)
        { nombre: "Zacapa", departamento: "Zacapa", region: "Oriente" },
        { nombre: "Estanzuela", departamento: "Zacapa", region: "Oriente" },
        { nombre: "Río Hondo", departamento: "Zacapa", region: "Oriente" },
        { nombre: "Gualán", departamento: "Zacapa", region: "Oriente" },
        { nombre: "Teculután", departamento: "Zacapa", region: "Oriente" },
        { nombre: "Usumatlán", departamento: "Zacapa", region: "Oriente" },
        { nombre: "Cabañas", departamento: "Zacapa", region: "Oriente" },
        { nombre: "San Diego", departamento: "Zacapa", region: "Oriente" },
        { nombre: "La Unión", departamento: "Zacapa", region: "Oriente" },
        { nombre: "Huité", departamento: "Zacapa", region: "Oriente" }
    ];

    // Función para buscar ciudades
    const searchCities = (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);

        // Simular pequeña demora para mostrar el loading
        setTimeout(() => {
            const filtered = guatemalaCities
                .filter(city =>
                    city.nombre.toLowerCase().includes(query.toLowerCase()) ||
                    city.departamento.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 8) // Máximo 8 resultados
                .sort((a, b) => {
                    // Priorizar coincidencias exactas al inicio
                    const aStartsWith = a.nombre.toLowerCase().startsWith(query.toLowerCase());
                    const bStartsWith = b.nombre.toLowerCase().startsWith(query.toLowerCase());

                    if (aStartsWith && !bStartsWith) return -1;
                    if (!aStartsWith && bStartsWith) return 1;

                    return a.nombre.localeCompare(b.nombre);
                });

            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
            setSelectedIndex(-1);
            setIsLoading(false);
        }, 150);
    };

    // Efecto para la búsqueda
    useEffect(() => {
        searchCities(value);
    }, [value]);

    // Manejar clics fuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Manejar navegación por teclado
    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;

            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    selectCity(suggestions[selectedIndex]);
                }
                break;

            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Seleccionar ciudad de la lista
    const selectCity = (city) => {
        console.log('🏙️ Ciudad seleccionada:', city);

        // Actualizar el campo de nombre
        onChange(city.nombre);

        // Notificar al componente padre con todos los datos
        if (onCitySelect) {
            onCitySelect({
                nombre_ciudad: city.nombre,
                departamento: city.departamento,
                region: city.region
            });
        }

        // Ocultar sugerencias
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    return e('div', {
        ref: inputRef,
        style: {
            position: 'relative',
            width: '100%'
        }
    }, [
        // Input principal
        e('input', {
            key: 'city-input',
            type: 'text',
            value: value,
            placeholder: placeholder,
            onChange: (e) => onChange(e.target.value),
            onKeyDown: handleKeyDown,
            onFocus: () => {
                if (suggestions.length > 0) {
                    setShowSuggestions(true);
                }
            },
            style: {
                width: '100%',
                padding: '0.75rem',
                paddingRight: isLoading ? '3rem' : '2.5rem',
                border: hasError ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                ...style,
                ':focus': {
                    borderColor: hasError ? '#ef4444' : '#3b82f6',
                    boxShadow: `0 0 0 3px ${hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`
                }
            }
        }),

        // Icono de búsqueda o loading
        e('div', {
            key: 'search-icon',
            style: {
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center'
            }
        }, isLoading
            ? e('div', {
                style: {
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            })
            : Icons.search('#9ca3af')
        ),

        // Lista de sugerencias
        showSuggestions && suggestions.length > 0 && e('div', {
            key: 'suggestions',
            style: {
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 1000,
                marginTop: '4px',
                maxHeight: '300px',
                overflowY: 'auto'
            }
        }, suggestions.map((city, index) =>
            e('div', {
                key: `${city.nombre}-${city.departamento}`,
                onClick: () => selectCity(city),
                style: {
                    padding: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    backgroundColor: selectedIndex === index ? '#f3f4f6' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.1s'
                },
                onMouseEnter: () => setSelectedIndex(index),
                onMouseLeave: () => setSelectedIndex(-1)
            }, [
                // Información de la ciudad
                e('div', {
                    key: 'city-info',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.1rem'
                    }
                }, [
                    e('div', {
                        key: 'city-name',
                        style: {
                            fontWeight: '500',
                            color: '#111827',
                            fontSize: '0.875rem'
                        }
                    }, city.nombre),
                    e('div', {
                        key: 'city-location',
                        style: {
                            fontSize: '0.75rem',
                            color: '#6b7280'
                        }
                    }, `${city.departamento} • ${city.region}`)
                ]),

                // Indicador visual por región
                e('div', {
                    key: 'region-indicator',
                    style: {
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getRegionColor(city.region),
                        opacity: 0.8
                    }
                })
            ])
        ))
    ]);

    // Función auxiliar para colores por región
    function getRegionColor(region) {
        const colors = {
            'Metropolitana': '#3b82f6',
            'Norte': '#10b981',
            'Noroccidente': '#f59e0b',
            'Occidente': '#8b5cf6',
            'Central': '#06b6d4',
            'Oriente': '#ef4444',
            'Sur': '#84cc16'
        };
        return colors[region] || '#6b7280';
    }
}

export default CityAutocomplete;
