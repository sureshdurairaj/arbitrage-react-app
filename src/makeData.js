// import zebpayData from "./zebpay";
//import wazirxData from "./wazirx";
// import bitbnsData from "./bitbns";
// https://api.wazirx.com/sapi/v1/tickers/24hr
// https://www.zebapi.com/pro/v1/market
// https://bitbns.com/order/getTickerWithVolume 

async function getAPI(){
  let bitbnsData = [], wazirxData = [], zebpayData = [];
  try {
    const responseBitbns = await fetch('https://bitbns.com/order/getTickerWithVolume');
    bitbnsData = await responseBitbns.json() || [];
  }
  catch(e) {
    console.log('bitbns fetch error: ', e);
  }
  try {
  const responseWazirx = await fetch('https://api.wazirx.com/sapi/v1/tickers/24hr');
  wazirxData = await responseWazirx.json() || [];
}
catch(e) {
  console.log('wazirx fetch error: ', e);
}
try {
  const responseZebPay = await fetch('https://www.zebapi.com/pro/v1/market');
  zebpayData = await responseZebPay.json() || [];
}
catch(e) {
  console.log('zebpay fetch error: ', e);
}
  // console.log('bitbnsData', bitbnsData);
  return [zebpayData, wazirxData, bitbnsData];
}

function removeStorage(name) {
  try {
      localStorage.removeItem(name);
      localStorage.removeItem(name + '_expiresIn');
  } catch(e) {
      console.log('removeStorage: Error removing key ['+ name + '] from localStorage: ' + JSON.stringify(e) );
      return false;
  }
  return true;
}

function getStorage(key) {

  var now = Date.now();  //epoch time, lets deal only with integer
  // set expiration for storage
  var expiresIn = localStorage.getItem(key+'_expiresIn');
  if (expiresIn===undefined || expiresIn===null) { expiresIn = 0; }

  if (expiresIn < now) {// Expired
      removeStorage(key);
      return null;
  } else {
      try {
          var value = localStorage.getItem(key);
          return value;
      } catch(e) {
          console.log('getStorage: Error reading key ['+ key + '] from localStorage: ' + JSON.stringify(e) );
          return null;
      }
  }
}

function setStorage(key, value, expires) {

  if (expires===undefined || expires===null) {
      expires = (60);  // default: seconds for 1 day
  } else {
      expires = Math.abs(expires); //make sure it's positive
  }

  var now = Date.now();  //millisecs since epoch time, lets deal only with integer
  var schedule = now + expires*1000; 
  try {
      localStorage.setItem(key, value);
      localStorage.setItem(key + '_expiresIn', schedule);
  } catch(e) {
      console.log('setStorage: Error setting key ['+ key + '] in localStorage: ' + JSON.stringify(e) );
      return false;
  }
  return true;
}

export default async function  makeData() {
  const makeDataLevel = JSON.parse(getStorage('tableData'));
if (makeDataLevel) {
  console.log(makeDataLevel);
  return makeDataLevel;
} else {
  const bitbnsTradeURL = 'https://bitbns.com/trade/#/$COIN$/';
  const wazirxTradeURL = 'https://wazirx.com/exchange/$COIN$-INR';
  const zebpayTradeURL = 'https://pro.zebpay.com/trade/$COIN$-INR';

  const [zebpayData, wazirxData, bitbnsData] = await getAPI();
  // console.log("zebpayData:", zebpayData);
  // console.log("wazirxData:", wazirxData);
  // console.log("bitbnsData:", bitbnsData);
  const makeDataLevel = [];
  let coins = {};

// Processing WazirX
wazirxData.map((data) => {
  if(data.quoteAsset.toLowerCase() === "inr") {
    const asset = data.baseAsset.toLowerCase();
    coins = {
      ...coins,
      [asset]: {
        ...coins[asset], 
        "ltpw": parseFloat(data.lastPrice),
        tradeLinks: '-'
      }
    };
  }
  return true;
});

// Processing ZebPay
zebpayData.map((data) => {
  if(data.currency.toLowerCase() === "inr")
  {
    const asset = data.virtualCurrency.toLowerCase();
    coins = {
    ...coins,
    [asset]: {
      ...coins[asset], 
      "ltpz": parseFloat(data.market)
    }
  };}
  return true;
});

// Processing BitBns
for (let [key, value] of Object.entries(bitbnsData)) {
  const coin = key.search(/usdt/gi) > 0 ? null : key.toLowerCase();
  coins = {
    ...coins,
    [coin]: {
      ...coins[coin], 
      "ltpb": parseFloat(value.last_traded_price)
    }
  }
}
function getRateDiffandPercent({ltpw, ltpb, ltpz}) {
  let arr = Object.values({ltpw, ltpb, ltpz}).filter(n => n !== undefined);
  // console.log(arr);
  let min = Math.min(...arr);
  let max = Math.max(...arr);

  // console.log('min:', min);
  // console.log('max:', max);
  let rateDiff = max - min;
  let rateDiffPercent = ((rateDiff/min)*100);
  return [rateDiff, rateDiffPercent];
}

for (let [key, value] of Object.entries(coins)) {
  const [rateDiff, percentDiff] = getRateDiffandPercent(value);
  makeDataLevel.push({
    "asset": key.toLowerCase(),
    ...value,
    rateDiff,
    percentDiff
  });
}

  setStorage('tableData', JSON.stringify(makeDataLevel), 600);
  return makeDataLevel;
}
}
