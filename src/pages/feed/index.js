import React, { useState, useEffect } from 'react';
import { Navbar ,Button , Nav , FormControl , Form, Card } from 'react-bootstrap'
//import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AudioRecorder from '../../Components/AudioRecorder'
import PostFeed from '../../Components/postFeed';
import NavBar from '../../Components/Navbar'

function Feed() {
  
  const [currentTime, setCurrentTime] = useState(0);
  
  return (
    <div className="App">
      <NavBar/>
  
      {/*<header className="App-header">

        ... no changes in this part ...

        <p>The current time is {currentTime}.</p>
  </header>*/}
  <body>
    <AudioRecorder/>
 
<PostFeed/>
    
  </body>
    </div>
  );
}

export default Feed;