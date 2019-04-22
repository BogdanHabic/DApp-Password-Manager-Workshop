pragma solidity ^0.5.0;

contract PasswordManager {
    address public passwordOwner;

    string ipfsHash;

    constructor() public {
        passwordOwner = msg.sender;
    }

    function sendHash(string memory x) public {
        require(msg.sender == passwordOwner);
        ipfsHash = x;
    }

    function getHash() public view returns (string memory x) {
        return ipfsHash;
    }
}
