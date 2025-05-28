'use client';
import Web3Provider from './Web3Provider';
import { ConnectKitButton } from 'connectkit';
// import RedPocket from '../../../components/RedPocket';
import { Flex } from 'antd';
import RedPage from './RedPage';

export default function App() {
  return (
    <Web3Provider>
      <Flex gap="middle" wrap>
        <ConnectKitButton />
        <RedPage />
      </Flex>    
    </Web3Provider>
  );
}
