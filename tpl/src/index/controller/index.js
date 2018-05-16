let {Controller, props: {action, api}} = jinghuan;

/**
 *
 */
class IndexController extends Controller {
    
    /**
     *
     * @return {Promise<void>}
     */
    @action()
    async index() {
        this.body = 'Hello JinghuanJs';
    }
}

export default IndexController;
