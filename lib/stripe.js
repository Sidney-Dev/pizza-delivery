const https = require('https')
const config = require('./config')

const stripe = {}

stripe.createToken = function(callback) {

    // configure the request payload
    const payload = {
        "amount" : 50,
        "currency" : "usd",
        "source" : "tok_visa",
        "description" : "Payment from NODE API"
    }

    // Configure the request details
    const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'method': 'POST',
        'path': '/v1/charges',
        'headers': {
            'Contenty-Type': 'application/w-www-form-urlencoded',
            'Authorization': 'Bearer ' + config.stripe.key
        }
    }

    // Instantiate the request object
    var req = https.request(requestDetails, function(res){
        // Grab the status of the sent request
        var status = res.statusCode
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
            callback(false)
        }else {
            callback("Status code returned was"+status)
        }
    })

    // Bind to the error event so it doesn't get thrown
    req.on('error', function(e){
        callback(e)
    })

    // Add the payload
    req.write(JSON.stringify(payload))

    // End the request
    req.end()

}

module.exports = stripe