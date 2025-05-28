'use client';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { wagmiContractConfig } from './contracts';
import { formatEther, parseEther } from 'viem';
import { Card, Typography, Descriptions, Divider, Button, Input, message, Space, Alert, Tooltip, Avatar, List } from 'antd';
import { useState, useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// 虚拟用户数据
const virtualUsers = [
  {
    id: 1,
    name: '用户1',
    address: '0x4FD32F1321F8E6e9fdB35663e7fddB0d3b1BB355',
    avatar: <Avatar style={{ backgroundColor: '#f56a00' }}>用户1</Avatar>,
    hasGrabbed: false,
    amount: '0'
  },
  {
    id: 2,
    name: '用户2',
    address: '0xF7CEf09516A130Ee3a93B0977Dfe4211824A87f7',
    avatar: <Avatar style={{ backgroundColor: '#87d068' }}>用户2</Avatar>,
    hasGrabbed: false,
    amount: '0'
  },
  {
    id: 3,
    name: '用户3',
    address: '0xc725e35CDf65bB660889B12aBc628C50915D6a83',
    avatar: <Avatar style={{ backgroundColor: '#1890ff' }}>用户3</Avatar>,
    hasGrabbed: false,
    amount: '0'
  }
];

function RedContractAnalysis() {
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [hasGrabbed, setHasGrabbed] = useState(false);
  const [virtualUsersList, setVirtualUsersList] = useState(virtualUsers);

  // 使用useReadContract读取合约数据
  // 读取红包数量
  const { data: redPacketCount, refetch: refetchCount } = useReadContract({
    ...wagmiContractConfig,  // 传入合约配置（地址和ABI）
    functionName: 'count',   // 指定要调用的合约函数名
  });

  // 读取红包总金额
  const { data: totalAmount, refetch: refetchTotalAmount } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'totalAmount',
  });

  // 读取合约余额
  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'getBalance',
  });

  // 读取创建者地址
  const { data: creator } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'shosho',
  });

  // 检查用户是否已经抢过红包
  useEffect(() => {
    const checkIfGrabbed = async () => {
      if (address && wagmiContractConfig.address) {
        try {
          // 这里我们需要调用合约的isGrabbed映射，但由于映射不能直接通过ABI暴露
          // 实际项目中应该添加一个view函数来查询这个映射
          // 这里我们暂时不设置状态，让用户尝试抢红包，合约会检查并拒绝已抢过的用户
          setHasGrabbed(false);
        } catch (error) {
          console.error('检查抢红包状态失败:', error);
        }
      }
    };

    checkIfGrabbed();
  }, [address]);

  // 使用useWriteContract写入合约数据 - 存款
  const { data: depositHash, isPending: isDepositPending, writeContract: writeDeposit } = useWriteContract();

  // 使用useWriteContract写入合约数据 - 抢红包
  const { data: grabHash, isPending: isGrabPending, writeContract: writeGrab } = useWriteContract();

  // 等待存款交易完成
  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = 
    useWaitForTransactionReceipt({
      hash: depositHash,
    });

  // 等待抢红包交易完成
  const { isLoading: isGrabConfirming, isSuccess: isGrabConfirmed } = 
    useWaitForTransactionReceipt({
      hash: grabHash,
    });

  // 处理存款
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      messageApi.error('请输入有效的金额');
      return;
    }

    try {
      writeDeposit({
        ...wagmiContractConfig,
        functionName: 'deposit',
        value: parseEther(depositAmount),
      });
    } catch (error) {
      console.error('存款失败:', error);
      messageApi.error('存款失败，请查看控制台获取详细信息');
    }
  };

  // 处理抢红包
  const handleGrabRedPacket = async () => {
    if (!address) {
      messageApi.error('请先连接钱包');
      return;
    }

    try {
      writeGrab({
        ...wagmiContractConfig,
        functionName: 'grabRedPacket',
      });
    } catch (error) {
      console.error('抢红包失败:', error);
      messageApi.error('抢红包失败，请查看控制台获取详细信息');
    }
  };

  // 虚拟用户抢红包
  const handleVirtualUserGrab = (userId: number) => {
    // 检查红包是否可抢
    if (!redPacketCount || Number(redPacketCount) <= 0 || !totalAmount || Number(totalAmount) <= 0) {
      messageApi.error('没有可抢的红包');
      return;
    }

    // 检查虚拟用户是否已抢过
    const user = virtualUsersList.find(u => u.id === userId);
    if (user?.hasGrabbed) {
      messageApi.error(`${user.name}已经抢过红包了`);
      return;
    }

    // 模拟抢红包过程
    messageApi.loading(`${user?.name}正在抢红包...`, 1.5);
    
    // 模拟延迟
    setTimeout(() => {
      // 计算抢到的金额（模拟合约逻辑）
      let grabAmount = '0';
      const remainingCount = Number(redPacketCount);
      const remainingAmount = Number(formatEther(totalAmount));
      
      if (remainingCount === 1) {
        // 最后一个红包，获得全部金额
        grabAmount = remainingAmount.toString();
      } else {
        // 随机金额 (模拟合约中的随机逻辑)
        const random = Math.floor(Math.random() * 8) + 1; // 1-8的随机数
        grabAmount = (remainingAmount * random / 10).toFixed(4);
      }

      // 更新虚拟用户状态
      setVirtualUsersList(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, hasGrabbed: true, amount: grabAmount } 
            : u
        )
      );

      // 更新红包状态（模拟）
      refetchCount();
      refetchTotalAmount();
      refetchBalance();

      messageApi.success(`${user?.name}抢到了${grabAmount} ETH`);
    }, 2000);
  };

  // 重置虚拟用户状态
  const resetVirtualUsers = () => {
    setVirtualUsersList(virtualUsers.map(user => ({ ...user, hasGrabbed: false, amount: '0' })));
    messageApi.success('已重置用户状态');
  };

  // 交易成功后刷新数据
  useEffect(() => {
    if (isDepositConfirmed || isGrabConfirmed) {
      // 刷新合约数据
      refetchCount();
      refetchTotalAmount();
      refetchBalance();
      
      // 显示成功消息
      if (isDepositConfirmed) {
        messageApi.success('存款成功！');
        setDepositAmount(''); // 清空输入框
      }
      
      if (isGrabConfirmed) {
        messageApi.success('抢红包成功！');
        setHasGrabbed(true); // 标记已抢过红包
      }
    }
  }, [isDepositConfirmed, isGrabConfirmed]);

  // 检查红包是否可抢
  const canGrabRedPacket = redPacketCount && Number(redPacketCount) > 0 && 
                           totalAmount && Number(totalAmount) > 0 && 
                           !hasGrabbed;

  return (
    <>
      {contextHolder}
      <Card title="红包合约交互" style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
        <Typography>
          <Title level={3}>合约数据</Title>
          
          <Descriptions bordered column={1}>
            <Descriptions.Item label="合约地址">{wagmiContractConfig.address}</Descriptions.Item>
            <Descriptions.Item label="红包创建者">{creator || '加载中...'}</Descriptions.Item>
            <Descriptions.Item label="剩余红包数量">{redPacketCount?.toString() || '加载中...'}</Descriptions.Item>
            <Descriptions.Item label="红包总金额">{totalAmount ? `${formatEther(totalAmount)} ETH` : '加载中...'}</Descriptions.Item>
            <Descriptions.Item label="合约余额">{contractBalance ? `${formatEther(contractBalance)} ETH` : '加载中...'}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">向红包合约存入ETH</Divider>
          <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
            <Input 
              addonBefore="存入金额" 
              addonAfter="ETH" 
              placeholder="请输入要存入的ETH金额" 
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <Button 
              type="primary" 
              onClick={handleDeposit}
              loading={isDepositPending || isDepositConfirming}
              block
            >
              {isDepositPending ? '交易确认中...' : isDepositConfirming ? '交易处理中...' : '存入ETH'}
            </Button>
            {depositHash && (
              <Paragraph>
                <strong>存款交易哈希:</strong> {depositHash}
                <br />
                <strong>状态:</strong> {isDepositConfirmed ? '✅ 交易已确认' : isDepositConfirming ? '⏳ 等待确认' : '🔄 处理中'}
              </Paragraph>
            )}
          </Space>

          <Divider orientation="left">抢红包</Divider>
          <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
            {!canGrabRedPacket && (
              <Alert 
                message="无法抢红包" 
                description={
                  Number(redPacketCount) <= 0 ? "红包已被抢完" : 
                  Number(totalAmount) <= 0 ? "红包金额为0" : 
                  hasGrabbed ? "您已经抢过红包了" : 
                  "未知原因，无法抢红包"
                }
                type="warning" 
                showIcon 
              />
            )}
            <Button 
              type="primary" 
              onClick={handleGrabRedPacket}
              loading={isGrabPending || isGrabConfirming}
              disabled={!canGrabRedPacket}
              block
              danger
            >
              {isGrabPending ? '交易确认中...' : isGrabConfirming ? '交易处理中...' : '抢红包'}
            </Button>
            {grabHash && (
              <Paragraph>
                <strong>抢红包交易哈希:</strong> {grabHash}
                <br />
                <strong>状态:</strong> {isGrabConfirmed ? '✅ 交易已确认' : isGrabConfirming ? '⏳ 等待确认' : '🔄 处理中'}
              </Paragraph>
            )}
            <Alert 
              message="红包规则" 
              description={
                <ul>
                  <li>每个地址只能抢一次红包</li>
                  <li>如果是等额红包，每人获得金额 = 总金额 / 剩余红包数</li>
                  <li>如果是随机红包，获得金额 = 总金额 * (1-8的随机数) / 10</li>
                  <li>最后一个红包将获得合约中剩余的所有金额</li>
                </ul>
              }
              type="info" 
              showIcon 
            />
          </Space>

          <Divider orientation="left">虚拟用户抢红包</Divider>
          <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
            <List
              itemLayout="horizontal"
              dataSource={virtualUsersList}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      onClick={() => handleVirtualUserGrab(item.id)}
                      disabled={item.hasGrabbed || !redPacketCount || Number(redPacketCount) <= 0}
                      size="small"
                    >
                      {item.hasGrabbed ? '已抢到' : '抢红包'}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={item.avatar}
                    title={<span>{item.name} ({item.address.substring(0, 6)}...{item.address.substring(38)})</span>}
                    description={
                      item.hasGrabbed 
                        ? <Text type="success">已抢到 {item.amount} ETH</Text>
                        : <Text type="secondary">未抢红包</Text>
                    }
                  />
                </List.Item>
              )}
            />
            <Button onClick={resetVirtualUsers} style={{ marginTop: '10px' }}>
              重置用户状态
            </Button>
          </Space>
        </Typography>
      </Card>
    </>
  );
}

export default RedContractAnalysis;