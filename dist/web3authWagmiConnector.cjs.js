/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Web3AuthConnector": () => (/* reexport */ Web3AuthConnector)
});

;// CONCATENATED MODULE: external "@babel/runtime/helpers/defineProperty"
const defineProperty_namespaceObject = require("@babel/runtime/helpers/defineProperty");
var defineProperty_default = /*#__PURE__*/__webpack_require__.n(defineProperty_namespaceObject);
;// CONCATENATED MODULE: external "@wagmi/core"
const core_namespaceObject = require("@wagmi/core");
;// CONCATENATED MODULE: external "@web3auth/base"
const base_namespaceObject = require("@web3auth/base");
;// CONCATENATED MODULE: external "@web3auth/core"
const external_web3auth_core_namespaceObject = require("@web3auth/core");
;// CONCATENATED MODULE: external "@web3auth/openlogin-adapter"
const openlogin_adapter_namespaceObject = require("@web3auth/openlogin-adapter");
;// CONCATENATED MODULE: external "@web3auth/ui"
const ui_namespaceObject = require("@web3auth/ui");
var ui_default = /*#__PURE__*/__webpack_require__.n(ui_namespaceObject);
;// CONCATENATED MODULE: external "ethers"
const external_ethers_namespaceObject = require("ethers");
;// CONCATENATED MODULE: external "ethers/lib/utils"
const utils_namespaceObject = require("ethers/lib/utils");
;// CONCATENATED MODULE: external "loglevel"
const external_loglevel_namespaceObject = require("loglevel");
var external_loglevel_default = /*#__PURE__*/__webpack_require__.n(external_loglevel_namespaceObject);
;// CONCATENATED MODULE: ./src/lib/connector.ts

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { defineProperty_default()(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }








const IS_SERVER = typeof window === "undefined";
class Web3AuthConnector extends core_namespaceObject.Connector {
  constructor(config) {
    super(config);
    defineProperty_default()(this, "ready", !IS_SERVER);
    defineProperty_default()(this, "id", "web3Auth");
    defineProperty_default()(this, "name", "web3Auth");
    defineProperty_default()(this, "provider", void 0);
    defineProperty_default()(this, "web3AuthInstance", void 0);
    defineProperty_default()(this, "isModalOpen", false);
    defineProperty_default()(this, "web3AuthOptions", void 0);
    defineProperty_default()(this, "loginModal", void 0);
    defineProperty_default()(this, "socialLoginAdapter", void 0);
    defineProperty_default()(this, "getAdapterSocialLogins", function (adapterName, adapter) {
      let loginMethodsConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      const finalLoginMethodsConfig = {};
      if (adapterName === base_namespaceObject.WALLET_ADAPTERS.OPENLOGIN) {
        ui_namespaceObject.OPENLOGIN_PROVIDERS.forEach(loginMethod => {
          const currentLoginMethodConfig = loginMethodsConfig[loginMethod] || {
            name: loginMethod,
            showOnMobile: true,
            showOnModal: true,
            showOnDesktop: true
          };
          finalLoginMethodsConfig[loginMethod] = _objectSpread({}, currentLoginMethodConfig);
        });
        external_loglevel_default().debug("OpenLogin login method ui config", finalLoginMethodsConfig);
      } else {
        throw new Error(`${adapterName} is not a valid adapter`);
      }
      return finalLoginMethodsConfig;
    });
    this.web3AuthOptions = config.options;
    const chainId = config.options.chainId ? parseInt(config.options.chainId, 16) : 1;
    const chainConfig = this.chains.filter(x => x.id === chainId);
    const defaultChainConfig = (0,base_namespaceObject.getChainConfig)(base_namespaceObject.CHAIN_NAMESPACES.EIP155, config.options.chainId || "0x1");
    let finalChainConfig = _objectSpread({
      chainNamespace: base_namespaceObject.CHAIN_NAMESPACES.EIP155
    }, defaultChainConfig);
    if (chainConfig.length > 0) {
      let currentChain = chainConfig[0];
      if (config.options.chainId) {
        currentChain = chainConfig.find(chain => chain.id === (0,core_namespaceObject.normalizeChainId)(config.options.chainId));
      }
      finalChainConfig = _objectSpread(_objectSpread({}, finalChainConfig), {}, {
        chainNamespace: base_namespaceObject.CHAIN_NAMESPACES.EIP155,
        chainId: `0x${currentChain.id.toString(16)}`,
        rpcTarget: currentChain.rpcUrls.default,
        displayName: currentChain.name,
        tickerName: currentChain.nativeCurrency?.name,
        ticker: currentChain.nativeCurrency?.symbol,
        blockExplorer: currentChain?.blockExplorers.default?.url
      });
    }
    this.web3AuthInstance = new external_web3auth_core_namespaceObject.Web3AuthCore({
      clientId: config.options.clientId,
      enableLogging: config.options.enableLogging,
      storageKey: config.options.storageKey,
      chainConfig: _objectSpread({
        chainNamespace: base_namespaceObject.CHAIN_NAMESPACES.EIP155
      }, finalChainConfig)
    });
    this.socialLoginAdapter = new openlogin_adapter_namespaceObject.OpenloginAdapter({
      adapterSettings: _objectSpread({}, config.options),
      loginSettings: _objectSpread({}, config.options?.socialLoginConfig || {}),
      chainConfig: finalChainConfig
    });
    this.web3AuthInstance.configureAdapter(this.socialLoginAdapter);
    this.loginModal = new (ui_default())({
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
      this.loginModal.addSocialLogins(base_namespaceObject.WALLET_ADAPTERS.OPENLOGIN, (0,ui_namespaceObject.getAdapterSocialLogins)(base_namespaceObject.WALLET_ADAPTERS.OPENLOGIN, this.socialLoginAdapter, this.options.uiConfig?.loginMethodConfig), this.options.uiConfig?.loginMethodsOrder || ui_namespaceObject.OPENLOGIN_PROVIDERS);
      if (this.web3AuthInstance.status !== base_namespaceObject.ADAPTER_STATUS.READY) {
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
        this.loginModal.once(ui_namespaceObject.LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, isVisible => {
          if (!isVisible && !this.web3AuthInstance.provider) {
            return reject(new Error("User closed popup"));
          }
        });
        this.web3AuthInstance.once(base_namespaceObject.ADAPTER_EVENTS.CONNECTED, async () => {
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
        this.web3AuthInstance.once(base_namespaceObject.ADAPTER_EVENTS.ERRORED, err => {
          external_loglevel_default().error("error while connecting", err);
          return reject(err);
        });
      });
    } catch (error) {
      external_loglevel_default().error("error while connecting", error);
      throw new core_namespaceObject.UserRejectedRequestError("Something went wrong");
    }
  }
  async getAccount() {
    const provider = new external_ethers_namespaceObject.ethers.providers.Web3Provider(await this.getProvider());
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
    const provider = new external_ethers_namespaceObject.ethers.providers.Web3Provider(await this.getProvider());
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
            return (0,core_namespaceObject.normalizeChainId)(chainID);
          }
        }
      } else {
        const chainId = await provider.request({
          method: "eth_chainId"
        });
        if (chainId) {
          return (0,core_namespaceObject.normalizeChainId)(chainId);
        }
      }
      throw new Error("Chain ID is not defined");
    } catch (error) {
      external_loglevel_default().error("error", error);
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
      external_loglevel_default().error("Error: Cannot change chain", error);
      throw error;
    }
  }
  async disconnect() {
    await this.web3AuthInstance.logout();
    this.provider = null;
  }
  onAccountsChanged(accounts) {
    if (accounts.length === 0) this.emit("disconnect");else this.emit("change", {
      account: (0,utils_namespaceObject.getAddress)(accounts[0])
    });
  }
  isChainUnsupported(chainId) {
    return !this.chains.some(x => x.id === chainId);
  }
  onChainChanged(chainId) {
    const id = (0,core_namespaceObject.normalizeChainId)(chainId);
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
    this.loginModal.on(ui_namespaceObject.LOGIN_MODAL_EVENTS.LOGIN, async params => {
      try {
        await this.web3AuthInstance.connectTo(params.adapter, params.loginParams);
      } catch (error) {
        external_loglevel_default().error(`Error while connecting to adapter: ${params.adapter}`, error);
      }
    });
    this.loginModal.on(ui_namespaceObject.LOGIN_MODAL_EVENTS.DISCONNECT, async () => {
      try {
        await this.disconnect();
      } catch (error) {
        external_loglevel_default().error(`Error while disconnecting`, error);
      }
    });
  }
}
;// CONCATENATED MODULE: ./src/index.ts

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=web3authWagmiConnector.cjs.js.map