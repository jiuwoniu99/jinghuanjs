import util from "./lib/util";
import Messenger from "./lib/messenger.js"
import Worker from "./lib/worker.js"
import Master from "./lib/master.js"

let messenger = new Messenger();

export default {
    Worker, Master, messenger
}
