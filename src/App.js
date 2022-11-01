import logo from './logo.svg';
import './App.css';
import {Accelerometer, LinearAccelerationSensor, Sensor} from 'motion-sensors-polyfill'
import {Gyroscope, AbsoluteOrientationSensor} from 'motion-sensors-polyfill'
import { useEffect, useState } from 'react';
import { child, getDatabase, ref, set, update } from "firebase/database"; // Main Firebase implemenentation from general Lib
import {database} from "./firebase" // referencing manually created firebase.js to reference database - like databaseRef.
import { v4 as uuid } from 'uuid'; // Unique ID package for React
import styled from 'styled-components' // lib for styling - `writing within these backticks is writing css.`
import React from 'react';
//import useGeolocation from './hooks/useGeolocation'; // can only call hooks from react functions (ex: useState, useEffect) - Not used

const Button = styled.button`
  background-color: white;
  padding: 70px 80px;
  border-radius: 20px;
  font-size: 20px;
  font-family: monospace;
  text-align: center;
`
const Span = styled.span`
  padding: 20px;
`
const GeoButton = styled.button`
  background-color: white;
  padding: 20px 30px;
  border-radius: 5px;
  font-size: 10px;
  font-family: monospace;
  text-align: center;
  margin-top: 10px;
`
const uniqueId = uuid(); // creating unique id with uuid lib - Replace with Ipv4 adress eventually if possible?

function App() {  

  const [quaternion, setQuaternion] = useState({ // is currently not used. Was used to display Quart values on screen.
    x: 0,
    y: 0,
    z: 0,
    w: 0
  });
  //setCoordinates({latitude: location.coordinates.lat, longitude: location.coordinates.lng});
  //const location = useGeolocation(); // importing from hook.// needs to be called in function to update lat and long again, when clicked and not just use same variables.
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [status, setStatus] = useState(null);
  const options = { // Options for the currentPosition method.
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 2700
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
  setStatus('Geolocation is not supported by your browser');
  } else {
          setStatus('Locating...');
          navigator.geolocation.getCurrentPosition((position) => { //consider setting same options from hook with high accuracy? test showed same results tho
              setStatus(null);
              setLat(position.coords.latitude);
              setLng(position.coords.longitude);
          }, () => {
              setStatus('Unable to retrieve your location');
          },error,options);
      }
  }

  useEffect(() =>{ // Things are only called once because of []?
    const options = { frequency: 30, referenceFrame: "device" }; // changed to 30 freq.
    const sensor = new AbsoluteOrientationSensor(options);
    writeActionInput(0,0,uniqueId); // trigger once - to trigger actionInput in database and reset score
    sensor.addEventListener("reading", () => { //Callback function and overwrites the "only call once" - Updated every new reading
      //Set method to update values locally on screen for debugging:
      setQuaternion({x: sensor.quaternion[0],y: sensor.quaternion[1],z: sensor.quaternion[2],w: sensor.quaternion[3]});
      //Send til firebase herfra med metode kald som tager de 4 quaternion values.
      writeSensorData(sensor.quaternion[0],sensor.quaternion[1],sensor.quaternion[2],sensor.quaternion[3], uniqueId);
    });
    //Can try sensor.onreading() instead of addEventListener?

    sensor.addEventListener("error", (error) => {
      if (error.name === "NotReadableError") {
        console.log("Sensor is not available.");
      }
    });
    sensor.start();
  }, []);

  //Arrow thing on shoot onClick as well, so it soesnt trigger onRender?: https://stackoverflow.com/questions/33846682/react-onclick-function-fires-on-render
  return (
    <div className="App">
      <header className="App-header">
      <GeoButton onClick={() =>{setGeoPos(lat,lng,'top')}}>
          Top
          </GeoButton>
        <Span>V11</Span> 
        <div className='rowDiv'>
          <div className='colDiv'><GeoButton onClick={() =>{setGeoPos(lat,lng,'left')}}>Left</GeoButton></div>
          <div className='colDiv'><GeoButton onClick={() =>{setGeoPos(lat,lng,'middle')}}>Middle</GeoButton></div>
          <div className='colDiv'><GeoButton onClick={() =>{setGeoPos(lat,lng,'right')}}>Right</GeoButton></div>
        </div>
        <span>X: {quaternion.x}</span>
        <span>Y: {quaternion.y}</span>
        <span>Z: {quaternion.z}</span>
        <span>W: {quaternion.w}</span>
        <GeoButton onClick={() =>{getLocation()}}>UpdateGeo</GeoButton>
        <span>Geo Location Status {status}</span>
        <span>Lat {lat}</span>
        <span>Long {lng}</span>
        <span>Browser: {fnBrowserDetect()}</span>
        <Button onClick={clickMe}>
          Shoot
        </Button>
        <div> 
        <GeoButton onClick={() =>{setGeoPos(lat,lng,'bottom')}}>
          Bottom
        </GeoButton>
      </div>
      </header>
    </div>
  );
}

//import { from } from 'list';

//Functions to write/read from/to server (FIREBASE):
function writeSensorData(x, y, z, w, uniqueId) {
  const db = database;
  set(ref(db, 'users/' + uniqueId +'/'+ 'SensorInfo'), {
    xQuart: x,
    yQuart: y,
    zQuart : z,
    wQuart : w
  });
}

function writeActionInput(input, resetScore, uniqueId) {
  const db = database;
  set(ref(db, 'users/' + uniqueId +'/'+ 'ActionInput'), {
    score: resetScore,
    id: uniqueId,
    shoot: input
  });
}

function sendShot(input, uniqueId) {
  const db = database;
  update(ref(db, 'users/' + uniqueId +'/'+ 'ActionInput'), { // call update instead of set, so it doesnt overwrite score & id by path
    shoot: input
  });
}

function sendGeoLoc(lat, lng, pos) {
  const db = database;
  update(ref(db, 'users/' + uniqueId +'/'+ 'GeneralInfo' + '/' + pos), {
    position: pos,
    latitude: lat,
    longitude: lng
  });
}

function setGeoPos(lat, lng, pos) {
  //implementation for calling once.
  //should it also send it to the server?
  sendGeoLoc(lat, lng, pos);
}

function clickMe(){
  sendShot(1,uniqueId);
}

function error() {
  alert('Sorry, no position available.');
}

function fnBrowserDetect(){
                  
  let userAgent = navigator.userAgent;
  let browserName;
  
  if(userAgent.match(/chrome|chromium|crios/i)){
      browserName = "chrome";
    }else if(userAgent.match(/firefox|fxios/i)){
      browserName = "firefox";
    }  else if(userAgent.match(/safari/i)){
      browserName = "safari";
    }else if(userAgent.match(/opr\//i)){
      browserName = "opera";
    } else if(userAgent.match(/edg/i)){
      browserName = "edge";
    }else{
      browserName="No browser detection";
    }
    return browserName;
}

export default App;

//Commented code:
//If you want to display Quart values on screen locally (& old hook showing geolocation. Not used anymore)
/*<span>X: {quaternion.x}</span>
        <span>Y: {quaternion.y}</span>
        <span>Z: {quaternion.z}</span>
        <span>W: {quaternion.w}</span>
        <span>Geo: {location.loaded ? JSON.stringify(location) : 'Location not available yet'}</span>
        */ 

//ask permissions
/*const sensor = new AbsoluteOrientationSensor();
Promise.all([
  navigator.permissions.query({ name: "accelerometer" }),
  navigator.permissions.query({ name: "magnetometer" }),
  navigator.permissions.query({ name: "gyroscope" }),
]).then((results) => {
  if (results.every((result) => result.state === "granted")) {
    sensor.start();
    // …
  } else {
    console.log("No permissions to use AbsoluteOrientationSensor.");
  }
});*/


//Permission code:
/*
    Promise.all([
      navigator.permissions.query({ name: "accelerometer" }),
      navigator.permissions.query({ name: "magnetometer" }),
      navigator.permissions.query({ name: "gyroscope" }),
    ]).then((results) => {
      if (results.every((result) => result.state === "granted")) {
        sensor.addEventListener("reading", () => { //Callback function and overwrites the "only call once" - Updated every new reading
          //Console logs commented - works:
          //console.log(`Quart0 ${sensor.quaternion[0]}`);
          //console.log(`Quart1 ${sensor.quaternion[1]}`);
          //console.log(`Quart2 ${sensor.quaternion[2]}`);
          //console.log(`Quart3 ${sensor.quaternion[3]}`);
          
          //Set method to update values locally on screen for debugging:
          setQuaternion({x: sensor.quaternion[0],y: sensor.quaternion[1],z: sensor.quaternion[2],w: sensor.quaternion[3]});
          //Send til firebase herfra med metode kald som tager de 4 quaternion values.
          writeSensorData(sensor.quaternion[0],sensor.quaternion[1],sensor.quaternion[2],sensor.quaternion[3], uniqueId);
        });
        sensor.addEventListener("error", (error) => {
          if (error.name === "NotReadableError") {
            console.log("Sensor is not available.");
          }
        });
        sensor.start();
      } else {
        console.log("No permissions to use AbsoluteOrientationSensor.");
      }
    });
  */
  //Console logs commented - for eventlistener:
  //console.log(`Quart0 ${sensor.quaternion[0]}`);
  //console.log(`Quart1 ${sensor.quaternion[1]}`);
  //console.log(`Quart2 ${sensor.quaternion[2]}`);
  //console.log(`Quart3 ${sensor.quaternion[3]}`);
      