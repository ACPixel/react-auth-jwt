import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import '../style/main.scss';

const MainContext = React.createContext();

class MainProvider extends React.Component {
    constructor() {
        super();
        this.state = {
            signUpPassword: "",
            signUpUsername: "",
            signInPassword: "",
            signInUsername: "",
            err: false,
            username: ""
        }
        this.signUpPasswordChange = this.signUpPasswordChange.bind(this);
        this.signUpUsernameChange = this.signUpUsernameChange.bind(this);
        this.signInPasswordChange = this.signInPasswordChange.bind(this);
        this.signInUsernameChange = this.signInUsernameChange.bind(this);
        this.signUp = this.signUp.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    signUpPasswordChange(e) {
      this.setState({"signUpPassword": e.target.value})
    }

    signUpUsernameChange(e) {
      this.setState({"signUpUsername": e.target.value})
    }

    signInPasswordChange(e) {
      this.setState({"signInPassword": e.target.value})
    }

    signInUsernameChange(e) {
      this.setState({"signInUsername": e.target.value})
    }

    setError(msg) {
      this.setState({"err": msg});
      setTimeout(() => {
        this.setState({"err": false});
      }, 4000);
    }
    
    signUp() {
      axios.post("http://localhost:3000/auth/users/signup", {
        "username": this.state.signUpUsername,
        "password": this.state.signUpPassword
      }).then(res=>{
        this.setState({username: res.data.user.username})
        localStorage.token = res.data.token
      }).catch((err)=>{
        this.setError(err.response.data.message)
      })
    }

    signIn() {
      axios.post("http://localhost:3000/auth/users/signin", {
        "username": this.state.signInUsername,
        "password": this.state.signInPassword
      }).then(res=>{
        this.setState({username: res.data.user.username})
        localStorage.token = res.data.token
      }).catch((err)=>{
        this.setError(err.response.data.message)
      })
    }

    fromToken() {
      axios.post("http://localhost:3000/auth/me/from/token", {
        "token": localStorage.token
      }).then(res=>{
        this.setState({username: res.data.user.username})
        localStorage.token = res.data.token
      }).catch((err)=>{
        this.setError(err.response.data.message)
      })
    }

    signOut() {
      this.setState({"username": ""})
      localStorage.removeItem("token")
    }

    render() {
        return (
            <MainContext.Provider
                value={{
                    state: this.state,
                    signUp: this.signUp,
                    signIn: this.signIn,
                    signUpUsernameChange: this.signUpUsernameChange,
                    signUpPasswordChange: this.signUpPasswordChange,
                    signInUsernameChange: this.signInUsernameChange,
                    signInPasswordChange: this.signInPasswordChange,
                    signOut: this.signOut
                }}
                >
                {this.props.children}
            </MainContext.Provider>
        )
    }

    componentDidMount() {
      if (localStorage.token) {
        this.fromToken();
      }
    }
    
}

class SignUp extends Component {

  render() {
    return (
      <MainContext.Consumer>
        {context => (
            <React.Fragment>
              <form onSubmit={(e)=>{
                e.preventDefault();
                context.signUp()
              }}>
                <input type="text" placeholder="username" onChange={context.signUpUsernameChange} value={context.state.signUpUsername}/>
                <input type="text" placeholder="password" onChange={context.signUpPasswordChange} value={context.state.signUpPassword}/>
                <button type="submit">Submit</button>
              </form>
              <hr />
              <form onSubmit={(e)=>{
                e.preventDefault();
                context.signIn()
              }}>
                <input type="text" placeholder="username" onChange={context.signInUsernameChange} value={context.state.signInUsername}/>
                <input type="text" placeholder="password" onChange={context.signInPasswordChange} value={context.state.signInPassword}/>
                <button type="submit">Submit</button>
              </form>
              
            </React.Fragment>
          ) }
      </MainContext.Consumer>
    )
  }
}

class ErrorMessage extends Component {

  render() {
    return (
      <MainContext.Consumer>
        {context => (
            <React.Fragment>
              <div style={{
                "width": "100vw",
                "height": context.state.err ? "25px" : "0px",
                "transition": "all 1s ease",
                "background": "red",
                "color": "white",
                "textAlign": "center"
              }}>{context.state.err}</div>
            </React.Fragment>
          ) }
      </MainContext.Consumer>
    )
  }
}


class App extends Component {
  render() {
    return (
      <MainProvider>
        <ErrorMessage />
        <SignUp />
        <MainContext.Consumer>
        {context => (
            <React.Fragment>
              <div>{context.state.username}</div>
              <button onClick={context.signOut}>Sign Out</button>
            </React.Fragment>
          ) }
      </MainContext.Consumer>
      </MainProvider>
    )
  }
}


ReactDOM.render(<App />, document.getElementById("App"))