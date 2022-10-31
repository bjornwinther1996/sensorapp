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
import useGeolocation from './hooks/useGeolocation';

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

function setGeoPos(lat, lng, pos) {
  //implementation for calling once.
  //should it also send it to the server?
  sendGeoLoc(lat, lng, pos);
}

function clickMe(){
  sendShot(1,uniqueId);
}

function App() {  

  const [quaternion, setQuaternion] = useState({ // is currently not used. Was used to display Quart values on screen.
    x: 0,
    y: 0,
    z: 0,
    w: 0
  });
  //Use code to set local properties on button?
  /*const [coordinates, setCoordinates] = useState({
    latitude: 0,
    longitude: 0
  });*/
  //setCoordinates({latitude: location.coordinates.lat, longitude: location.coordinates.lng});

  const location = useGeolocation(); // importing from hook.

  //const uniqueId = uuid(); // creating unique id with uuid lib - Replace with Ipv4 adress eventually if possible?
  //const databaseRef = collection(database); // ??? is this how you declare it? - Think i can just use database now

  useEffect(() =>{ // Things are only called once because of []?
    const options = { frequency: 30, referenceFrame: "device" }; // changed to 30 freq.
    const sensor = new AbsoluteOrientationSensor(options);
    writeActionInput(0,0,uniqueId); // trigger once - to trigger actionInput in database and reset score
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
    //Can try sensor.onreading() instead of addEventListener?

    sensor.addEventListener("error", (error) => {
      if (error.name === "NotReadableError") {
        console.log("Sensor is not available.");
      }
    });
    sensor.start();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      <GeoButton onClick={setGeoPos(location.coordinates.lat,location.coordinates.lng,'top')}>
          top
          </GeoButton>
        <Span>V11</Span> 
        <div className='rowDiv'>
          <div className='colDiv'><GeoButton onClick={setGeoPos(location.coordinates.lat,location.coordinates.lng,'left')}>left</GeoButton></div>
          <div className='colDiv'><GeoButton onClick={setGeoPos(location.coordinates.lat,location.coordinates.lng,'middle')}>middle</GeoButton></div>
          <div className='colDiv'><GeoButton onClick={setGeoPos(location.coordinates.lat,location.coordinates.lng,'right')}>right</GeoButton></div>
        </div>
        <span>Geo: {location.loaded ? JSON.stringify(location) : 'Location not available yet'}</span>
        <span>X: {quaternion.x}</span>
        <span>Y: {quaternion.y}</span>
        <span>Z: {quaternion.z}</span>
        <span>W: {quaternion.w}</span>
        <Button onClick={clickMe}>
          Shoot
        </Button>
        <div> 
        <GeoButton onClick={setGeoPos(location.coordinates.lat,location.coordinates.lng,'bottom')}>
          bottom
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
    set(ref(db, 'users/' + uniqueId +'/'+ 'GeneralInfo'), {
      position: pos,
      latitude: lat,
      longitude: lng
    });
  }

export default App;

//Commented code:
//If you want to display Quart values on screen locally
/*<span>X: {quaternion.x}</span>
        <span>Y: {quaternion.y}</span>
        <span>Z: {quaternion.z}</span>
        <span>W: {quaternion.w}</span>*/ 

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