import config from "../config"
import Logger from "../loaders/logger"
const ping = require("ping")

/**
 * checkIfHome() returns status if home is occupied
 * based on the ping status of mobile phones
 */
export async function checkIfHome() {
    let hosts = config.FAMILY_PHONE_IP_ADDRESSES

    // Loop through all hosts to check if alive
    for (let host of hosts) {
        let res = await ping.promise.probe(host)

        // If host is alive reutrn
        if (res.alive) {
            Logger.debug(`${host} IP address alive. House is occupied`)
            return true
        }
    }

    Logger.debug(`House is empty`)
    return false
}
