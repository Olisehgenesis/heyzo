// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract HeyZo {
    address public admin;
    uint256 public cooldown = 15 minutes;
    uint256 public dayLength = 1 days;

    struct Pool {
        uint256 total;     // total allocated for distribution
        uint256 maxSend;   // base max per claim
        bool isNative;     // true if this pool is for ETH
    }

    struct UserInfo {
        uint256 lastClaim;
        uint256 lastDay;
        uint256 streak;
    }

    // token => pool (use address(0) for ETH native pool)
    mapping(address => Pool) public pools;
    // user => token => info
    mapping(address => mapping(address => UserInfo)) public userInfo;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Allow contract to receive ETH
    receive() external payable {}

    // Admin sets a pool (initial setup)
    function setPool(address token, uint256 total, uint256 maxSend, bool isNative) external onlyAdmin {
        if (isNative) {
            require(address(this).balance >= total, "Not enough native balance");
        } else {
            require(IERC20(token).balanceOf(address(this)) >= total, "Not enough tokens");
        }
        pools[token] = Pool(total, maxSend, isNative);
    }

    // ✅ General top-up function (users or admin can load funds into contract)
    function topUp(address token, uint256 amount) external payable {
        if (token == address(0)) {
            // Native ETH
            require(msg.value > 0, "Must send ETH");
        } else {
            // ERC20
            require(amount > 0, "Invalid token amount");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        }
    }

    // ✅ Admin can increase a pool from contract reserves
    function increasePool(address token, uint256 amount) external onlyAdmin {
        Pool storage pool = pools[token];
        require(pool.maxSend > 0, "Pool not set");

        if (pool.isNative) {
            require(address(this).balance >= pool.total + amount, "Not enough native reserves");
        } else {
            require(IERC20(token).balanceOf(address(this)) >= pool.total + amount, "Not enough token reserves");
        }
        pool.total += amount;
    }

    // ✅ Admin Batch Send with random between 0.01 and maxSend
    function adminBatchSend(address token, address[] calldata recipients, uint256 maxSend) external onlyAdmin {
        require(maxSend > 0, "Max send must be > 0");
        require(recipients.length > 0, "No recipients");

        uint256 decimals = (token == address(0)) ? 18 : 18; // assume ERC20 has 18 decimals, can adapt
        uint256 minSend = 10 ** (decimals - 2); // 0.01 units (10^16 if 18 decimals)

        uint256 totalRequired = 0;
        uint256[] memory amounts = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 rand = uint256(
                keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, recipients[i], i))
            );
            uint256 sendAmount = (rand % (maxSend - minSend + 1)) + minSend;
            amounts[i] = sendAmount;
            totalRequired += sendAmount;
        }

        if (token == address(0)) {
            require(address(this).balance >= totalRequired, "Not enough native balance");
            for (uint256 i = 0; i < recipients.length; i++) {
                payable(recipients[i]).transfer(amounts[i]);
            }
        } else {
            require(IERC20(token).balanceOf(address(this)) >= totalRequired, "Not enough token balance");
            for (uint256 i = 0; i < recipients.length; i++) {
                IERC20(token).transfer(recipients[i], amounts[i]);
            }
        }
    }

    // Users claim (ERC20 or Native)
    function claim(address token) external {
        UserInfo storage u = userInfo[msg.sender][token];
        Pool storage pool = pools[token];

        require(pool.total > 0, "No pool available");
        require(block.timestamp >= u.lastClaim + cooldown, "Claim too soon");

        // streak tracking
        uint256 currentDay = block.timestamp / dayLength;
        if (u.lastDay == 0 || currentDay > u.lastDay) {
            if (u.lastDay + 1 == currentDay) {
                u.streak += 1;
            } else {
                u.streak = 1;
            }
            u.lastDay = currentDay;
        }

        // streak boost: +10% per 10 days
        uint256 boost = (u.streak / 10) * 10; 
        uint256 effectiveMaxSend = pool.maxSend + (pool.maxSend * boost / 100);

        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, pool.total))
        ) % effectiveMaxSend + 1;

        if (rand > pool.total) {
            rand = pool.total;
        }

        pool.total -= rand;
        u.lastClaim = block.timestamp;

        if (pool.isNative) {
            payable(msg.sender).transfer(rand);
        } else {
            IERC20(token).transfer(msg.sender, rand);
        }
    }

    // Admin send directly
    function adminSend(address token, address to, uint256 amount) external onlyAdmin {
        Pool storage pool = pools[token];
        require(pool.total >= amount, "Not enough in pool");

        pool.total -= amount;
        if (pool.isNative) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
    }

    // Admin withdraw leftover
    function withdraw(address token, uint256 amount) external onlyAdmin {
        if (token == address(0)) {
            require(address(this).balance >= amount, "Not enough native balance");
            payable(admin).transfer(amount);
        } else {
            require(IERC20(token).balanceOf(address(this)) >= amount, "Not enough token balance");
            IERC20(token).transfer(admin, amount);
        }
    }

    // View user info
    function getUserInfo(address user, address token) external view returns (
        uint256 streak,
        uint256 effectiveMaxSend,
        uint256 lastClaim
    ) {
        UserInfo storage u = userInfo[user][token];
        Pool storage pool = pools[token];

        uint256 boost = (u.streak / 10) * 10; 
        uint256 effective = pool.maxSend + (pool.maxSend * boost / 100);

        return (u.streak, effective, u.lastClaim);
    }
}
