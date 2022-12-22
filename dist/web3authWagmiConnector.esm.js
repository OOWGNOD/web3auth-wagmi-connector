import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Connector, normalizeChainId, UserRejectedRequestError } from '@wagmi/core';
import { WALLET_ADAPTERS, getChainConfig, CHAIN_NAMESPACES, ADAPTER_STATUS, ADAPTER_EVENTS } from '@web3auth/base';
import { Web3AuthCore } from '@web3auth/core';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import LoginModal, { OPENLOGIN_PROVIDERS, getAdapterSocialLogins, LOGIN_MODAL_EVENTS } from '@web3auth/ui';
import { ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import log from 'loglevel';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
const IS_SERVER = typeof window === "undefined";
class Web3AuthConnector extends Connector {
  constructor(config) {
    super(config);
    _defineProperty(this, "ready", !IS_SERVER);
    _defineProperty(this, "id", "web3Auth");
    _defineProperty(this, "name", "web3Auth");
    _defineProperty(this, "provider", void 0);
    _defineProperty(this, "web3AuthInstance", void 0);
    _defineProperty(this, "isModalOpen", false);
    _defineProperty(this, "web3AuthOptions", void 0);
    _defineProperty(this, "loginModal", void 0);
    _defineProperty(this, "socialLoginAdapter", void 0);
    _defineProperty(this, "getAdapterSocialLogins", function (adapterName, adapter) {
      let loginMethodsConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      const finalLoginMethodsConfig = {};
      if (adapterName === WALLET_ADAPTERS.OPENLOGIN) {
        OPENLOGIN_PROVIDERS.forEach(loginMethod => {
          const currentLoginMethodConfig = loginMethodsConfig[loginMethod] || {
            name: loginMethod,
            showOnMobile: true,
            showOnModal: true,
            showOnDesktop: true
          };
          finalLoginMethodsConfig[loginMethod] = _objectSpread({}, currentLoginMethodConfig);
        });
        log.debug("OpenLogin login method ui config", finalLoginMethodsConfig);
      } else {
        throw new Error(`${adapterName} is not a valid adapter`);
      }
      return finalLoginMethodsConfig;
    });
    this.web3AuthOptions = config.options;
    const chainId = config.options.chainId ? parseInt(config.options.chainId, 16) : 1;
    const chainConfig = this.chains.filter(x => x.id === chainId);
    const defaultChainConfig = getChainConfig(CHAIN_NAMESPACES.EIP155, config.options.chainId || "0x1");
    let finalChainConfig = _objectSpread({
      chainNamespace: CHAIN_NAMESPACES.EIP155
    }, defaultChainConfig);
    if (chainConfig.length > 0) {
      let currentChain = chainConfig[0];
      if (config.options.chainId) {
        currentChain = chainConfig.find(chain => chain.id === normalizeChainId(config.options.chainId));
      }
      finalChainConfig = _objectSpread(_objectSpread({}, finalChainConfig), {}, {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: `0x${currentChain.id.toString(16)}`,
        rpcTarget: currentChain.rpcUrls.default,
        displayName: currentChain.name,
        tickerName: currentChain.nativeCurrency?.name,
        ticker: currentChain.nativeCurrency?.symbol,
        blockExplorer: currentChain?.blockExplorers.default?.url
      });
    }
    this.web3AuthInstance = new Web3AuthCore({
      clientId: config.options.clientId,
      enableLogging: config.options.enableLogging,
      storageKey: config.options.storageKey,
      chainConfig: _objectSpread({
        chainNamespace: CHAIN_NAMESPACES.EIP155
      }, finalChainConfig)
    });
    this.socialLoginAdapter = new OpenloginAdapter({
      adapterSettings: _objectSpread({}, config.options),
      loginSettings: _objectSpread({}, config.options?.socialLoginConfig || {}),
      chainConfig: finalChainConfig
    });
    this.web3AuthInstance.configureAdapter(this.socialLoginAdapter);
    this.loginModal = new LoginModal({
      theme: this.options.uiConfig?.theme,
      appLogo: this.options.uiConfig?.appLogo || "",
      version: "",
      adapterListener: this.web3AuthInstance,
      displayErrorsOnModal: this.options.displayErrorsOnModal
    });
    this.subscribeToLoginModalEvents();
  }
  async connect() {
    try {
      this.emit("message", {
        type: "connecting"
      });
      await this.loginModal.initModal();
      this.loginModal.addSocialLogins(WALLET_ADAPTERS.OPENLOGIN, getAdapterSocialLogins(WALLET_ADAPTERS.OPENLOGIN, this.socialLoginAdapter, this.options.uiConfig?.loginMethodConfig), this.options.uiConfig?.loginMethodsOrder || OPENLOGIN_PROVIDERS);
      if (this.web3AuthInstance.status !== ADAPTER_STATUS.READY) {
        await this.web3AuthInstance.init();
      }
      // Check if there is a user logged in
      const isLoggedIn = await this.isAuthorized();
      // if there is a user logged in, return the user
      if (isLoggedIn) {
        const provider = await this.getProvider();
        const chainId = await this.getChainId();
        if (provider.on) {
          provider.on("accountsChanged", this.onAccountsChanged.bind(this));
          provider.on("chainChanged", this.onChainChanged.bind(this));
        }
        const unsupported = this.isChainUnsupported(chainId);
        return {
          provider,
          chain: {
            id: chainId,
            unsupported
          },
          account: await this.getAccount()
        };
      }
      this.loginModal.open();
      const elem = document.getElementById("w3a-container");
      elem.style.zIndex = "10000000000";
      return await new Promise((resolve, reject) => {
        this.loginModal.once(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, isVisible => {
          if (!isVisible && !this.web3AuthInstance.provider) {
            return reject(new Error("User closed popup"));
          }
        });
        this.web3AuthInstance.once(ADAPTER_EVENTS.CONNECTED, async () => {
          const signer = await this.getSigner();
          const account = await signer.getAddress();
          const provider = await this.getProvider();
          if (provider.on) {
            provider.on("accountsChanged", this.onAccountsChanged.bind(this));
            provider.on("chainChanged", this.onChainChanged.bind(this));
          }
          const chainId = await this.getChainId();
          const unsupported = this.isChainUnsupported(chainId);
          return resolve({
            account,
            chain: {
              id: chainId,
              unsupported
            },
            provider
          });
        });
        this.web3AuthInstance.once(ADAPTER_EVENTS.ERRORED, err => {
          log.error("error while connecting", err);
          return reject(err);
        });
      });
    } catch (error) {
      log.error("error while connecting", error);
      throw new UserRejectedRequestError("Something went wrong");
    }
  }
  async getAccount() {
    const provider = new ethers.providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    return account;
  }
  async getProvider() {
    if (this.provider) {
      return this.provider;
    }
    this.provider = this.web3AuthInstance.provider;
    return this.provider;
  }
  async getSigner() {
    const provider = new ethers.providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    return signer;
  }
  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!(account && this.provider);
    } catch {
      return false;
    }
  }
  async getChainId() {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        const networkOptions = this.socialLoginAdapter.chainConfigProxy;
        if (typeof networkOptions === "object") {
          const chainID = networkOptions.chainId;
          if (chainID) {
            return normalizeChainId(chainID);
          }
        }
      } else {
        const chainId = await provider.request({
          method: "eth_chainId"
        });
        if (chainId) {
          return normalizeChainId(chainId);
        }
      }
      throw new Error("Chain ID is not defined");
    } catch (error) {
      log.error("error", error);
      throw error;
    }
  }
  async switchChain(chainId) {
    try {
      const chain = this.chains.find(x => x.id === chainId);
      if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
      const provider = this.getProvider();
      if (!provider) throw new Error("Please login first");
      // eslint-disable-next-line no-console
      console.log("chain", chain);
      this.provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${chain.id.toString(16)}`,
          chainName: chain.name,
          rpcUrls: [chain.rpcUrls.default],
          blockExplorerUrls: [chain.blockExplorers?.default?.url],
          nativeCurrency: {
            symbol: chain.nativeCurrency?.symbol || "ETH"
          }
        }]
      });
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{
          chainId: `0x${chain.id.toString(16)}`
        }]
      });
      return chain;
    } catch (error) {
      log.error("Error: Cannot change chain", error);
      throw error;
    }
  }
  async disconnect() {
    await this.web3AuthInstance.logout();
    this.provider = null;
  }
  onAccountsChanged(accounts) {
    if (accounts.length === 0) this.emit("disconnect");else this.emit("change", {
      account: getAddress(accounts[0])
    });
  }
  isChainUnsupported(chainId) {
    return !this.chains.some(x => x.id === chainId);
  }
  onChainChanged(chainId) {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", {
      chain: {
        id,
        unsupported
      }
    });
  }
  onDisconnect() {
    this.emit("disconnect");
  }
  subscribeToLoginModalEvents() {
    this.loginModal.on(LOGIN_MODAL_EVENTS.LOGIN, async params => {
      try {
        await this.web3AuthInstance.connectTo(params.adapter, params.loginParams);
      } catch (error) {
        log.error(`Error while connecting to adapter: ${params.adapter}`, error);
      }
    });
    this.loginModal.on(LOGIN_MODAL_EVENTS.DISCONNECT, async () => {
      try {
        await this.disconnect();
      } catch (error) {
        log.error(`Error while disconnecting`, error);
      }
    });
  }
}

export { Web3AuthConnector };
//# sourceMappingURL=web3authWagmiConnector.esm.js.map
