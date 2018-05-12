let {Controller, props: {action}} = jinghuan;

/**
 *
 */
class IndexController extends Controller {
    
    @action()
    index() {
        this.body = "Hello Jinghuan";
    }
}

export default IndexController;
