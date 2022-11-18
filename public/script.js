
/* ------------------------------------------------------------------------
1. GET CAR DATA & REQUIRED VARIABLES
*/
async function getData() {
    const carsDataRawSource = await fetch(
      "https://storage.googleapis.com/tfjs-tutorials/carsData.json"
    );
    const carsDataProcessing = await carsDataRawSource.json();
    const carsDataClaned = carsDataProcessing
      .map((car) => ({
        kmpg: car.Miles_per_Gallon * 1.6,
        horsepower: car.Horsepower,
      }))
      //Remove any pre-defined data that doesn't contain kmpg and horsepower data units
      .filter((car) => car.kmpg != null && car.horsepower != null);
    return carsDataClaned;
  }
  
  /* ------------------------------------------------------------------------
  2. DATA VISUALIZATION
  */
  async function visualize() {
    const data = await getData();
    const values = data.map((d) => ({
      x: d.kmpg,
      y: d.horsepower,
    }));

    //Render Data
    var options = {
        series: [{
        name: "X: Kilometer per Gallon • Y: Horsepower",
        data: values 
        }],
      chart: {
        height: 700,
        type: 'scatter', 
        zoom: {
          enabled: true,
          type: 'xy'
        }
      },
      xaxis: {
        tickAmount: 10, 
        labels: {
          formatter: function(val) {
            return parseFloat(val).toFixed(1)
          }
        }
      },
      yaxis: {
        tickAmount: 7
      },
      title: {
        text: 'Horsepower v Kilometer per Gallon',
        align: 'center'
      },
    };
    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  }
visualize();


