export interface jinghuan {
    props: props;
    version: string;

}

export interface props {
    api(option: object): void;

    action(option: object): void;

    rpc(option: object): void;
}

