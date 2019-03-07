import React, {Component} from "react";

export default class PasswordRow extends Component {
  constructor({website, username, password, onUpdatePassword}) {
    super();

    this.state = {website, username, password, onUpdatePassword, showPassword: false};
  }

  onClick = () => {
    const {website, username, password, onUpdatePassword} = this.state;
    onUpdatePassword(website, username, password);
  };

  onChange = (event) => {
    this.setState({password: event.target.value});
  };

  toggleShowPassword = () => {
    const showPassword = !this.state.showPassword;
    this.setState({showPassword});
  };

  render() {
    const {website, username, password, showPassword} = this.state;

    return (
      <tr className='password-row'>
        <td>{website}</td>
        <td>{username}</td>
        <td>
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={this.onChange}/>
        </td>
        <td>
          <button onClick={this.toggleShowPassword}>Show password</button>
          <button onClick={this.onClick}>Update password</button>
        </td>
      </tr>
    );
  }
}
