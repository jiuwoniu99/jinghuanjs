import * as Knex from 'knex';
import * as Koa from 'koa';

declare var PropApi: PropApi;
declare var PropRpc: PropRpc;
declare var PropAction: PropAction;
declare var PropSocket: PropSocket;
declare var PropValidate: PropValidate;

// at top-level
declare var jinghuan: {
    readonly props: props;
    readonly JH_ROOT: string;
    readonly APP_PATH: string;
    readonly ROOT_PATH: string;
    readonly modules: string[];
    readonly mode: string;
    readonly source: string;
    readonly env: string;
    readonly workers: string;
    readonly PORT: string;
    readonly HOST: string;
    readonly paths: string[];
    readonly process_id: number;
    readonly watcher: boolean;
    readonly version: string;
    readonly Controller: JinghuanController;
    readonly AdminController: JinghuanController;
    readonly ApiController: JinghuanController;
    readonly app: Koa;
};


interface Application extends Koa {
    request: Request;
    response: Response;
}

interface JinghuanDb extends Knex.QueryBuilder {
    sql(sql: string): JinghuanDb
}

interface Request extends Koa.Request {
}

interface Response extends Koa.Response {
}

interface JinghuanContext extends Koa.Context {
    readonly slog: JinghuanSlog
    readonly module: string;
    readonly controller: string;
    readonly action: string;
    readonly userAgent: string;
    readonly isGet: boolean;
    readonly isPost: boolean;
    readonly body: any;

    referer(onlyHost: boolean): string;

    referrer(onlyHost: boolean): string;

    isMethod(method: string): boolean;

    isAjax(method: string): boolean;

    expires(time: any): any

    param(): object;

    param(name: string): object;

    post(): object;

    post(value: object): this;

    file(): object;

    file(data: object): this;

    file(name: string): any;

    file(name: string, value: any): this;

    download(filepath: string, filename?: string): void;

    db(table: string, db_type: string): JinghuanDb;
}

interface JinghuanController extends JinghuanContext {
    ctx: JinghuanContext;
}


interface JinghuanSlog {
    constructor(ctx: JinghuanContext)

    info(msg: any): void;

    debug(msg: any): void;

    table(msg: any): void;

    error(msg: any): void;

    warn(msg: any): void;

    sql(msg: any): void;

    send(time: number): void

    stop(): void
}

/**
 *
 */
interface props {
    api: PropApi;
    action: PropAction
    rcp: PropRpc;
    socket: PropSocket;
    validate: PropValidate;
}

interface PropApi {
    (): Decorators;
}

interface PropRpc {
    (): Decorators;
}

interface PropSocket {
    /**
     *
     * @param {{event: string}} option
     * @return {Decorators}
     */
    (option: { event: string }): Decorators
}


interface PropAction {

    /**
     *
     * @param {{auth: boolean; login: boolean}} option
     * @return {Decorators}
     */
    (option: { auth: boolean, login: boolean }): Decorators
}

interface PropValidate {
    (option: { method: string[] }): Decorators
}

interface Decorators {
    (target: any, name: any, descriptor: any): void
}
