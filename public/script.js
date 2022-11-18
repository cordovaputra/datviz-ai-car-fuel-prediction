/* 
1. GET CAR DATA & REQUIRED VARIABLES
*/
async function getData() {
  const carsDataRawSource = await fetch(
    "https://storage.googleapis.com/tfjs-tutorials/carsData.json"
  );
  const carsDataProcessing = await carsDataRawSource.json();
  const carsDataClaned = carsDataProcessing
    .map((car) => ({
      kmpg: car.Miles_per_Gallon,
      horsepower: car.Horsepower,
    }))
    //Remove any pre-defined data that doesn't contain kmpg and horsepower data units
    .filter((car) => car.kmpg != null && car.horsepower != null);
  return carsDataClaned;
}

/* 
2. DATA VISUALIZATION
*/
async function visualize() {
  const data = await getData();
  const values = data.map((d) => ({
    x: d.horsepower,
    y: d.kmpg,
  }));

  //Render Data
  var options = {
    series: [
      {
        name: "Horsepower v KMPG",
        data: [
          [0.0, 0.0], //min x, min y
          
          [200.0, 20.0], //max x, max y
        ],
      },
    ],
    chart: {
      height: 350,
      type: "scatter",
      zoom: {
        enabled: true,
        type: "xy",
      },
    },
    xaxis: {
      tickAmount: 10,
      labels: {
        formatter: function (val) {
          return parseFloat(val).toFixed(1);
        },
      },
    },
    yaxis: {
      tickAmount: 7,
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}
visualize();

//   async function visualize() {
//     const data = await getData();
//     const values = data.map((d) => ({
//       x: d.horsepower,
//       y: d.kmpg,
//     }));
//     //Render Data
//     tfvis.render.scatterplot(
//       {name: 'Horsepower v MPG'},
//       {values},
//       {
//         xLabel: 'Horsepower',
//         yLabel: 'MPG',
//         height: 300
//       }
//     );
//     var options = {
//       series: [
//         {
//           name: "Horsepower v KMPG",
//           data: [
//             [1.7, 11],
//           ],
//         },
//       ],
//       chart: {
//         height: 350,
//         type: "scatter",
//         zoom: {
//           enabled: true,
//           type: "xy",
//         },
//       },
//       xaxis: {
//         tickAmount: 10,
//         labels: {
//           formatter: function (data) {
//             return parseFloat(data).toFixed(1);
//           },
//         },
//       },
//       yaxis: {
//         tickAmount: 7,
//       },
//     };

//     var chart = new ApexCharts(document.querySelector("#chart"), options);
//     chart.render();
//   }
//   // document.addEventListener('DOMContentLoaded', visualize);
//   visualize();
