import logo from './logo.svg';
import './App.css';
import {Accelerometer, LinearAccelerationSensor, Sensor} from 'motion-sensors-polyfill'
import {Gyroscope, AbsoluteOrientationSensor} from 'motion-sensors-polyfill'
import { useEffect, useState } from 'react';
import { child, getDatabase, ref, set } from "firebase/database";
import {database} from "./firebase"
//import { getDatabase, ref, set } from "firebase/database";
//import {firebaseConfig, app} from "./firebase.js"

/*
var xPos;
var yPos;
var zPos;
var freqSensor;
var varTest = 1;
let letTest = "letTest"
*/
function App() {  

  //const options = { frequency: 60, referenceFrame: "device" };
  //const sensor = new AbsoluteOrientationSensor(options);
  const [quaternion, setQuaternion] = useState({
    x: 0,
    y: 0,
    z: 0,
    w: 0
  });
  //const databaseRef = collection(database); // ??? is this how you declare it? - Think i can just use database now

  useEffect(() =>{ // Things are only called once because of []?
    const options = { frequency: 60, referenceFrame: "device" };
    const sensor = new AbsoluteOrientationSensor(options);
    sensor.addEventListener("reading", () => { //Callback function and overwrites the "only call once" - Updated every new reading
      //Console logs commented - works:
      //console.log(`Quart0 ${sensor.quaternion[0]}`);
      //console.log(`Quart1 ${sensor.quaternion[1]}`);
      //console.log(`Quart2 ${sensor.quaternion[2]}`);
      //console.log(`Quart3 ${sensor.quaternion[3]}`);
      
      //Set method to update values locally on screen for debugging:
      //setQuaternion({x: sensor.quaternion[0],y: sensor.quaternion[1],z: sensor.quaternion[2],w: sensor.quaternion[3]});
      //Send til firebase herfra med metode kald som tager de 4 quaternion values.
      writeSensorData(sensor.quaternion[0],sensor.quaternion[1],sensor.quaternion[2],sensor.quaternion[3]);
    });

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
        <span>V9</span> 
      </header>
    </div>
  );
}

//import { from } from 'list';

  function writeSensorData(x, y, z, w) {
    const userId = database.key;
    const db = database;
    set(ref(db, 'users/'), {
      xQuart: x,
      yQuart: y,
      zQuart : z,
      wQuart : w
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

