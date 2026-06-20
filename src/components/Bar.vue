<template>
  <v-container style="height: 300px;" fluid>
    <Line :options="chartOptions" :data="chartData" />
  </v-container>
</template>

<script>
import { Line } from "vue-chartjs";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
);

export default {
  name: "LineChart",

  props: {
    dataArray: {
      type: Array,
      required: true,
    },
  },

  components: {
    Line,
  },

  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: "index",
          intersect: false,
        },

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          x: {
            grid: {
              display: false,
            },
          },

          y: {
            grid: {
              color: "#E5E7EB",
            },
            beginAtZero: true,
          },
        },
      },
    };
  },

  computed: {
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
            label: "Ingresado",
            borderWidth: 0.5,
            data: this.dataArray,

            borderColor: "#1976D2",

            backgroundColor: "rgba(25,118,210,0.15)",

            fill: true,

            tension: 0.4,

            pointRadius: 5,

            pointHoverRadius: 8,

            pointBackgroundColor: "#1976D2",

            pointBorderColor: "#FFFFFF",

            pointBorderWidth: 2,
          },
        ],
      };
    },
  },
};
</script>