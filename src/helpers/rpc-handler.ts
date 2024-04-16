import { HandlerConstructorConfig } from "@keyrxng/rpc-handler";
import { RPCHandler } from "@keyrxng/rpc-handler";

export function useHandler(networkId: number) {
  const config: HandlerConstructorConfig = {
    networkId,
    autoStorage: false,
    cacheRefreshCycles: 5,
  };
  return new RPCHandler(config);
}