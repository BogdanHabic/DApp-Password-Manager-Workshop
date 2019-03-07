/* eslint-disable no-undef */
import React, { Component } from 'react';
import Web3 from 'web3';
import cryptico from 'cryptico';
import PasswordRow from './passwordRow';
import './App.css';
import * as storeHash from './storeHash';
import ipfs from './ipfs';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ethAccount: '',
      contractAddress: '',
      contract: null,
      transactionHash: '',
      ipfsHash: '',
      passwords: [],
    }
  }

  async componentDidMount() {
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);

      try {
        await ethereum.enable();

        const accounts = await web3.eth.getAccounts();

        if (accounts.length === 0) {
          alert('User doesn\'t have any MetaMask accounts!');
          return;
        }

        const contract = new web3.eth.Contract(storeHash.abi, storeHash.address);

        this.setState({ ethAccount: accounts[0], contract, contractAddress: await contract.options.address });
      } catch (error) {
        alert(`User rejected access to MetaMask accounts: ${error}`);
      }
    } else {
      alert('This application needs MetaMask in order to work');
    }
  }

  updatePassword = (website, username, password) => {
    const { passwords } = this.state;

    passwords.forEach(function (accountInfo) {
      if (accountInfo.website === website && accountInfo.username === username) {
        accountInfo.password = password;
      }
    });

    this.setState({ passwords });
  };

  enterNewAccount = () => {
    const website = prompt('Please enter the website', '');

    if (!website.length) {
      alert('Please enter a website');
    }

    const username = prompt('Please enter the username', '');

    if (!username.length) {
      alert('Please enter a username ');
    }

    const password = prompt('Please enter the password', '');

    if (!password.length) {
      alert('Please enter a password ');
    }

    const { passwords } = this.state;

    passwords.push({ website, username, password });

    this.setState({ passwords });
  };

  loadMasterPasswordFile = async () => {
    const { contract } = this.state;

    const masterPassword = prompt('Please enter your password', '');
    const bits = 1024;

    if (!masterPassword.length) {
      alert('Please enter your password');
      return;
    }

    const ipfsHash = await contract.methods.getHash().call();

    const files = await ipfs.get(ipfsHash);

    const buffer = new Buffer(files[0].content);

    const encryptedPasswords = buffer.toString();

    const rsaKey = cryptico.generateRSAKey(masterPassword, bits);

    const decryptedPasswords = cryptico.decrypt(encryptedPasswords, rsaKey);

    if (decryptedPasswords.status !== 'success') {
      alert('Failed decrypting master password file');
      return;
    }

    const passwords = JSON.parse(decryptedPasswords.plaintext);

    this.setState({ ipfsHash, passwords: passwords });
  };

  updateMasterPasswordFile = async () => {
    const { passwords, contract, ethAccount } = this.state;

    const masterPassword = prompt('Enter master password', '');
    const repeatPassword = prompt('Repeat master password', '');

    if (!masterPassword.length || masterPassword !== repeatPassword) {
      alert('Please enter the same password in both fields');
      return;
    }

    const bits = 1024;

    const rsaKey = cryptico.generateRSAKey(masterPassword, bits);
    const publicKey = cryptico.publicKeyString(rsaKey);

    const json = JSON.stringify(passwords);

    const encryptedJson = cryptico.encrypt(json, publicKey);

    if (encryptedJson.status !== 'success') {
      alert('Couldn\'t encrypt passwords');
      return;
    }

    const cipherText = encryptedJson.cipher;

    const buffer = Buffer.from(cipherText);

    await ipfs.add(buffer, (error, result) => {
      if (error) {
        alert(`Error when upload to IPFS: ${error}`);
        return;
      }

      const ipfsHash = result[0].hash;

      contract.methods.sendHash(ipfsHash).send({
        from: ethAccount
      }, (error, transactionHash) => {
        this.setState({ transactionHash, ipfsHash });
      });
    });
  };

  render() {
    const updatePassword = this.updatePassword;
    const { ethAccount, ipfsHash, contractAddress, passwords, transactionHash } = this.state;

    return (
      <div className="App">
        <p>
          ETH address: {ethAccount}
        </p>
        <p>
          Contract address: {contractAddress}
        </p>
        <p>
          IPFS hash: {ipfsHash}
        </p>
        <p>
          Transaction: {transactionHash}
        </p>
        <table className='password-table'>
          <thead>
            <tr>
              <td>Website</td>
              <td>Username</td>
              <td>Password</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {passwords.map(function ({ website, username, password }) {
              return <PasswordRow website={website} username={username} password={password}
                onUpdatePassword={updatePassword}
                key={`${website}-${username}`} />
            })}
          </tbody>
        </table>
        <div>
          <button className='main-update-btn' onClick={this.enterNewAccount}>
            Enter new account
          </button>
        </div>
        <div>
          <button className='main-update-btn' onClick={this.loadMasterPasswordFile}>
            Load master password file
          </button>
        </div>
        <div>
          <button className='main-update-btn' onClick={this.updateMasterPasswordFile}>
            Update master password file
          </button>
        </div>
      </div>
    );
  }
}

export default App;
