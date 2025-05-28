export const wagmiContractConfig = {
    address: '0xC3f8dAFa45567D89A3E00F1d78961dF399C230fC',
    abi: [
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
    ]
  } as const