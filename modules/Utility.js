// Configure Env
const dotenv = require('dotenv')
dotenv.config()

// Imports
const ping = require('ping')

/**
 * checkIfHome() returns status if home is occupied
 * based on the ping status of mobile phones
 */
export async function checkIfHome() {
    let hosts = process.env.FAMILY_PHONE_IP_ADDRESSES.split(' ')

    // Loop through all hosts to check if alive
    for (let host of hosts) {
        let res = await ping.promise.probe(host)
        
        // If host is alive reutrn
        if(res.alive) {
            return true
        }

        console.log(res);
        
    }

    return false
}