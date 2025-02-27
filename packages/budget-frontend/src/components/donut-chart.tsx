import Chart from "chart.js/auto";
import { Button } from "components";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";

Chart.defaults.font.family = "Roboto";
Chart.defaults.font.size = 12;

export const DonutChart = (props: any) => {
  const [showBack, setShowBack] = createSignal(false);
  let canvas;
  let chartInstance: any;

  createEffect(() => {
    const data = props.data();
    if (chartInstance) {
      updateChart(data);
    }
  });

  onMount(() => {
    requestAnimationFrame(() => {
      const ctx = canvas!.getContext("2d");

      const labels = props.data().map((item: any) => item.name);

      const values = props.data().map((item: any) => item.total);
      const colors = props.data().map((item: any) => item.color);

      chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "nearest",
          },
          events: ["click", "touchstart"],
          onClick: (event: any, elements: any) => {
            if (showBack()) return;
            updateChart(props.data()[elements[0].index].subCategories);
          },
        },
      });
    });
  });

  const updateChart = (categories: any[]) => {
    props.setVisibleData(categories);

    setShowBack(!categories?.at(0).subCategories);

    const labels = categories.map((item: any) => item.name);
    const values = categories.map((item: any) => item.total);
    const colors = categories.map((item: any) => item.color);

    chartInstance.data = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
        },
      ],
    };

    chartInstance.update();
  };

  onCleanup(() => {
    if (chartInstance) chartInstance.destroy();
  });

  return (
    <div>
      <div style="position:relative; height:200px; width:100%;">
        <canvas ref={canvas} />
      </div>
      <Show when={showBack()}>
        <Button
          type="neutral"
          class="btn-sm btn-ghost"
          onClick={() => {
            updateChart(props.initialData);
            setShowBack(false);
          }}
          label="Back to categories"
        />
      </Show>
    </div>
  );
};
