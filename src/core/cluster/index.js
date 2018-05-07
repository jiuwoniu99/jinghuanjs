import Messenger from "./lib/messenger.js"

let Worker = require('./lib/worker.js');
let Master = require('./lib/master.js');

let messenger = new Messenger();

export default {
    Worker,
    Master,
    messenger,
}
