/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const dataTable = [];
let sparklineData = [];
const exampleSparkline = document.getElementById('example-sparkline')

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function (msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

function connectCallback () {
  client.subscribe('/fx/prices', (message) => {
    const data = JSON.parse(message.body);
    data.timestamp = new Date().getTime();
    dataTable.push(data);
    dataTable.sort((a, b) => a.timestamp - b.timestamp)
    sparklineData = [];
    drawSparkline()
    dataTable.sort((a, b) => b.lastChangeBid - a.lastChangeBid)
    showData()
  });
}

client.connect({}, connectCallback, function (error) {
  alert(error.headers.message)
})

const showData = () => {
  const data = document.getElementById('data-to-show');
  data.innerHTML = '';
  dataTable.forEach(item => data.innerHTML += createLine(item))
}

const createLine = (data) => {
  return `
  <div class="data-table">
  <div>${data.name}</div>
  <div>${data.bestBid}</div>
  <div>${data.bestAsk}</div>
  <div>${data.lastChangeBid}</div>
  <div>${data.lastChangeAsk}</div>
  </div>`;
}

const drawSparkline = () => {
  const now = new Date();
  const nowMinus30Sec = new Date(now - 30000);
  dataTable.forEach((item) => {
    if (item.timestamp > nowMinus30Sec && item.timestamp < now) {
      const average = (item.bestBid + item.bestAsk) / 2;
      sparklineData.push(average)
    }
  })
  Sparkline.draw(exampleSparkline, sparklineData)

}