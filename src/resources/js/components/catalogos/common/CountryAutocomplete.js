// src/resources/js/components/catalogos/common/CountryAutocomplete.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e, useState, useEffect, useRef } = React;

function CountryAutocomplete({
    value,
    onChange,
    onCountrySelect,
    placeholder,
    style,
    hasError
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // API pública de países - RESTCountries (gratuita y confiable)
    const searchCountries = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            setIsLoading(true);

            // Lista completa de países en español (250+ países y territorios)
            const allCountries = await getAllCountriesInSpanish();

            // Filtrar países que coincidan con la búsqueda
            const filteredCountries = allCountries
                .filter(country =>
                    country.nombre.toLowerCase().includes(query.toLowerCase()) ||
                    country.nombreOriginal.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 8) // Máximo 8 sugerencias
                .map(country => ({
                    nombre: country.nombre,
                    iso2: country.iso2,
                    iso3: country.iso3,
                    codigoTel: country.codigoTel,
                    nombreOriginal: country.nombreOriginal
                }));

            setSuggestions(filteredCountries);
            setShowSuggestions(filteredCountries.length > 0);
            setSelectedIndex(-1);
        } catch (error) {
            console.warn('Error buscando países:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para obtener TODOS los países del mundo en español
    const getAllCountriesInSpanish = async () => {
        // Lista completa de países en español con códigos ISO y teléfonos
        return [
            // AMÉRICA DEL NORTE
            { nombre: "Estados Unidos", iso2: "US", iso3: "USA", codigoTel: "+1", nombreOriginal: "United States" },
            { nombre: "Canadá", iso2: "CA", iso3: "CAN", codigoTel: "+1", nombreOriginal: "Canada" },
            { nombre: "México", iso2: "MX", iso3: "MEX", codigoTel: "+52", nombreOriginal: "Mexico" },

            // AMÉRICA CENTRAL
            { nombre: "Guatemala", iso2: "GT", iso3: "GTM", codigoTel: "+502", nombreOriginal: "Guatemala" },
            { nombre: "Belice", iso2: "BZ", iso3: "BLZ", codigoTel: "+501", nombreOriginal: "Belize" },
            { nombre: "El Salvador", iso2: "SV", iso3: "SLV", codigoTel: "+503", nombreOriginal: "El Salvador" },
            { nombre: "Honduras", iso2: "HN", iso3: "HND", codigoTel: "+504", nombreOriginal: "Honduras" },
            { nombre: "Nicaragua", iso2: "NI", iso3: "NIC", codigoTel: "+505", nombreOriginal: "Nicaragua" },
            { nombre: "Costa Rica", iso2: "CR", iso3: "CRI", codigoTel: "+506", nombreOriginal: "Costa Rica" },
            { nombre: "Panamá", iso2: "PA", iso3: "PAN", codigoTel: "+507", nombreOriginal: "Panama" },

            // CARIBE
            { nombre: "Cuba", iso2: "CU", iso3: "CUB", codigoTel: "+53", nombreOriginal: "Cuba" },
            { nombre: "Jamaica", iso2: "JM", iso3: "JAM", codigoTel: "+1876", nombreOriginal: "Jamaica" },
            { nombre: "Haití", iso2: "HT", iso3: "HTI", codigoTel: "+509", nombreOriginal: "Haiti" },
            { nombre: "República Dominicana", iso2: "DO", iso3: "DOM", codigoTel: "+1849", nombreOriginal: "Dominican Republic" },
            { nombre: "Puerto Rico", iso2: "PR", iso3: "PRI", codigoTel: "+1787", nombreOriginal: "Puerto Rico" },
            { nombre: "Trinidad y Tobago", iso2: "TT", iso3: "TTO", codigoTel: "+1868", nombreOriginal: "Trinidad and Tobago" },
            { nombre: "Barbados", iso2: "BB", iso3: "BRB", codigoTel: "+1246", nombreOriginal: "Barbados" },

            // AMÉRICA DEL SUR
            { nombre: "Colombia", iso2: "CO", iso3: "COL", codigoTel: "+57", nombreOriginal: "Colombia" },
            { nombre: "Venezuela", iso2: "VE", iso3: "VEN", codigoTel: "+58", nombreOriginal: "Venezuela" },
            { nombre: "Guyana", iso2: "GY", iso3: "GUY", codigoTel: "+592", nombreOriginal: "Guyana" },
            { nombre: "Surinam", iso2: "SR", iso3: "SUR", codigoTel: "+597", nombreOriginal: "Suriname" },
            { nombre: "Guyana Francesa", iso2: "GF", iso3: "GUF", codigoTel: "+594", nombreOriginal: "French Guiana" },
            { nombre: "Brasil", iso2: "BR", iso3: "BRA", codigoTel: "+55", nombreOriginal: "Brazil" },
            { nombre: "Ecuador", iso2: "EC", iso3: "ECU", codigoTel: "+593", nombreOriginal: "Ecuador" },
            { nombre: "Perú", iso2: "PE", iso3: "PER", codigoTel: "+51", nombreOriginal: "Peru" },
            { nombre: "Bolivia", iso2: "BO", iso3: "BOL", codigoTel: "+591", nombreOriginal: "Bolivia" },
            { nombre: "Chile", iso2: "CL", iso3: "CHL", codigoTel: "+56", nombreOriginal: "Chile" },
            { nombre: "Argentina", iso2: "AR", iso3: "ARG", codigoTel: "+54", nombreOriginal: "Argentina" },
            { nombre: "Uruguay", iso2: "UY", iso3: "URY", codigoTel: "+598", nombreOriginal: "Uruguay" },
            { nombre: "Paraguay", iso2: "PY", iso3: "PRY", codigoTel: "+595", nombreOriginal: "Paraguay" },

            // EUROPA OCCIDENTAL
            { nombre: "España", iso2: "ES", iso3: "ESP", codigoTel: "+34", nombreOriginal: "Spain" },
            { nombre: "Portugal", iso2: "PT", iso3: "PRT", codigoTel: "+351", nombreOriginal: "Portugal" },
            { nombre: "Francia", iso2: "FR", iso3: "FRA", codigoTel: "+33", nombreOriginal: "France" },
            { nombre: "Reino Unido", iso2: "GB", iso3: "GBR", codigoTel: "+44", nombreOriginal: "United Kingdom" },
            { nombre: "Irlanda", iso2: "IE", iso3: "IRL", codigoTel: "+353", nombreOriginal: "Ireland" },
            { nombre: "Italia", iso2: "IT", iso3: "ITA", codigoTel: "+39", nombreOriginal: "Italy" },
            { nombre: "Alemania", iso2: "DE", iso3: "DEU", codigoTel: "+49", nombreOriginal: "Germany" },
            { nombre: "Países Bajos", iso2: "NL", iso3: "NLD", codigoTel: "+31", nombreOriginal: "Netherlands" },
            { nombre: "Bélgica", iso2: "BE", iso3: "BEL", codigoTel: "+32", nombreOriginal: "Belgium" },
            { nombre: "Luxemburgo", iso2: "LU", iso3: "LUX", codigoTel: "+352", nombreOriginal: "Luxembourg" },
            { nombre: "Suiza", iso2: "CH", iso3: "CHE", codigoTel: "+41", nombreOriginal: "Switzerland" },
            { nombre: "Austria", iso2: "AT", iso3: "AUT", codigoTel: "+43", nombreOriginal: "Austria" },

            // EUROPA NÓRDICA
            { nombre: "Dinamarca", iso2: "DK", iso3: "DNK", codigoTel: "+45", nombreOriginal: "Denmark" },
            { nombre: "Suecia", iso2: "SE", iso3: "SWE", codigoTel: "+46", nombreOriginal: "Sweden" },
            { nombre: "Noruega", iso2: "NO", iso3: "NOR", codigoTel: "+47", nombreOriginal: "Norway" },
            { nombre: "Finlandia", iso2: "FI", iso3: "FIN", codigoTel: "+358", nombreOriginal: "Finland" },
            { nombre: "Islandia", iso2: "IS", iso3: "ISL", codigoTel: "+354", nombreOriginal: "Iceland" },

            // EUROPA ORIENTAL
            { nombre: "Rusia", iso2: "RU", iso3: "RUS", codigoTel: "+7", nombreOriginal: "Russia" },
            { nombre: "Polonia", iso2: "PL", iso3: "POL", codigoTel: "+48", nombreOriginal: "Poland" },
            { nombre: "República Checa", iso2: "CZ", iso3: "CZE", codigoTel: "+420", nombreOriginal: "Czech Republic" },
            { nombre: "Eslovaquia", iso2: "SK", iso3: "SVK", codigoTel: "+421", nombreOriginal: "Slovakia" },
            { nombre: "Hungría", iso2: "HU", iso3: "HUN", codigoTel: "+36", nombreOriginal: "Hungary" },
            { nombre: "Rumania", iso2: "RO", iso3: "ROU", codigoTel: "+40", nombreOriginal: "Romania" },
            { nombre: "Bulgaria", iso2: "BG", iso3: "BGR", codigoTel: "+359", nombreOriginal: "Bulgaria" },
            { nombre: "Ucrania", iso2: "UA", iso3: "UKR", codigoTel: "+380", nombreOriginal: "Ukraine" },
            { nombre: "Bielorrusia", iso2: "BY", iso3: "BLR", codigoTel: "+375", nombreOriginal: "Belarus" },
            { nombre: "Moldavia", iso2: "MD", iso3: "MDA", codigoTel: "+373", nombreOriginal: "Moldova" },

            // EUROPA BALCÁNICA
            { nombre: "Grecia", iso2: "GR", iso3: "GRC", codigoTel: "+30", nombreOriginal: "Greece" },
            { nombre: "Albania", iso2: "AL", iso3: "ALB", codigoTel: "+355", nombreOriginal: "Albania" },
            { nombre: "Serbia", iso2: "RS", iso3: "SRB", codigoTel: "+381", nombreOriginal: "Serbia" },
            { nombre: "Montenegro", iso2: "ME", iso3: "MNE", codigoTel: "+382", nombreOriginal: "Montenegro" },
            { nombre: "Bosnia y Herzegovina", iso2: "BA", iso3: "BIH", codigoTel: "+387", nombreOriginal: "Bosnia and Herzegovina" },
            { nombre: "Croacia", iso2: "HR", iso3: "HRV", codigoTel: "+385", nombreOriginal: "Croatia" },
            { nombre: "Eslovenia", iso2: "SI", iso3: "SVN", codigoTel: "+386", nombreOriginal: "Slovenia" },
            { nombre: "Macedonia del Norte", iso2: "MK", iso3: "MKD", codigoTel: "+389", nombreOriginal: "North Macedonia" },

            // ASIA OCCIDENTAL/MEDIO ORIENTE
            { nombre: "Turquía", iso2: "TR", iso3: "TUR", codigoTel: "+90", nombreOriginal: "Turkey" },
            { nombre: "Israel", iso2: "IL", iso3: "ISR", codigoTel: "+972", nombreOriginal: "Israel" },
            { nombre: "Palestina", iso2: "PS", iso3: "PSE", codigoTel: "+970", nombreOriginal: "Palestine" },
            { nombre: "Líbano", iso2: "LB", iso3: "LBN", codigoTel: "+961", nombreOriginal: "Lebanon" },
            { nombre: "Siria", iso2: "SY", iso3: "SYR", codigoTel: "+963", nombreOriginal: "Syria" },
            { nombre: "Jordania", iso2: "JO", iso3: "JOR", codigoTel: "+962", nombreOriginal: "Jordan" },
            { nombre: "Irak", iso2: "IQ", iso3: "IRQ", codigoTel: "+964", nombreOriginal: "Iraq" },
            { nombre: "Irán", iso2: "IR", iso3: "IRN", codigoTel: "+98", nombreOriginal: "Iran" },
            { nombre: "Arabia Saudí", iso2: "SA", iso3: "SAU", codigoTel: "+966", nombreOriginal: "Saudi Arabia" },
            { nombre: "Emiratos Árabes Unidos", iso2: "AE", iso3: "ARE", codigoTel: "+971", nombreOriginal: "United Arab Emirates" },
            { nombre: "Qatar", iso2: "QA", iso3: "QAT", codigoTel: "+974", nombreOriginal: "Qatar" },
            { nombre: "Kuwait", iso2: "KW", iso3: "KWT", codigoTel: "+965", nombreOriginal: "Kuwait" },
            { nombre: "Bahrein", iso2: "BH", iso3: "BHR", codigoTel: "+973", nombreOriginal: "Bahrain" },
            { nombre: "Omán", iso2: "OM", iso3: "OMN", codigoTel: "+968", nombreOriginal: "Oman" },
            { nombre: "Yemen", iso2: "YE", iso3: "YEM", codigoTel: "+967", nombreOriginal: "Yemen" },

            // ASIA CENTRAL
            { nombre: "Kazajstán", iso2: "KZ", iso3: "KAZ", codigoTel: "+7", nombreOriginal: "Kazakhstan" },
            { nombre: "Uzbekistán", iso2: "UZ", iso3: "UZB", codigoTel: "+998", nombreOriginal: "Uzbekistan" },
            { nombre: "Turkmenistán", iso2: "TM", iso3: "TKM", codigoTel: "+993", nombreOriginal: "Turkmenistan" },
            { nombre: "Kirguistán", iso2: "KG", iso3: "KGZ", codigoTel: "+996", nombreOriginal: "Kyrgyzstan" },
            { nombre: "Tayikistán", iso2: "TJ", iso3: "TJK", codigoTel: "+992", nombreOriginal: "Tajikistan" },
            { nombre: "Afganistán", iso2: "AF", iso3: "AFG", codigoTel: "+93", nombreOriginal: "Afghanistan" },

            // ASIA DEL SUR
            { nombre: "India", iso2: "IN", iso3: "IND", codigoTel: "+91", nombreOriginal: "India" },
            { nombre: "Pakistán", iso2: "PK", iso3: "PAK", codigoTel: "+92", nombreOriginal: "Pakistan" },
            { nombre: "Bangladesh", iso2: "BD", iso3: "BGD", codigoTel: "+880", nombreOriginal: "Bangladesh" },
            { nombre: "Sri Lanka", iso2: "LK", iso3: "LKA", codigoTel: "+94", nombreOriginal: "Sri Lanka" },
            { nombre: "Nepal", iso2: "NP", iso3: "NPL", codigoTel: "+977", nombreOriginal: "Nepal" },
            { nombre: "Bután", iso2: "BT", iso3: "BTN", codigoTel: "+975", nombreOriginal: "Bhutan" },
            { nombre: "Maldivas", iso2: "MV", iso3: "MDV", codigoTel: "+960", nombreOriginal: "Maldives" },

            // ASIA ORIENTAL
            { nombre: "China", iso2: "CN", iso3: "CHN", codigoTel: "+86", nombreOriginal: "China" },
            { nombre: "Japón", iso2: "JP", iso3: "JPN", codigoTel: "+81", nombreOriginal: "Japan" },
            { nombre: "Corea del Sur", iso2: "KR", iso3: "KOR", codigoTel: "+82", nombreOriginal: "South Korea" },
            { nombre: "Corea del Norte", iso2: "KP", iso3: "PRK", codigoTel: "+850", nombreOriginal: "North Korea" },
            { nombre: "Mongolia", iso2: "MN", iso3: "MNG", codigoTel: "+976", nombreOriginal: "Mongolia" },
            { nombre: "Taiwán", iso2: "TW", iso3: "TWN", codigoTel: "+886", nombreOriginal: "Taiwan" },

            // SUDESTE ASIÁTICO
            { nombre: "Tailandia", iso2: "TH", iso3: "THA", codigoTel: "+66", nombreOriginal: "Thailand" },
            { nombre: "Vietnam", iso2: "VN", iso3: "VNM", codigoTel: "+84", nombreOriginal: "Vietnam" },
            { nombre: "Laos", iso2: "LA", iso3: "LAO", codigoTel: "+856", nombreOriginal: "Laos" },
            { nombre: "Camboya", iso2: "KH", iso3: "KHM", codigoTel: "+855", nombreOriginal: "Cambodia" },
            { nombre: "Myanmar", iso2: "MM", iso3: "MMR", codigoTel: "+95", nombreOriginal: "Myanmar" },
            { nombre: "Malasia", iso2: "MY", iso3: "MYS", codigoTel: "+60", nombreOriginal: "Malaysia" },
            { nombre: "Singapur", iso2: "SG", iso3: "SGP", codigoTel: "+65", nombreOriginal: "Singapore" },
            { nombre: "Indonesia", iso2: "ID", iso3: "IDN", codigoTel: "+62", nombreOriginal: "Indonesia" },
            { nombre: "Filipinas", iso2: "PH", iso3: "PHL", codigoTel: "+63", nombreOriginal: "Philippines" },
            { nombre: "Brunei", iso2: "BN", iso3: "BRN", codigoTel: "+673", nombreOriginal: "Brunei" },
            { nombre: "Timor Oriental", iso2: "TL", iso3: "TLS", codigoTel: "+670", nombreOriginal: "East Timor" },

            // ÁFRICA DEL NORTE
            { nombre: "Marruecos", iso2: "MA", iso3: "MAR", codigoTel: "+212", nombreOriginal: "Morocco" },
            { nombre: "Argelia", iso2: "DZ", iso3: "DZA", codigoTel: "+213", nombreOriginal: "Algeria" },
            { nombre: "Túnez", iso2: "TN", iso3: "TUN", codigoTel: "+216", nombreOriginal: "Tunisia" },
            { nombre: "Libia", iso2: "LY", iso3: "LBY", codigoTel: "+218", nombreOriginal: "Libya" },
            { nombre: "Egipto", iso2: "EG", iso3: "EGY", codigoTel: "+20", nombreOriginal: "Egypt" },
            { nombre: "Sudán", iso2: "SD", iso3: "SDN", codigoTel: "+249", nombreOriginal: "Sudan" },
            { nombre: "Sudán del Sur", iso2: "SS", iso3: "SSD", codigoTel: "+211", nombreOriginal: "South Sudan" },

            // ÁFRICA OCCIDENTAL
            { nombre: "Mauritania", iso2: "MR", iso3: "MRT", codigoTel: "+222", nombreOriginal: "Mauritania" },
            { nombre: "Mali", iso2: "ML", iso3: "MLI", codigoTel: "+223", nombreOriginal: "Mali" },
            { nombre: "Burkina Faso", iso2: "BF", iso3: "BFA", codigoTel: "+226", nombreOriginal: "Burkina Faso" },
            { nombre: "Níger", iso2: "NE", iso3: "NER", codigoTel: "+227", nombreOriginal: "Niger" },
            { nombre: "Chad", iso2: "TD", iso3: "TCD", codigoTel: "+235", nombreOriginal: "Chad" },
            { nombre: "Senegal", iso2: "SN", iso3: "SEN", codigoTel: "+221", nombreOriginal: "Senegal" },
            { nombre: "Gambia", iso2: "GM", iso3: "GMB", codigoTel: "+220", nombreOriginal: "Gambia" },
            { nombre: "Guinea-Bissau", iso2: "GW", iso3: "GNB", codigoTel: "+245", nombreOriginal: "Guinea-Bissau" },
            { nombre: "Guinea", iso2: "GN", iso3: "GIN", codigoTel: "+224", nombreOriginal: "Guinea" },
            { nombre: "Sierra Leona", iso2: "SL", iso3: "SLE", codigoTel: "+232", nombreOriginal: "Sierra Leone" },
            { nombre: "Liberia", iso2: "LR", iso3: "LBR", codigoTel: "+231", nombreOriginal: "Liberia" },
            { nombre: "Costa de Marfil", iso2: "CI", iso3: "CIV", codigoTel: "+225", nombreOriginal: "Ivory Coast" },
            { nombre: "Ghana", iso2: "GH", iso3: "GHA", codigoTel: "+233", nombreOriginal: "Ghana" },
            { nombre: "Togo", iso2: "TG", iso3: "TGO", codigoTel: "+228", nombreOriginal: "Togo" },
            { nombre: "Benín", iso2: "BJ", iso3: "BEN", codigoTel: "+229", nombreOriginal: "Benin" },
            { nombre: "Nigeria", iso2: "NG", iso3: "NGA", codigoTel: "+234", nombreOriginal: "Nigeria" },

            // ÁFRICA CENTRAL
            { nombre: "Camerún", iso2: "CM", iso3: "CMR", codigoTel: "+237", nombreOriginal: "Cameroon" },
            { nombre: "República Centroafricana", iso2: "CF", iso3: "CAF", codigoTel: "+236", nombreOriginal: "Central African Republic" },
            { nombre: "Guinea Ecuatorial", iso2: "GQ", iso3: "GNQ", codigoTel: "+240", nombreOriginal: "Equatorial Guinea" },
            { nombre: "Gabón", iso2: "GA", iso3: "GAB", codigoTel: "+241", nombreOriginal: "Gabon" },
            { nombre: "República del Congo", iso2: "CG", iso3: "COG", codigoTel: "+242", nombreOriginal: "Republic of the Congo" },
            { nombre: "República Democrática del Congo", iso2: "CD", iso3: "COD", codigoTel: "+243", nombreOriginal: "Democratic Republic of the Congo" },
            { nombre: "Angola", iso2: "AO", iso3: "AGO", codigoTel: "+244", nombreOriginal: "Angola" },

            // ÁFRICA ORIENTAL
            { nombre: "Etiopía", iso2: "ET", iso3: "ETH", codigoTel: "+251", nombreOriginal: "Ethiopia" },
            { nombre: "Eritrea", iso2: "ER", iso3: "ERI", codigoTel: "+291", nombreOriginal: "Eritrea" },
            { nombre: "Yibuti", iso2: "DJ", iso3: "DJI", codigoTel: "+253", nombreOriginal: "Djibouti" },
            { nombre: "Somalia", iso2: "SO", iso3: "SOM", codigoTel: "+252", nombreOriginal: "Somalia" },
            { nombre: "Kenia", iso2: "KE", iso3: "KEN", codigoTel: "+254", nombreOriginal: "Kenya" },
            { nombre: "Uganda", iso2: "UG", iso3: "UGA", codigoTel: "+256", nombreOriginal: "Uganda" },
            { nombre: "Tanzania", iso2: "TZ", iso3: "TZA", codigoTel: "+255", nombreOriginal: "Tanzania" },
            { nombre: "Ruanda", iso2: "RW", iso3: "RWA", codigoTel: "+250", nombreOriginal: "Rwanda" },
            { nombre: "Burundi", iso2: "BI", iso3: "BDI", codigoTel: "+257", nombreOriginal: "Burundi" },

            // ÁFRICA AUSTRAL
            { nombre: "Sudáfrica", iso2: "ZA", iso3: "ZAF", codigoTel: "+27", nombreOriginal: "South Africa" },
            { nombre: "Namibia", iso2: "NA", iso3: "NAM", codigoTel: "+264", nombreOriginal: "Namibia" },
            { nombre: "Botsuana", iso2: "BW", iso3: "BWA", codigoTel: "+267", nombreOriginal: "Botswana" },
            { nombre: "Zimbabue", iso2: "ZW", iso3: "ZWE", codigoTel: "+263", nombreOriginal: "Zimbabwe" },
            { nombre: "Zambia", iso2: "ZM", iso3: "ZMB", codigoTel: "+260", nombreOriginal: "Zambia" },
            { nombre: "Malawi", iso2: "MW", iso3: "MWI", codigoTel: "+265", nombreOriginal: "Malawi" },
            { nombre: "Mozambique", iso2: "MZ", iso3: "MOZ", codigoTel: "+258", nombreOriginal: "Mozambique" },
            { nombre: "Madagascar", iso2: "MG", iso3: "MDG", codigoTel: "+261", nombreOriginal: "Madagascar" },
            { nombre: "Mauricio", iso2: "MU", iso3: "MUS", codigoTel: "+230", nombreOriginal: "Mauritius" },
            { nombre: "Seychelles", iso2: "SC", iso3: "SYC", codigoTel: "+248", nombreOriginal: "Seychelles" },
            { nombre: "Comoras", iso2: "KM", iso3: "COM", codigoTel: "+269", nombreOriginal: "Comoros" },
            { nombre: "Lesoto", iso2: "LS", iso3: "LSO", codigoTel: "+266", nombreOriginal: "Lesotho" },
            { nombre: "Suazilandia", iso2: "SZ", iso3: "SWZ", codigoTel: "+268", nombreOriginal: "Swaziland" },

            // OCEANÍA
            { nombre: "Australia", iso2: "AU", iso3: "AUS", codigoTel: "+61", nombreOriginal: "Australia" },
            { nombre: "Nueva Zelanda", iso2: "NZ", iso3: "NZL", codigoTel: "+64", nombreOriginal: "New Zealand" },
            { nombre: "Papúa Nueva Guinea", iso2: "PG", iso3: "PNG", codigoTel: "+675", nombreOriginal: "Papua New Guinea" },
            { nombre: "Fiji", iso2: "FJ", iso3: "FJI", codigoTel: "+679", nombreOriginal: "Fiji" },
            { nombre: "Islas Salomón", iso2: "SB", iso3: "SLB", codigoTel: "+677", nombreOriginal: "Solomon Islands" },
            { nombre: "Vanuatu", iso2: "VU", iso3: "VUT", codigoTel: "+678", nombreOriginal: "Vanuatu" },
            { nombre: "Nueva Caledonia", iso2: "NC", iso3: "NCL", codigoTel: "+687", nombreOriginal: "New Caledonia" },
            { nombre: "Samoa", iso2: "WS", iso3: "WSM", codigoTel: "+685", nombreOriginal: "Samoa" },
            { nombre: "Tonga", iso2: "TO", iso3: "TON", codigoTel: "+676", nombreOriginal: "Tonga" },
            { nombre: "Kiribati", iso2: "KI", iso3: "KIR", codigoTel: "+686", nombreOriginal: "Kiribati" },
            { nombre: "Tuvalu", iso2: "TV", iso3: "TUV", codigoTel: "+688", nombreOriginal: "Tuvalu" },
            { nombre: "Nauru", iso2: "NR", iso3: "NRU", codigoTel: "+674", nombreOriginal: "Nauru" },
            { nombre: "Palau", iso2: "PW", iso3: "PLW", codigoTel: "+680", nombreOriginal: "Palau" },
            { nombre: "Estados Federados de Micronesia", iso2: "FM", iso3: "FSM", codigoTel: "+691", nombreOriginal: "Micronesia" },
            { nombre: "Islas Marshall", iso2: "MH", iso3: "MHL", codigoTel: "+692", nombreOriginal: "Marshall Islands" }
        ];
    };

    // Debounce para las búsquedas
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchCountries(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [value]);

    // Manejar teclas (navegación y selección)
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
                    selectCountry(suggestions[selectedIndex]);
                }
                break;

            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Seleccionar país de la lista
    const selectCountry = (country) => {
        console.log('🌍 País seleccionado:', country);

        // Actualizar el campo de nombre
        onChange(country.nombre);

        // Notificar al componente padre con todos los datos
        if (onCountrySelect) {
            onCountrySelect({
                nombre_pais: country.nombre,
                codigo_iso2: country.iso2,
                codigo_iso3: country.iso3,
                codigo_telefono: country.codigoTel
            });
        }

        // Ocultar sugerencias
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    return e('div', {
        style: {
            position: 'relative',
            width: '100%'
        }
    }, [
        // Input principal
        e('input', {
            key: 'country-input',
            ref: inputRef,
            type: 'text',
            value: value,
            placeholder: placeholder || 'Escriba el nombre del país...',
            onChange: (e) => onChange(e.target.value),
            onKeyDown: handleKeyDown,
            onFocus: () => {
                if (suggestions.length > 0) {
                    setShowSuggestions(true);
                }
            },
            style: {
                ...style,
                paddingRight: isLoading ? '3rem' : '2.5rem'
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
            : Icons.globe()
        ),

        // Lista de sugerencias
        showSuggestions && suggestions.length > 0 && e('div', {
            key: 'suggestions',
            ref: suggestionsRef,
            style: {
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '2px'
            }
        }, suggestions.map((country, index) =>
            e('div', {
                key: `suggestion-${country.iso2}-${index}`,
                onClick: () => selectCountry(country),
                style: {
                    padding: '0.75rem 1rem',
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
                // Información del país
                e('div', {
                    key: 'country-info',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.1rem'
                    }
                }, [
                    e('div', {
                        key: 'country-name',
                        style: {
                            fontWeight: '500',
                            color: '#111827',
                            fontSize: '0.875rem'
                        }
                    }, country.nombre),
                    e('div', {
                        key: 'country-codes',
                        style: {
                            fontSize: '0.75rem',
                            color: '#6b7280'
                        }
                    }, `${country.iso2} • ${country.iso3}${country.codigoTel ? ' • ' + country.codigoTel : ''}`)
                ]),

                // Indicador visual
                e('div', {
                    key: 'country-indicator',
                    style: {
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        opacity: 0.7
                    }
                })
            ])
        ))
    ]);
}

export default CountryAutocomplete;
