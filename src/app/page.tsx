import Link from "next/link";
import { Card } from 'antd';

export default function Home() {
  return (
    <div>
       <Card title="开始" size="small">
        <p>欢迎使用我的Web3应用</p>
        <Link href="/onePage">
            1.链接web3钱包
        </Link>
      </Card>
    </div>
  );
}