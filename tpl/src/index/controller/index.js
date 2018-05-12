let {Controller, props: {action, api}} = jinghuan;

/**
 *
 */
class IndexController extends Controller {
    
    @action()
    async index() {
        this.body = "Hello JinghuanJs";
    }
}

export default IndexController;
