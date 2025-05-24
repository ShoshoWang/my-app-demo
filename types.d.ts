type InjectedProviders = {
    isMetaMask?: true;
  };
  
interface Window {
  ethereum: InjectedProviders & {
    on: (...args: unknown[]) => void;
    removeListener: (...args: unknown[]) => void;
    removeAllListeners: (...args: unknown[]) => void;
    request<T = unknown>(args: unknown): Promise<T>;
  };
}
  
// declare module 'wagmi' {
//   interface Register {
//     config: typeof config
//   }
// }