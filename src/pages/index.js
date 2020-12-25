import React, { useState, useEffect } from 'react';
import { Navbar ,Button , Nav , FormControl , Form, Card } from 'react-bootstrap';
//import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from '../Components/Navbar'



function Home() {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentUsers, setCurrentUsers] = useState([[]]);


  useEffect(() => {
    //get time is only being used as a template
    fetch('https://cors-anywhere.herokuapp.com/https://core-outcome-257723.uc.r.appspot.com/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
    //we are getting the current user count
    fetch('https://cors-anywhere.herokuapp.com/https://core-outcome-257723.uc.r.appspot.com/api/users').then(res => res.json()).then(data => {
      setCurrentUsers(data.users);
    });
  }, []);

  const usersx = currentUsers.map((n) =>{
    return(
      <Card body>
        <Card.Title>{n[0]}</Card.Title>
        <Card.Text>{n[1]}</Card.Text>
      </Card>
    )
  });

  return (
    <div className="App">
      <NavBar/>
  
      {/*<header className="App-header">

        ... no changes in this part ...

        <p>The current time is {currentTime}.</p>
  </header>*/}
  <body>

{usersx}

  </body>
    </div>
  );
}

export default Home;