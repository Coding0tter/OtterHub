import Chart from "chart.js/auto";
import { onCleanup, onMount } from "solid-js";

Chart.defaults.font.family = "Roboto";
Chart.defaults.font.size = 12;

export const OverallProgressChart = (props: any) => {
  let canvas;
  let chartInstance: any;

  onMount(() => {
    const ctx = canvas!.getContext("2d");

    const labels = props.data?.map((item: any) =>
      new Date(item._id).toLocaleDateString(),
    );
    const avgWeights = props.data?.map((item: any) => item.avgWeight);

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Avg Weight",
            data: avgWeights,
            borderColor: "#8be9fd",
            fill: false,
            tension: 0.2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            title: { display: true, text: "Date" },
          },
          y: {
            display: true,
            title: { display: true, text: "Weight" },
          },
        },
      },
    });
  });

  onCleanup(() => {
    if (chartInstance) chartInstance.destroy();
  });

  return (
    <div style="position: relative; height:200px; width:100%;">
      <canvas ref={canvas} />
    </div>
  );
};
