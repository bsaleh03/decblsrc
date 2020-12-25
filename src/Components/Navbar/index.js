import React from 'react';
import { Navbar ,Button , Nav , FormControl , Form } from 'react-bootstrap';
import authService from '../../services/auth.service'
import authHeader from '../../services/auth-header';
import logo from './logo2.svg'


class NavBar extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            externalData: null,
        }
    }
componentDidMount(){
        fetch('https://core-outcome-257723.uc.r.appspot.com/api/getuName', {
          method: 'GET',
          headers: authHeader(),
        })
        .then(response => response.json())
        .then(data => {
            this.setState({
                externalData: data.uName
            })
        })
        .catch(error => {
          console.log(error)
        })
}
render() { 
    return(
<Navbar bg="light" variant="light" expand="lg">
    
    <Navbar.Brand href={authService.getCurrentUser() ? "/feed" : "/popular"}><img
    src={logo}
    style={{
      height: '30px',
      width: '146px',
      margin: '0',
    }}
    className="d-inline-block align-top"
    alt="DECBL"
/></Navbar.Brand>
    
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
        {authService.getCurrentUser() ? 
      <Nav.Link href="/signup" onClick={ ()=> authService.logout()}>Log out</Nav.Link>
      :
      <Nav.Link href="/signup">Sign up</Nav.Link>
      }

      {authService.getCurrentUser() ? 
      <Nav.Link href={"/profile/" + this.state.externalData}>My Profile</Nav.Link>
      :
      <a/>
      }
      {authService.getCurrentUser() ?  
      <Nav.Link href=" /feed">Feed</Nav.Link>
      :
      <a/>
      }
      <Nav.Link href="/popular">Popular posts</Nav.Link>
    </Nav>
    <Form inline>
      <FormControl type="text" placeholder="Search" className="mr-sm-2" />
      <Button onClick = {()=> alert("User search is coming soon™")} variant="outline-info">Search</Button>
    </Form>
    </Navbar.Collapse>
  </Navbar>
  );}
}

export default NavBar