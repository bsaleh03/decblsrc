import React, { useState, useEffect } from 'react';
import { Navbar ,Button , Nav , FormControl , Form, Card } from 'react-bootstrap'
import logo from './logo.svg';
import { BrowserRouter, Route, Switch, useParams, Redirect } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import home from './pages';
import signup from './pages/signup';
import feed from './pages/feed';
import Profile from './pages/profile'
import popular from './pages/popular'



function App() {
  return(
    <main>
      <Switch>
        <Route path="/" exact>
          <Redirect to="/popular"/>
        </Route>
        <Route path="/signup" component={signup}/>
        <Route path="/feed" component={feed}/>
        <Route path="/popular" component={popular}/>
        </Switch>
        <Switch>
        <Route path="/profile/:id" children={<PF/>}/>
      </Switch>
    </main>
  )
}

function PF() {
  let { id } = useParams();

  return (
    <Profile name={id}/>
  );
}
export default App;