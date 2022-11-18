/* ------------------------------------------------------------------------
1. GET CAR DATA & REQUIRED VARIABLES
*/
async function getData() {
    const carsDataResponse = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
    const carsData = await carsDataResponse.json();
    const cleaned = carsData.map(car => ({
      kmpg: car.Miles_per_Gallon * 1.6,
      horsepower: car.Horsepower,
    }))
    .filter(car => (car.kmpg != null && car.horsepower != null));
  
    return cleaned;
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

  const tensorData = convertToTensor(data);
  const { inputs, labels } = tensorData;

  await trainModel(model, inputs, labels);
  console.log("Done Training");

  testModel(model, data, tensorData);
//   chart.render();

}
// document.addEventListener('DOMContentLoaded', visualize);
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

    const inputs = data.map((d) => d.horsepower);
    const labels = data.map((d) => d.kmpg);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor
      .sub(labelMin)
      .div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    };
  });
}

/* ------------------------------------------------------------------------
  5. MODEL TRAINING
*/
async function trainModel(model, inputs, labels) {
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ["mse"],
  });

  const batchSize = 32;
  const epochs = 50;

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: "Training Performance" },
      ["loss", "mse"],
      { height: 200, callbacks: ["onEpochEnd"] }
    ),
  });
}

/* ------------------------------------------------------------------------
  6. MODEL TESTING
*/
function testModel(model, inputData, normalizationData) {
    const {inputMax, inputMin, labelMin, labelMax} = normalizationData;
 
    const [xs, preds] = tf.tidy(() => {
  
      const xs = tf.linspace(0, 1, 100);
      const preds = model.predict(xs.reshape([100, 1]));
  
      const unNormXs = xs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);
  
      const unNormPreds = preds
        .mul(labelMax.sub(labelMin))
        .add(labelMin);
  
      // Un-normalize the data
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });
  
  
    const predictedPoints = Array.from(xs).map((val, i) => {
      return {x: val, y: preds[i]}
    });
  
    const originalPoints = inputData.map(d => ({
      x: d.horsepower, y: d.kmpg,
    }));
  


  //Render Data
  var updatedData = {
    series: [
      {
        name: "Original Data",
        data: originalPoints,
      },
      {
        name: "Predicted Data",
        type: 'line',
        data: predictedPoints,
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
  var chart = new ApexCharts(document.querySelector("#chart"), updatedData);
  chart.render();
  }