/**
 * Request handlers
 */

// Dependencies
const _data = require('./data')
const { isString } = require('./helpers')
const helpers = require('./helpers')

// Define the handlers
const handlers = {}

handlers.ping = function(data, callback) {
    callback(200)
}

handlers.menuItems = function(data, callback) {

    const menuItems = ["about", "services", "blog", "contact"]
    
    if(data.method == 'get') {
        // get token and email from the headers
        const token = helpers.isString(data.headers.token) ? data.headers.token : false
        const email = helpers.isString(data.headers.email) ? data.headers.email : false
        
        handlers._tokens.verifyToken(token, email,  function(tokenIsValid){

            const successResponse = {
                "success" : 'OK',
                "message" : "Valid token",
                "data" : menuItems
            }

            if(tokenIsValid) {
                callback(200, successResponse)
            } else {
                callback(403, {"Error" : "Missing required token in header, or token is invalid"})
            }
        })


    } else {
        callback(405, {"Error": "Method not allowed"})
    }    

}

handlers._users = {}
/**
 * ========================USERS related handlers========================
 * @param {*} data 
 * @param {*} callback 
 */
handlers.users = function(data, callback) {

    const acceptableMethods = ['get', 'post', 'put', 'delete']
    const requestedMethod = data.method

    // check if requestedMethod is in acceptableMethod, if true, the call the correct method
    if(acceptableMethods.indexOf(requestedMethod) > -1) {
        handlers._users[requestedMethod](data, callback)
    } else {
        callback(405, {"Error": "Method not allowed"})
    }
}


// POST
/**
 * User data
 * @param { required } name 
 * @param { required } email 
 * @param { optional } address 
 */
handlers._users.post = function(data, callback) {

    // validate user data
    let name = helpers.isString(data.payload.name) && helpers.hasAny(data.payload.name.trim()) ? data.payload.name : false
    let email = helpers.isString(data.payload.email) ? data.payload.email : false// && helpers.isEmail(data.payload.name.trim().length) ? data.payload.name : false
    let address = helpers.isObject(data.payload.address) ? data.payload.address : false
    
    let errorObject = {}
    
    if(!name){
        errorObject.name = "Name field error"
    }

    if(!email){
        errorObject.email = "Email field error"
    }

    if(!address){
        errorObject.address = "Address must be of type object"
    }

    // save the user if validation passes
    if(JSON.stringify(errorObject).length > 2){
        // construct the userObject
        let userObject = {
            "name" : name,
            "email" : email,
            "address" : address
        }

        // save the object within users collection
        _data.create('users', email, userObject, function(err){
            if(!err) {
                callback(200, userObject)
            } else {
                callback(400, {"Error": "Could not create user. Possible duplicate"})
            }
        })
    } else {
        callback(403, {"Error": errorObject})
    }

}

// DELETE
handlers._users.delete = function(data, callback) {

    // check if the query parameter exists
    let email = helpers.hasAny(data.queryParams.email) ? data.queryParams.email : false

    // look up the user and get the data if found
    _data.read('users', email, function(err, userData){

        if(!err) {
            // Delete the user
            _data.delete('users', email, function(err, parsedData){
                if(!err) {
                    callback(200, userData)
                } else {
                    callback(400, {"Error":"User could not be deleted"})
                }
            })
        } else {
            callback(400, {"Error":"User could not be found"})
        }

    })
}

// GET
// Required data - email
handlers._users.get = function(data, callback) {

    // check if the query parameter exists
    let email = helpers.hasAny(data.queryParams.email) ? data.queryParams.email : false

    // look up the user and get the data if found
    _data.read('users', email, function(err, userData){

        if(!err) {
            callback(200, userData)
        } else {
            callback(400, {"Error":"User could not be found"})
        }

    })
}

// UPDATE
// Required data - email
handlers._users.put = function(data, callback) {


    // check if there is a payload
    if(JSON.stringify(data.payload).length > 2) {

        const email = data.payload.email

        // Lookup the email in the users collection
        _data.read('users', email, function(err, userData){

            if(!err) {
                console.log(`Found ${email}`)
                console.log(userData)
                // look up each object key
                for(let key in data.payload) {
                    userData[key] = data.payload[key]
                }

                _data.update('users', email, userData, function(err, msg){
                    if(!err){
                        callback(200, msg)
                    } else {
                        callback(400, {"Error":"Could not update user"})
                    }
                })

            } else {
                callback(400, {"Error":"User could not be found"})
            }

        })

    } else {
        callback(400, {"Error":"There is no payload"})
    }
    // get the payload email

    // look up the email


    // if there is a file with that email, update the parsedObject

    // // check if the query parameter exists
    // let email = helpers.hasAny(data.queryParams.email) ? data.queryParams.email : false

    // // look up the user and get the data if found


}

// ======================User related handlers END======================

// LOGIN
handlers.login = function(data, callback) {

    if(data.method == 'post'){
        var email = helpers.isString(data.payload.email.trim()) ? data.payload.email.trim() : false

        if(email) {
            // Lookup the user who matches the email
            _data.read('users', email, function(err, userData){
                if(!err && userData){
                    // create new token with random name. Set expiration date 1 hour in the future
                    let tokenID = helpers.createRandomString(20)
                    let expires = Date.now() + 1000 * 60 * 60
                    let tokenObject = {
                        'email': email,
                        'id' : tokenID,
                        'expires' : expires
                    }
    
                    // Store the token
                    _data.create("tokens", tokenID, tokenObject, function(err){
                        if(!err){
                            var isLogged = true
                            callback(200, tokenObject)
                        } else {
                            callback(500, {"Error" : "Could not create the new token"})
                        }
                    })
                } else {
                    callback(400, {"Error" : "Could not find the specified user"})
                }
            })
        } else {
            callback(400, {"Error" : "Missing required field(s)"})
        }
    } else {
        callback(405, {"Error" : "Only post methods allowed"})
    }
}

// ======================TOKENS handlers======================
handlers._tokens = {}

// @TODO - add method to create a token


// @TODO - add method to delete a token

// Verify if a given token id is currently valid or a given user
handlers._tokens.verifyToken = function(tokenID, email, callback) {

    // Lookup the token
    _data.read('tokens', tokenID, function(err, tokenData){

        if(!err && tokenData){
            // check that the token is for the given user and has not expired
            if(tokenData.email == email && tokenData.expires > Date.now()){
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false)
        }
    })

}
// ======================TOKENS handlers END======================



// CART
handlers.cart = function(data, callback) {
    const acceptableMethods = ['get', 'post', 'put', 'delete']
    const requestedMethod = data.method

    // check if requestedMethod is in acceptableMethod, if true, the call the correct method
    if(acceptableMethods.indexOf(requestedMethod) > -1) {
        handlers._cart[requestedMethod](data, callback)
    } else {
        callback(405, {"Error": "Method not allowed"})
    }
}

handlers._cart = {}

// POST
/**
 * verify if the user is logged in
 * create method to add items to a cart. Return the cart items in the response
 * 
 */
handlers._cart.post = function(data, callback) {
    // get token and email from the headers
    const token = helpers.isString(data.headers.token) ? data.headers.token : false
    const email = helpers.isString(data.headers.email) ? data.headers.email : false
    
    handlers._tokens.verifyToken(token, email,  function(tokenIsValid){

        const data = []
        const successResponse = {
            "success" : 'OK',
            "message" : "Valid token",
            "data" : data
        }

        if(tokenIsValid) {
            callback(200, successResponse)
        } else {
            callback(403, {"Error" : "Missing required token in header, or token is invalid"})
        }
    })
}

// GET
/**
 * Verify if the user is logged in
 * create a method to get all the cart items
 */
handlers._cart.get = function(data, callback) {
    // get token and email from the headers
    const token = helpers.isString(data.headers.token) ? data.headers.token : false
    const email = helpers.isString(data.headers.email) ? data.headers.email : false
    
    handlers._tokens.verifyToken(token, email,  function(tokenIsValid){

        const data = []
        const successResponse = {
            "success" : 'OK',
            "message" : "Valid token",
            "data" : data
        }

        if(tokenIsValid) {
            callback(200, successResponse)
        } else {
            callback(403, {"Error" : "Missing required token in header, or token is invalid"})
        }
    })   
}

module.exports = handlers