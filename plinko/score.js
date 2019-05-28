const outputs = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel]);
}

function runAnalysis() {
  // more guesses = more accuracy, but slower
  const testSetSize = 100;
  const k = 10;
  const features = 3;

  checkByFeature(k, testSetSize);
  checkByK(features, testSetSize);
}

function checkByK(features, testSetSize) {
  // can do this with k as well to see what is best sample size
  // for this range do a feature accuracy gauge
  _.range(1, 20).forEach(k => {
    // run normalization, get sets
    const [testSet, trainingSet] = splitDataset(
      minMax(outputs, features),
      testSetSize
    );

    const accuracy = _.chain(testSet)
      .filter(
        testPoint =>
          knn(trainingSet, _.initial(testPoint), k) === _.last(testPoint)
      )
      .size()
      .divide(testSetSize)
      .value();

    console.log(`For k of ${k}, accuracy is: ${accuracy}`);
  });
}

function checkByFeature(k, testSetSize) {
  // can do this with k as well to see what is best sample size
  // for this range do a feature accuracy gauge
  _.range(0, 3).forEach(feature => {
    const data = _.map(outputs, row => [row[feature], _.last(row)]);
    // run normalization, get sets
    const [testSet, trainingSet] = splitDataset(minMax(data, 1), testSetSize);

    const accuracy = _.chain(testSet)
      .filter(
        testPoint =>
          knn(trainingSet, _.initial(testPoint), k) === _.last(testPoint)
      )
      .size()
      .divide(testSetSize)
      .value();

    console.log(`For feature of ${feature}, accuracy is: ${accuracy}`);
  });
}

// use training data with new test point everytime
// k = number of closest variables to compare with
function knn(data, point, k) {
  // point will not have label on it
  return (
    _.chain(data)
      // pass feature sets to our data, label last
      .map(row => {
        return [distance(_.initial(row), point), _.last(row)];
      })
      .sortBy(row => row[0])
      // get closest vals
      .slice(0, k)
      // create dict of frequency
      .countBy(row => row[1])
      .toPairs()
      // sort by least frequent
      .sortBy(row => row[1])
      // get last elem
      .last()
      // get key of last elem ["4", 2]
      .first()
      .parseInt()
      .value()
  );
}

// take comparison point and test set point across multiple spectrums
function distance(pointA, pointB) {
  // use pyth theorum
  // points arr with multiple numbers in it
  return (
    _.chain(pointA)
      // lodash zip - combine like indexes together to get exponents
      .zip(pointB)
      // expo them
      .map(([a, b]) => (a - b) ** 2)
      // add to sum
      .sum()
      // get sqrt
      .value() ** 0.5
  );
}

// split data to test and training sets
function splitDataset(data, testCount) {
  // shuffle data to make sure we get data from all positions
  const shuffled = _.shuffle(data);

  // split in two
  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);

  return [testSet, trainingSet];
}

// feature count - relay how many columns we want to normalize
function minMax(data, featureCount) {
  // clone before manipulating to not mod original
  const clonedData = _.cloneDeep(data);

  // iterate over each feature
  for (let i = 0; i < featureCount; i++) {
    // column = arr of numbers
    const column = clonedData.map(row => row[i]);
    const min = _.min(column);
    const max = _.max(column);

    // iterate over each row
    for (let j = 0; j < clonedData.length; j++) {
      // normalize in place
      clonedData[j][i] = (clonedData[j][i] - min) / (max - min);
    }
  }
  return clonedData;
}
