'use client'; // 添加这行，标记为客户端组件

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Input, message } from 'antd';

// 计数器合约的ABI
const COUNTER_ABI = [
  {
    inputs: [],
    name: 'count',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'increment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
];

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null); // 账户地址是字符串或null
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null); // provider类型
  const [balance, setBalance] = useState<string | null>(null); // 新增余额状态
  const [error, setError] = useState<string>(''); // 错误消息是字符串
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null); // 签名者
  const [contractAddress, setContractAddress] = useState<string>(
    '0x9eCCff6F7CFB7eE2C6D349c8eE8aE44037a9Dd56'
  ); // 智能合约地址
  const [contract, setContract] = useState<ethers.Contract | null>(null); // 合约实例
  const [count, setCount] = useState<string>('0'); // 计数器值
  // 检查是否安装了MetaMask并连接钱包
  const checkWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // 请求用户授权连接钱包
        const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const userSigner = await web3Provider.getSigner();

        setAccount(accounts[0]); // 保存第一个账户地址
        setProvider(web3Provider); // 保存provider实例
        setSigner(userSigner); // 保存签名者实例

        // 获取账户余额
        const balance = await web3Provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance)); // 将余额转换为以太单位

        // 初始化合约
        await initContract(web3Provider, userSigner, contractAddress);
      } catch (err: unknown) {
        // 类型断言错误对象
        setError('连接钱包失败: ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      setError('请安装MetaMask或其他Web3钱包');
    }
  };

  // 初始化合约
  const initContract = async (
    provider: ethers.BrowserProvider,
    signer: ethers.JsonRpcSigner,
    address: string
  ) => {
    try {
      // 创建合约实例
      const contractInstance = new ethers.Contract(address, COUNTER_ABI, signer);
      setContract(contractInstance);

      // 获取计数器值
      const currentCount = await contractInstance.getCount();
      setCount(currentCount.toString());
    } catch (err) {
      setError('初始化合约失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // 增加计数
  const incrementCount = async () => {
    if (!contract || !signer) {
      setError('请确保已连接钱包');
      return;
    }

    try {
      // 发送交易
      const tx = await contract.increment();
      message.loading('交易发送中，请等待确认...', 0);

      // 等待交易确认
      await tx.wait();
      message.destroy();
      message.success('计数增加成功！');

      // 更新计数
      const newCount = await contract.getCount();
      setCount(newCount.toString());
    } catch (err) {
      message.destroy();
      setError('增加计数失败: ' + (err instanceof Error ? err.message : String(err)));
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
        <Button type="primary" onClick={checkWallet}>
          连接钱包
        </Button>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h2>账户信息</h2>
            <p>已连接账户: {account}</p>
            <p>账户余额: {balance ? `${balance} ETH` : '加载中...'}</p>
          </div>

          {contract && (
            <div style={{ marginBottom: '20px' }}>
              <h2>计数器</h2>
              <p>合约地址: {contractAddress}</p>
              <p>当前计数: {count}</p>

              <div style={{ marginTop: '20px' }}>
                <Button type="primary" onClick={incrementCount}>
                  增加计数
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
