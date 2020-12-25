import React, { useState, useEffect,  } from 'react';
import NavBar from '../../Components/Navbar'
import spinner from '../../Components/postFeed/loading-arrow.svg'
import '../../Components/postFeed/postFeed.css';
import { Navbar ,Button , Nav , FormControl , Form, Card, Modal } from 'react-bootstrap';
import authHeader from '../../services/auth-header';
import { Heart, CheckCircle, HeartFill} from 'react-bootstrap-icons';
import axios from 'axios'

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

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            externalData: null,
            pfData: null,
            modalActive: false,
            name:"",
            bio:"",
        }
    }
    follow = (uid) => {
        const formData = new FormData();
        formData.append('idUsers', uid);
        fetch('https://core-outcome-257723.uc.r.appspot.com/api/follow', {
          method: 'POST',
          headers: authHeader(),
          body: formData
        })
        .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Something went wrong');
            }
          })
        .then(data => {
          console.log(data)
          window.location.reload()
        })
        .catch(error => {
          alert(error)
        })
    }

    updateProfile = () => {
    const formData = new FormData()
    formData.append('name', this.state.name);
    formData.append('biography', this.state.bio);
    fetch('https://core-outcome-257723.uc.r.appspot.com/api/changeprofile', {
        method: 'POST',
        headers: authHeader(),
        body: formData
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      })
      .then(data => {
        console.log(data)
        window.location.reload()
      })
      .catch(error => {
        alert(error)
      })
    }

    like = (postid) => {
        const formData = new FormData();
        formData.append('idPosts', postid);
        fetch('https://core-outcome-257723.uc.r.appspot.com/api/like', {
          method: 'POST',
          headers: authHeader(),
          body: formData
        })
        .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Something went wrong');
            }
          })
        .then(data => {
          console.log(data)
          window.location.reload()
        })
        .catch(error => {
          alert(error)
        })
      }

      componentDidMount(){
        axios.get('https://core-outcome-257723.uc.r.appspot.com/api/profile/' + this.props.name, {
          method: 'GET',
          headers: authHeader(),
        })
        .then(response => {
            console.log(response)
            this.setState({
                pfData: response.data.userInfo,
                name:   response.data.userInfo[0],
                bio:    response.data.userInfo[2],
            })
      })
      .catch(error => {
        console.log(error)
      });
      axios.get('https://core-outcome-257723.uc.r.appspot.com/api/posts/' + this.props.name, {
        method: 'GET',
        headers: authHeader()
      })
      .then(resp => {
          console.log(resp.data.users)
          this.setState({
              externalData: resp.data.users,
          })
    })
    .catch(error => {
        console.log(error.response)
      });
      }
    
  render(){
      return(
          <div>
      <NavBar/>
    {(this.state.pfData === null  || this.state.pfData === undefined)?  
          <img  style={{ width: '30rem', margin: "auto" }} src={spinner} className='loading-icon' alt="logo"/>    
   :
      <div className="App">
    <body>
    <Card body style={{ width: '30rem', margin: "auto" }}>
    <Card.Title style={{color: "black"}}>{this.state.pfData[0]}{
      this.state.pfData[3]?
      <CheckCircle/>
      :
      <a/>
      }</Card.Title>
     
        <Card.Subtitle className="mb-2 text-muted">@{this.props.name}</Card.Subtitle>
         <Card.Body>
        <Card.Text>
          <div>
              {this.state.pfData[2]}
        </div>
        </Card.Text>
        <b>{this.state.pfData[7]}</b>Following&nbsp;&nbsp;<b>{this.state.pfData[6]}</b>Followers
        {this.state.pfData[5]?
        <div>
        <Button onClick={()=> this.setState({modalActive:true})} style={{
            float: 'right'
        }}>Edit profile</Button>
         <Modal
        show={this.state.modalActive}
        onHide={() => this.setState({modalActive: false})}
        backdrop="static"
        keyboard={false}
      >
          <Form onSubmit={() => this.updateProfile}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group controlId="formGroupName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" placeholder="Your Name" value={this.state.name} onChange={(e) => {this.setState({name: e.target.value})}}/>
            </Form.Group>
            <Form.Group controlId="formGroupBio">
                <Form.Label>Bio</Form.Label>
                <Form.Control as="textarea" rows={2} name="biography" placeholder="Your Biography" value={this.state.bio} onChange={(e) => {this.setState({bio: e.target.value})}} />
            </Form.Group> 
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.setState({modalActive: false})}>
            Close
          </Button>
          <Button variant="primary" onClick={() => this.updateProfile()}>Submit</Button>
        </Modal.Footer>
        </Form>
      </Modal>
        </div>
        :
        <Button onClick={() =>this.follow(this.state.pfData[4])} style={{
            float: 'right'
        }}>{this.state.pfData[8]?<a>Follow</a>:<a>Unfolllow</a>}</Button>
        }
      </Card.Body>
    </Card>
    </body>
      </div>
    }
{(this.state.externalData === null  || this.state.externalData === undefined)?  
          <img style={{ width: '30rem', margin: "auto" }} src={spinner} className='loading-icon' alt="logo"/>    
   :
   this.state.externalData.map((n) => {
      
  return(
    <Card body style={{ width: '30rem', margin: "auto" }}> 
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
})}</div>
);
}
}
  export default Profile;