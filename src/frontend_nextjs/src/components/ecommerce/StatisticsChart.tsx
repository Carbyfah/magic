"use client";
import dynamic from 'next/dynamic';
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";

// Cargar Chart dinámicamente para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function StatisticsChart() {
  const options: ApexOptions = {
    legend: {
      show: false, // Ocultar leyenda
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"], // Definir colores de línea
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line", // Establecer el tipo de gráfico a 'línea'
      toolbar: {
        show: false, // Ocultar barra de herramientas del gráfico
      },
    },
    stroke: {
      curve: "straight", // Definir el estilo de línea (straight, smooth, o step)
      width: [2, 2], // Ancho de línea para cada conjunto de datos
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Tamaño de los puntos marcadores
      strokeColors: "#fff", // Color del borde del marcador
      strokeWidth: 2,
      hover: {
        size: 6, // Tamaño del marcador al pasar el mouse
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Ocultar líneas de cuadrícula en el eje x
        },
      },
      yaxis: {
        lines: {
          show: true, // Mostrar líneas de cuadrícula en el eje y
        },
      },
    },
    dataLabels: {
      enabled: false, // Deshabilitar etiquetas de datos
    },
    tooltip: {
      enabled: true, // Habilitar tooltip
      x: {
        format: "dd MMM yyyy", // Formato para el tooltip del eje x
      },
    },
    xaxis: {
      type: "category", // Eje x basado en categorías
      categories: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ],
      axisBorder: {
        show: false, // Ocultar borde del eje x
      },
      axisTicks: {
        show: false, // Ocultar marcas del eje x
      },
      tooltip: {
        enabled: false, // Deshabilitar tooltip para puntos del eje x
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Ajustar tamaño de fuente para etiquetas del eje y
          colors: ["#6B7280"], // Color de las etiquetas
        },
      },
      title: {
        text: "", // Remover título del eje y
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Ventas",
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    },
    {
      name: "Ingresos",
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Estadísticas
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Meta que has establecido para cada mes
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
