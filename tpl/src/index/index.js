import action from 'jinghuanjs/props/action'

let {Controller} = jinghuan;

/**
 *
 */
class IndexController extends Controller {
    
    @action()
    index() {
        this.body = "Hello Jinghuan";
    }
}
