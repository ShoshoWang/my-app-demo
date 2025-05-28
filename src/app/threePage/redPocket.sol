// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract RedPacket {
    //定义红包发放的人
    address payable public shosho;
    //红包的金额
    uint256 public totalAmount;
    //红包的个数
    uint256 public count;
    //等额红包
    bool isEqual;
    //谁抢过红包
    mapping(address => bool) isGrabbed;
    // 定义存款事件,用于和前端交互
    event Deposit(address indexed from, uint256 amount, uint256 timestamp);


    constructor(uint256 number, bool _isEqual) payable {
        //我给这个合约多少钱
        require(msg.value > 0, "amount must > 0");
        //部署合约的人发红包
        shosho = payable(msg.sender);
        count = number;
        isEqual = _isEqual;
        totalAmount = 0; // 初始化总金额为0
    }

    // 存钱函数，允许向合约中存入资金用于发红包
    function deposit() public payable {
        // 确保存入金额大于0
        require(msg.value > 0, "deposit amount must > 0");
        // 增加总金额
        totalAmount += msg.value;
        // 触发存款事件
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    //获取账户余额
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function grabRedPacket() public {
        //判断 是否count已经发完
        require(count > 0, "count must > 0");
        //判断一下钱是不是发完了
        require(totalAmount > 0, "totalAmount must > 0");
        //现在调用合约这个人 是不是已经抢过红包了
        require(!isGrabbed[msg.sender], "you have grabed");
        isGrabbed[msg.sender] = true;
        if (count == 1) {
            //把账户的余额都转给1个人
            payable(msg.sender).transfer(totalAmount);
        } else {
            if (isEqual) {
                uint256 amount = totalAmount / count;
                totalAmount -= amount;
                payable(msg.sender).transfer(amount);
            } else {
                //算一个随机数 把总额进行拆分
                //如果不是等额红包 计算一个10以内的随机数
                uint256 random = (uint256(
                    keccak256(
                        abi.encodePacked(
                            msg.sender,
                            shosho,
                            count,
                            totalAmount,
                            block.timestamp
                        )
                    )
                ) % 8) + 1;
                uint256 amount = (totalAmount * random) / 10;
                payable(msg.sender).transfer(amount);
                totalAmount -= amount;
            }
        }
        count--;
    }
}
