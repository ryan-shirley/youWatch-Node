/**
 * getCurrentDayTime() returns current day and time
 * as a formatted string
 */
export function getCurrentDayTime() {
    var today = new Date()
    var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate()
    var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()

    return date + " " + time
}

/**
 * getCurrentDayTimeFile() returns current day and time
 * as a formatted string to filename
 */
export function getCurrentDayTimeFile() {
    var today = new Date()
    var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate()
    var time =
        today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds()

    return date + "-" + time
}
