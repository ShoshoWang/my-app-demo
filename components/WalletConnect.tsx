"use client"; // 添加这行，标记为客户端组件

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from 'antd';

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null); // 账户地址是字符串或null
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null); // provider类型
  const [error, setError] = useState<string>(''); // 错误消息是字符串

  // 检查是否安装了MetaMask并连接钱包
  const checkWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // 请求用户授权连接钱包
        const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.BrowserProvider(window.ethereum);

        setAccount(accounts[0]); // 保存第一个账户地址
        setProvider(web3Provider); // 保存provider实例
      } catch (err: unknown) {
        // 类型断言错误对象
        setError('连接钱包失败: ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      setError('请安装MetaMask或其他Web3钱包');
    }
  };

  // 处理钱包账户和网络变更
  useEffect(() => {
    if (window.ethereum) {
      // 监听账户变更
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      // 监听网络变更
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // 网络切换时刷新页面
      });

      // 清理事件监听（可选，但推荐）
      return () => {
        window.ethereum.removeListener('accountsChanged', (accounts: string[]) => {
          setAccount(accounts[0] || null);
        });
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload();
        });
      };
    }
  }, []); // 空依赖数组，确保只在组件挂载时运行一次

  return (
    <div>
      <h1>shosho的Web3钱包连接</h1>
      {!account ? (
         <Button type="primary"  onClick={checkWallet}>连接钱包</Button>       
      ) : (
        <p>已连接账户: {account}</p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}