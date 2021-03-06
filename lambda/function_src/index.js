const util = require("util"); 
const https = require('https');

const STATUS_GIF = {
  started: 'https://media.giphy.com/media/mi6DsSSNKDbUY/giphy-downsized-large.gif', // rocket launching
  succeeded: 'https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif', // micheal jordan celebrating
  failed: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif', // anthony anderson crying
  canceled: 'https://media.giphy.com/media/IzXmRTmKd0if6/giphy.gif', // finger pressing abort button
}

let apiRequest = (state, pipeline, gif = '') => {
  const data = JSON.stringify({
    text: `The pipeline ${pipeline} has *${state}*.\n${gif}`
  })
    
  const options = {
    hostname: 'hooks.slack.com',
    port: 443,
    path: 'https://hooks.slack.com/services/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',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  
  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)
  
    res.on('data', (d) => {
      process.stdout.write(d)
    })
  })
  
  req.on('error', (error) => {
    console.error(error)
  })
  
  req.write(data)
  req.end()
}

apiRequest = util.promisify(apiRequest);

module.exports.handler = async (event, context, callback) => {
  try {
    const { state, pipeline } = event;
    let response;
    console.log('event:', event);
    switch (state) {
      case 'STARTED':
        response = await apiRequest(state, pipeline, STATUS_GIF.started)
        break;
      case 'SUCCEEDED':
        response = await apiRequest(state, pipeline, STATUS_GIF.succeeded)
        break;
      case 'FAILED':
        response = await apiRequest(state, pipeline, STATUS_GIF.failed)
        break;
      case 'CANCELED':
        response = await apiRequest(state, pipeline, STATUS_GIF.canceled)
        break;
      default:
        response = await apiRequest(state, pipeline)
        break;
    }
    console.log("response:", response);
  }catch(err){
    console.log("error:", err)
  }
}