'use client';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button, Input, Card, Flex, Divider, Select, message, Spin } from 'antd';

// 红包合约ABI
const RED_POCKET_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'number', type: 'uint256' },
      { internalType: 'bool', name: '_isEqual', type: 'bool' }
    ],
    stateMutability: 'payable',
    type: 'constructor',
    payable: true
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' }
    ],
    name: 'Deposit',
    type: 'event'
  },
  {
    inputs: [],
    name: 'count',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true
  },
  {
    inputs: [],
    name: 'shosho',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
    constant: true
  },
  {
    inputs: [],
    name: 'totalAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true
  },
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
    payable: true
  },
  {
    inputs: [],
    name: 'getBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true
  },
  {
    inputs: [],
    name: 'grabRedPacket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const RedPocket = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [contractAddress, setContractAddress] = useState('0xC3f8dAFa45567D89A3E00F1d78961dF399C230fC');
  const [redPacketCount, setRedPacketCount] = useState('5');
  const [isEqual, setIsEqual] = useState(true);
  const [depositAmount, setDepositAmount] = useState('0.01');
  const [deployLoading, setDeployLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [grabLoading, setGrabLoading] = useState(false);

  // 读取合约信息
  const { data: contractBalance, refetch: refetchBalance } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: RED_POCKET_ABI,
    functionName: 'getBalance',
    enabled: !!contractAddress,
  });

  const { data: remainingCount, refetch: refetchCount } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: RED_POCKET_ABI,
    functionName: 'count',
    enabled: !!contractAddress,
  });

  // 部署红包合约
  const deployRedPacket = async () => {
    if (!address) {
      message.error('请先连接钱包');
      return;
    }

    setDeployLoading(true);
    try {
      // 这里需要使用ethers.js或web3.js来部署合约
      // 由于wagmi没有直接部署合约的hook，我们需要使用ethers.js
      // 这部分代码需要根据您的环境进行调整
      message.info('请在MetaMask中确认交易');
      
      // 模拟部署成功后的操作
      setTimeout(() => {
        // 假设这是部署后的合约地址
        const newContractAddress = '0xC3f8dAFa45567D89A3E00F1d78961dF399C230fC'; // 替换为实际部署后的地址
        setContractAddress(newContractAddress);
        message.success('红包合约部署成功！');
        setDeployLoading(false);
      }, 2000);
    } catch (error) {
      console.error('部署合约失败:', error);
      message.error('部署合约失败，请查看控制台获取详细信息');
      setDeployLoading(false);
    }
  };

  // 存款到红包合约
  const { write: depositToContract, data: depositData } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: RED_POCKET_ABI,
    functionName: 'deposit',
    value: depositAmount ? parseEther(depositAmount) : undefined,
  });

  // 等待存款交易完成
  const { isLoading: isDepositPending } = useWaitForTransactionReceipt({
    hash: depositData?.hash,
    onSuccess: () => {
      message.success('存款成功！');
      refetchBalance();
      setDepositLoading(false);
    },
    onError: (error) => {
      console.error('存款交易失败:', error);
      message.error('存款交易失败');
      setDepositLoading(false);
    },
  });

  // 抢红包
  const { write: grabRedPacket, data: grabData } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: RED_POCKET_ABI,
    functionName: 'grabRedPacket',
  });

  // 等待抢红包交易完成
  const { isLoading: isGrabPending } = useWaitForTransactionReceipt({
    hash: grabData?.hash,
    onSuccess: () => {
      message.success('抢红包成功！');
      refetchBalance();
      refetchCount();
      setGrabLoading(false);
    },
    onError: (error) => {
      console.error('抢红包交易失败:', error);
      message.error('抢红包交易失败');
      setGrabLoading(false);
    },
  });

  // 处理存款
  const handleDeposit = () => {
    if (!address) {
      message.error('请先连接钱包');
      return;
    }

    if (!contractAddress) {
      message.error('请先部署或输入红包合约地址');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      message.error('请输入有效的存款金额');
      return;
    }

    setDepositLoading(true);
    depositToContract();
  };

  // 处理抢红包
  const handleGrabRedPacket = () => {
    if (!address) {
      message.error('请先连接钱包');
      return;
    }

    if (!contractAddress) {
      message.error('请先部署或输入红包合约地址');
      return;
    }

    setGrabLoading(true);
    grabRedPacket();
  };

  // 设置已有的合约地址
  const handleSetExistingContract = (value) => {
    setContractAddress(value);
  };

  if (isConnecting) return <Spin tip="连接中..."/>;
  if (isDisconnected) return <div>请先连接钱包</div>;

  return (
    <Card title="红包系统" style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <div>已连接钱包: {address}</div>
      
      <Divider>请发新红包</Divider>
      <Flex vertical gap="small">
        <div>
          <label>红包数量：</label>
          <Input 
            type="number" 
            value={redPacketCount} 
            onChange={(e) => setRedPacketCount(e.target.value)}
            style={{ width: 200 }} 
          />
        </div>
        
        <div>
          <label>红包类型：</label>
          <Select
            defaultValue={true}
            style={{ width: 200 }}
            onChange={(value) => setIsEqual(value)}
            options={[
              { value: true, label: '等额红包' },
              { value: false, label: '随机红包' },
            ]}
          />
        </div>
        
        <Button 
          type="primary" 
          onClick={deployRedPacket} 
          loading={deployLoading}
        >
          立即发红包
        </Button>
      </Flex>

      {contractAddress && (
        <>
          <Divider>红包信息</Divider>
          <div>合约地址: {contractAddress}</div>
          <div>剩余红包数量: {remainingCount?.toString() || '加载中...'}</div>
          <div>合约余额: {contractBalance ? formatEther(contractBalance) : '加载中...'} ETH</div>
          
          <Divider>发红包</Divider>
          <Flex vertical gap="small">
            <div>
              <label>存入金额 (ETH)：</label>
              <Input 
                type="number" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(e.target.value)}
                style={{ width: 200 }} 
              />
            </div>
            
            <Button 
              type="primary" 
              onClick={handleDeposit} 
              loading={depositLoading || isDepositPending}
            >
              存入ETH
            </Button>
          </Flex>

          <Divider>抢红包</Divider>
          <Button 
            type="primary" 
            danger 
            onClick={handleGrabRedPacket} 
            loading={grabLoading || isGrabPending}
            disabled={!remainingCount || remainingCount.toString() === '0'}
          >
            抢红包
          </Button>
        </>
      )}
    </Card>
  );
};

export default RedPocket;
