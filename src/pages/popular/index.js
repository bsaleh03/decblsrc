import React from 'react';
import { Button , Nav , FormControl , Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import spinner from '../../Components/postFeed/loading-arrow.svg'
import '../../Components/postFeed/';
import { Heart, CheckCircle, HeartFill} from 'react-bootstrap-icons';
import authHeader from '../../services/auth-header';
import NavBar from '../../Components/Navbar'



const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

class Popular extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            externalData: null,
        }
    }
//const [currentUsers, setCurrentUsers] = useState([[]]);

/*useEffect(() => {
    //get time is only being used as a template
    fetch('/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
    //we are getting the current user count
    console.log("is fetch working?");

    fetch('/api/posts').then(res => res.json()).then(data => {
      setCurrentUsers(data.users);
      console.log(data.users)
    }); 
  }, []);*/
  like = (postid) => {
    const formData = new FormData();
    formData.append('idPosts', postid);
    fetch('https://core-outcome-257723.uc.r.appspot.com/api/like', {
      method: 'POST',
      headers: authHeader(),
      body: formData
    })
    .then(response => response.json())
    .then(data => {
        window.location.reload()
    })
    .catch(error => {
      console.log(error)
    })
    
  }

  componentDidMount(){
    fetch('https://core-outcome-257723.uc.r.appspot.com/api/popularposts', {
      method: 'GET',
      mode: 'cors'
    }
    ).then(res => res.json())
        .then(data => {
        this.setState({
            externalData: data.users,
        })
  });
  }

  render(){
    if(this.state.externalData === null || this.state.externalData === undefined) {
        return(
            <div className="App">
                <NavBar/>
          <img style={{ width: '24rem', margin: "auto" }} src={spinner} className='loading-icon' alt="logo"/>
          </div>
        );
    } else {
      return(
        <div>
            <NavBar></NavBar>
    {
    this.state.externalData.map((n) => {
      
      console.log(n)
    return(
      <Card style={{ width: '24rem', margin: "auto" }} body> 
      <a href={"/profile/" + n[2]}>
        <Card.Title style={{color: "black"}}>{n[1]}{
      n[6]?
      <CheckCircle/>
      :
      <a/>
      }</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">@{n[2]}</Card.Subtitle></a>
      <audio src={URL.createObjectURL(b64toBlob(n[3]))} controls="controls" /> 
      {n[8]?
      <HeartFill onClick={()=> this.like(n[5])}></HeartFill>
      :
      <Heart onClick={()=> {this.like(n[5])}}></Heart>
      }{n[7][0]}
      </Card>
    )
  })

}</div>)
}  
}
}

export default Popular
