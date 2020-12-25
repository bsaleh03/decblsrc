import React from 'react';
import { Navbar ,Button , Nav , FormControl , Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import spinner from './loading-arrow.svg'
import './postFeed.css';
import { Heart, CheckCircle, HeartFill, Trash} from 'react-bootstrap-icons';
import authHeader from '../../services/auth-header';
import axios from "axios"


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

class Postfeed extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: null,
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
                userName: data.uName
            })
        })
        .catch(error => {
          console.log(error)
        });
    axios.get('https://core-outcome-257723.uc.r.appspot.com/api/posts', {
      headers: authHeader()
    })
    .then(response => {
      console.log(response.data)
        this.setState({
            externalData: response.data.users,
        })
  })
  .catch(error => {
      console.log(error.response)
    });
  }

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
    })
    .catch(error => {
      console.log(error)
    })
    window.location.reload()
  }

  delete = (postid) => {
    alert("Deletion is still buggy, may not work.")
    const formData = new FormData();
    formData.append('idPosts', postid);
    fetch('https://core-outcome-257723.uc.r.appspot.com/api/delete', {
      method: 'POST',
      headers: authHeader(),
      body: formData
    })
    .then(response => response.json())
    .then(response => {   
      console.log(response)
    })
    .catch(error => {
      console.log(error.response)
    })
  }

  render(){
    if(this.state.externalData === null || this.state.externalData === undefined) {
      console.log(this.state.externalData)
        return(
          <img style={{ width: '30rem', margin: "auto" }} src={spinner} className='loading-icon' alt="logo"/>
        );
    } else {
      return(
        <div>
    {
    this.state.externalData.map((n) => {
      
      console.log(this.state.userName)
    return(
      <Card style={{ width: '30rem', margin: "auto" }} body> 
      <a href={"/profile/" + n[2]}>
        <Card.Title style={{color: "black"}}>{n[1]}{
      n[6]?
      <CheckCircle/>
      :
      <a/>
      }</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">@{n[2]}</Card.Subtitle></a>
      <audio src={URL.createObjectURL(b64toBlob(n[3]))} controls="controls" /> 
      {n[10]?
      <HeartFill onClick={()=> this.like(n[5])}></HeartFill>
      :
      <Heart onClick={()=> {this.like(n[5])}}></Heart>
      }{n[9][0]}
      {this.state.userName==n[2]?
      <Trash onClick={()=> {this.delete(n[5])}}/>
    :  
    <a/>
    }
      </Card>
    )
  })

}</div>)
}  
}
}

export default Postfeed
