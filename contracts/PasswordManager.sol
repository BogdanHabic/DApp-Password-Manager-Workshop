pragma solidity ^0.4.25;
contract PasswordManager {
    address public passwordOwner;

    string ipfsHash;

    constructor() public {
        passwordOwner = msg.sender;
    }

    function sendHash(string x) public {
        assert(msg.sender == passwordOwner);
        ipfsHash = x;
    }

    function getHash() public view returns (string x) {
        return ipfsHash;
    }
}
