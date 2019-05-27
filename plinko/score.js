const PREDICTION_POINT = 300;
const k = 3;
const outputs = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel]);
}

function runAnalysis() {
  function distance(point) {
    return Math.abs(point - PREDICTION_POINT);
  }

  const bucket = _.chain(outputs)
    .map(row => [distance(row[0]), row[3]])
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
    .value();

  console.log(`Your point will probably fall into bucket ${bucket}`);
}
