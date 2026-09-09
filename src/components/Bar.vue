<template>
  <div class="line-chart-container">
    <Line
      :options="chartOptions"
      :data="chartData"
    />
  </div>
</template>

<script>
import { Line } from "vue-chartjs";

import {
  Chart as ChartJS,
  Tooltip,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from "chart.js";

ChartJS.register(
  Tooltip,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
);

export default {
  name: "LineChart",

  components: {
    Line,
  },

  props: {
    dataArray: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  computed: {
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,

        animation: {
          duration: 700,
          easing: "easeOutQuart",
        },

        interaction: {
          mode: "index",
          intersect: false,
        },

        layout: {
          padding: {
            top: 12,
            right: 10,
            bottom: 2,
            left: 4,
          },
        },

        plugins: {
          legend: {
            display: false,
          },

          tooltip: {
            enabled: true,
            displayColors: false,
            backgroundColor: "#0f172a",
            titleColor: "#94a3b8",
            bodyColor: "#ffffff",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 9,
            caretSize: 6,
            titleFont: {
              size: 11,
              weight: "600",
            },
            bodyFont: {
              size: 13,
              weight: "700",
            },

            callbacks: {
              title: (tooltipItems) => {
                return tooltipItems[0]?.label || "";
              },

              label: (context) => {
                const value = Number(context.parsed.y) || 0;
                return `Ingresos: ${this.formatCurrency(value)}`;
              },
            },
          },
        },

        scales: {
          x: {
            border: {
              display: false,
            },

            grid: {
              display: false,
              drawBorder: false,
            },

            ticks: {
              color: "#94a3b8",
              font: {
                size: 10,
                weight: "600",
              },
              padding: 9,
              maxRotation: 0,
              minRotation: 0,

              callback: function (value) {
                const label = this.getLabelForValue(value);

                const abbreviatedMonths = {
                  Enero: "Ene",
                  Febrero: "Feb",
                  Marzo: "Mar",
                  Abril: "Abr",
                  Mayo: "May",
                  Junio: "Jun",
                  Julio: "Jul",
                  Agosto: "Ago",
                  Septiembre: "Sep",
                  Octubre: "Oct",
                  Noviembre: "Nov",
                  Diciembre: "Dic",
                };

                return abbreviatedMonths[label] || label;
              },
            },
          },

          y: {
            beginAtZero: true,

            border: {
              display: false,
            },

            grid: {
              color: "rgba(148, 163, 184, 0.16)",
              drawTicks: false,
              lineWidth: 1,
            },

            ticks: {
              color: "#94a3b8",
              padding: 10,
              maxTicksLimit: 5,

              font: {
                size: 10,
                weight: "600",
              },

              callback: (value) => {
                return this.formatCompactNumber(value);
              },
            },
          },
        },
      };
    },

    chartData() {
      return {
        labels: [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ],

        datasets: [
          {
            label: "Ingresos",
            data: this.normalizedData,

            borderColor: "#2454d6",
            borderWidth: 2.5,
            borderCapStyle: "round",
            borderJoinStyle: "round",

            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;

              if (!chartArea) {
                return "rgba(36, 84, 214, 0.12)";
              }

              const gradient = ctx.createLinearGradient(
                0,
                chartArea.top,
                0,
                chartArea.bottom
              );

              gradient.addColorStop(0, "rgba(36, 84, 214, 0.24)");
              gradient.addColorStop(0.55, "rgba(53, 184, 232, 0.08)");
              gradient.addColorStop(1, "rgba(36, 84, 214, 0)");

              return gradient;
            },

            fill: true,
            tension: 0.38,

            pointRadius: 0,
            pointHoverRadius: 5,
            pointHitRadius: 15,

            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#2454d6",
            pointBorderWidth: 2.5,

            hoverBorderWidth: 3,
          },
        ],
      };
    },

    normalizedData() {
      const values = Array.isArray(this.dataArray)
        ? this.dataArray
        : [];

      return Array.from({ length: 12 }, (_, index) => {
        const value = Number(values[index]);
        return Number.isFinite(value) ? value : 0;
      });
    },
  },

  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(value);
    },

    formatCompactNumber(value) {
      const number = Number(value) || 0;
      const absoluteValue = Math.abs(number);

      if (absoluteValue >= 1000000000) {
        return `$${this.removeTrailingZero(number / 1000000000)} mil M`;
      }

      if (absoluteValue >= 1000000) {
        return `$${this.removeTrailingZero(number / 1000000)} M`;
      }

      if (absoluteValue >= 1000) {
        return `$${this.removeTrailingZero(number / 1000)} mil`;
      }

      return `$${number.toLocaleString("es-CL")}`;
    },

    removeTrailingZero(value) {
      return value.toLocaleString("es-CL", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
    },
  },
};
</script>

<style scoped>
.line-chart-container {
  position: relative;
  width: 100%;
  height: 285px;
  min-height: 285px;
}

.line-chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 959px) {
  .line-chart-container {
    height: 270px;
    min-height: 270px;
  }
}

@media (max-width: 600px) {
  .line-chart-container {
    height: 245px;
    min-height: 245px;
  }
}
</style>