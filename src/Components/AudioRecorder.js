import React from 'react'
import MicRecorder from 'mic-recorder-to-mp3';
import Card from 'react-bootstrap/Card';
import { SlashSquareFill, MicFill} from 'react-bootstrap-icons';
import axios from "axios"
import authHeader from '../services/auth-header'



const Mp3Recorder = new MicRecorder({bitrate: 96})

async function sendAudio(audio, userID){
  
  /*axios.interceptors.request.use(req => {
    console.log(req);
    // Important: request interceptors **must** return the request.
    return req;
  });*/

  const formData = new FormData();
  formData.append('audio', audio);
  formData.append('userID', 1);
  for (var p of formData) {
    console.log(p);
  }
  //console.log(formData[1])

  axios.post('https://core-outcome-257723.uc.r.appspot.com/api/createpost', formData, {headers: authHeader()})
  //.then(response => response.json())
  .then(data => {
    console.log(data)
    //alert("e")
    window.location.reload()
  })
  .catch(error => {
    console.log(error.response)
  })
  
}


export class audiorec extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isRecording: false,
      blobURL: '',
      isBlocked: false,
      OGBlob: '',
    }
  }
 componentDidMount() {
  navigator.getUserMedia({ audio: true },
    () => {
      console.log('Permission Granted');
      this.setState({ isBlocked: false });
    },
    () => {
      console.log('Permission Denied');
      alert ("permission Denied")
      this.setState({ isBlocked: true })
    },
  );
 }

 start = () => {
  if (this.state.isBlocked) {
    console.log('Permission Denied');
    alert ("permission Denied")
  } else {
    Mp3Recorder
      .start()
      .then(() => {
        this.setState({ isRecording: true });
      }).catch((e) => console.error(e));
  }
};

stop = () => {
  Mp3Recorder
    .stop()
    .getMp3()
    .then(([buffer, blob]) => {
      //const blobURL = URL.createObjectURL(blob)
      const blobURL = URL.createObjectURL(blob)
      const OGBlob = blob;
      this.setState({ blobURL, isRecording: false, OGBlob });
    }).catch((e) => console.log(e));
};

  render() {
    return (
      <Card style={{ width: '30rem', margin: 'auto' }}>
      <Card.Body>
        <Card.Subtitle className="mb-2 text-muted">Say Something</Card.Subtitle>
        <Card.Text>
          <div>
       
        <audio src={this.state.blobURL} controls="controls" /> 
        {!this.state.isRecording ?
            <MicFill onClick={this.start}/>
        :        
            <SlashSquareFill onClick={this.stop}/>
          
        }
        {//console.log(this.state.OGBlob)
        }
        <button onClick={() => sendAudio(this.state.OGBlob, 1)}> Post </button>
        </div>
        </Card.Text>
      </Card.Body>
    </Card>
      
    );
  }
}

export default audiorec