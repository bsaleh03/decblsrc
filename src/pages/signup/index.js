import React, { useState, useEffect } from 'react';
import { Navbar ,Button , Nav , FormControl , Form, Card } from 'react-bootstrap'
import axios from "axios"
import NavBar from '../../Components/Navbar'
import {useHistory} from 'react-router-dom'


//import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function Signup() {
    const history = useHistory();
    const [register, setRegister] = useState(false)
    const [serverState, setServerState] = useState({
        submitting: false,
        status: null
      });


      const handleServerResponse = (ok, msg, form, res) => {
          //console.log(res)
        setServerState({
          submitting: false,
          status: { ok, msg }
        });
        if (ok) {
          form.reset();
        }
      };
      const handleOnRegisterSubmit = e => {
        e.preventDefault();
        const form = e.target;
        setServerState({ submitting: true });
        axios({
          method: "post",
          url: "https://core-outcome-257723.uc.r.appspot.com/api/signup",
          data: new FormData(form)
        })
          .then(r => {
            handleServerResponse(true, "Thanks! Please log in", form, r);
          })
          .catch(r => {
            handleServerResponse(false, r.response.data.error, form, r);
            console.log(r);
          });
      };

      const handleOnLoginSubmit = e => {
        e.preventDefault();
        const form = e.target;
        setServerState({ submitting: true });
        axios({
          method: "post",
          url: "https://core-outcome-257723.uc.r.appspot.com/api/login",
          data: new FormData(form)
        })
          .then(r => {
            if (r.data.accessToken) {
                localStorage.setItem("user", JSON.stringify(r.data));
                console.log("stored lol");
              }
            handleServerResponse(true, "Thanks!", form, r);
            
            history.push('/feed');
          })
          .catch(r => {
            handleServerResponse(false, r.response.data.error, form, r);
          });
      };
      
  return (
    <div className="App">
     <NavBar/>
  
      {/*<header className="App-header">

        ... no changes in this part ...

        <p>The current time is {currentTime}.</p>
  </header>*/}
  <body>
      {register? 
      <Form onSubmit={handleOnRegisterSubmit} style={{ width: '24rem', margin: "auto" }}>
          <Form.Group controlId="formGroupName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="name" placeholder="Enter name" name="name" />
          </Form.Group>
          <Form.Group controlId="formGroupUserName">
              <Form.Label>User Name</Form.Label>
              <Form.Control type="username" placeholder="Enter username" name="username" />
          </Form.Group>
          <Form.Group controlId="formGroupPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter password" name="password" />
          </Form.Group>
          <Form.Group controlId="formGroupPasswordConfirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" placeholder="Re-enter password" name="password_confirm" />
          </Form.Group>
          <Form.Group controlId="formGroupEmail">
              <Form.Label>E-mail</Form.Label>
              <Form.Control type="email" placeholder="Enter email" name="email" />
          </Form.Group>
          <Button variant="primary" type="submit">
                Submit
            </Button>
            {serverState.status && (
                <p style={{ width: '24rem', margin: "auto" }} className={!serverState.status.ok ? "errorMsg" : ""}>
                {serverState.status.msg}</p>
            )}
      </Form>
      :
      <Form onSubmit={handleOnLoginSubmit} style={{ width: '24rem', margin: "auto" }}>
          <Form.Group controlId="formGroupUserName">
              <Form.Label>User Name</Form.Label>
              <Form.Control type="username" placeholder="Enter username" name="username" />
          </Form.Group>
          <Form.Group controlId="formGroupPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter password" name="password" />
          </Form.Group>
          <Button variant="primary" type="submit">
                Submit
            </Button>
            {serverState.status && (
                <p className={!serverState.status.ok ? "errorMsg" : ""}>
                {serverState.status.msg}</p>
            )}
      </Form>
}
        {register? 
        <div style={{ width: '24rem', margin: "auto" }}><a>Already on Decbl? </a> <a style={{color:"blue"}} onClick={() => setRegister(!register)}> Sign in.</a></div>
        :
        <div style={{ width: '24rem', margin: "auto" }}>
        <a >Don't have an account yet?</a> <a style={{color:"blue"}} onClick={() => setRegister(!register)}> Create one now!</a> <br/>
        <a style={{color:"blue"}} onClick={() => alert("That sounds like a you problem")}>Forgot your password?</a></div>}
    
  </body>
    </div>
  );
}

export default Signup;