import { Chain, Connector, ConnectorData } from "@wagmi/core";
import { IAdapter, LoginMethodConfig, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import LoginModal from "@web3auth/ui";
import { Signer } from "ethers";
import { Options } from "./interfaces";
export declare class Web3AuthConnector extends Connector {
    ready: boolean;
    readonly id = "web3Auth";
    readonly name = "web3Auth";
    provider: SafeEventEmitterProvider;
    web3AuthInstance?: Web3AuthCore;
    isModalOpen: boolean;
    web3AuthOptions: Options;
    loginModal: LoginModal;
    private socialLoginAdapter;
    constructor(config: {
        chains?: Chain[];
        options: Options;
    });
    getAdapterSocialLogins: (adapterName: string, adapter: IAdapter<unknown>, loginMethodsConfig?: LoginMethodConfig) => LoginMethodConfig;
    connect(): Promise<Required<ConnectorData>>;
    getAccount(): Promise<string>;
    getProvider(): Promise<SafeEventEmitterProvider>;
    getSigner(): Promise<Signer>;
    isAuthorized(): Promise<boolean>;
    getChainId(): Promise<number>;
    switchChain(chainId: number): Promise<Chain>;
    disconnect(): Promise<void>;
    protected onAccountsChanged(accounts: string[]): void;
    protected isChainUnsupported(chainId: number): boolean;
    protected onChainChanged(chainId: string | number): void;
    protected onDisconnect(): void;
    private subscribeToLoginModalEvents;
}
