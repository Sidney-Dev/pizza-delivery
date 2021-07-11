/**
 * Helpers for various tasks
 */
const crypto = require('crypto')
const https = require('https')
const config = require('./config')
const querystring = require('querystring')

// Container for all helpers
const helpers = {}

// Create a SHA256 hash
helpers.hash =  function(str) {
    if(typeof(str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return str
    } else {
        return false
    }
}

// parse a json string t an object in all cases without throwing

helpers.parseJsonToObject = function(str){
    try {
        var obj = JSON.parse(str)
        return obj
    } catch(e) {
        return {}
    }
}

helpers.createRandomString =  strLength => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
    if(strLength) {
        // Define all the possible chars tht could go into the string
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        // Start the final string
        let str = ''
        for(i = 1; i <= strLength; i++) {
            // Get random character form the possible characters string
            let randomCharacter =  possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))

            // append the character to the final string
            str+=randomCharacter
        }

        // return the final string
        return str
    } else {
        return false
    }
}

// checks that the a variable is an email
helpers.isEmail = str => {
    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if (mailformat.test(str)){
        return true
    } else {
        return false
    }
}

// checks that the a variable is string
helpers.isString = value => {
    if(typeof(value) == 'string'){
        return true
    } else {
        return false
    }
}

// checks that the a variable is an object
helpers.isObject = value => {
    if(typeof(value) == 'object'){
        return true
    } else {
        return false
    }
}

// checks that the a variable is an array
helpers.isArray = value => {
    if(value instanceof Array){
        return true
    } else {
        return false
    }
}

// checks if a passed has data in it
helpers.hasAny = value => {
    if(value.length > 0){
        return true
    } else {
        return false
    }
}

// create a random string
helpers.createRandomString =  strLength => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
    if(strLength) {
        // Define all the possible chars tht could go into the string
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        // Start the final string
        let str = ''
        for(i = 1; i <= strLength; i++) {
            // Get random character form the possible characters string
            let randomCharacter =  possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))

            // append the character to the final string
            str+=randomCharacter
        }

        // return the final string
        return str
    } else {
        return false
    }
}

module.exports = helpers