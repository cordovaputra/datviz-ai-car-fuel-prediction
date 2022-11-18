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
    series: [
      {
        name: "X: Kilometer per Gallon • Y: Horsepower",
        data: values,
      },
    ],

    chart: {
      height: 700,
      type: "scatter",
      zoom: {
        enabled: true,
        type: "xy",
      },
    },
    xaxis: {
      tickAmount: 10,
      type: "category",
      labels: {
        formatter: function (val) {
          return parseFloat(val).toFixed(1);
        },
      },
    },
    yaxis: {
      tickAmount: 7,
    },
    title: {
      text: "Horsepower v Kilometer per Gallon",
      align: "center",
    },
  };
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}
visualize();

/* ------------------------------------------------------------------------
  3. DEFINE MODEL ARCHITECTURE & CREATE THE MODEL
*/

function createModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true })); //Input layer
  model.add(tf.layers.dense({ units: 1, useBias: true })); //Output layer

  return model;
}

const model = createModel();
tfvis.show.modelSummary({ name: "Model Summary" }, model);

/* ------------------------------------------------------------------------
  4. PREPARE THE DATA FOR TRAINING
*/
 function convertToTensor(data) {
  
    return tf.tidy(() => {
      tf.util.shuffle(data);
  
      const inputs = data.map(d => d.horsepower)
      const labels = data.map(d => d.mpg);
  
      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
  
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();
  
      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
  
      return {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      }
    });
  }