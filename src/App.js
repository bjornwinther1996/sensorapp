import logo from './logo.svg';
import './App.css';
import {Accelerometer, LinearAccelerationSensor, Sensor} from 'motion-sensors-polyfill'
import {Gyroscope, AbsoluteOrientationSensor} from 'motion-sensors-polyfill'
import { useEffect, useState } from 'react';
import { getDatabase, ref, set } from "firebase/database";
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
      // model is a Three.js object instantiated elsewhere.
      //model.quaternion.fromArray(sensor.quaternion).inverse();
      console.log(`Quart0 ${sensor.quaternion[0]}`);
      console.log(`Quart1 ${sensor.quaternion[1]}`);
      console.log(`Quart2 ${sensor.quaternion[2]}`);
      console.log(`Quart3 ${sensor.quaternion[3]}`);
      setQuaternion({x: sensor.quaternion[0],y: sensor.quaternion[1],z: sensor.quaternion[2],w: sensor.quaternion[3]});
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
  /*
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    z: 0
  });*/

  return (
    <div className="App">
      <header className="App-header">
        <span>V9</span> 
        <span>X: {quaternion.x}</span>
        <span>Y: {quaternion.y}</span>
        <span>Z: {quaternion.z}</span>
        <span>W: {quaternion.w}</span>
      </header>
    </div>
  );
}

/*
<span>xPos:{xPos}</span>
        <span>yPos:{yPos}</span>
        <span>zPos:{zPos}</span>
        <span>Frequency:{freqSensor}</span>
        <span>varTest:{varTest}</span>
        <span>letTest:{letTest}</span>
*/
//import { from } from 'list';

//Was inside header
/*<img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
*/

//Code that works for accelerometer::
/*
if ('Accelerometer' in window) {
    // The `Accelerometer` interface is supported by the browser.
    // Does the device have an accelerometer, though?
    console.log("Browser supports Accelerometer"); 
    let accelerometer = null;
    try {
      accelerometer = new Accelerometer({ frequency: 10 }); // adjust frequency
      //const gyroscope = new Gyroscope({ frequency: 15 });
      //const orientation = new AbsoluteOrientationSensor({ frequency: 60 });
      console.log("Accelerometer obj created");
      accelerometer.onerror = (event) => {
        console.log("onError function triggered");
        // Handle runtime errors.
        if (event.error.name === 'NotAllowedError') {
          console.log('Permission to access sensor was denied.');
        } else if (event.error.name === 'NotReadableError') {
          console.log('Cannot connect to the sensor.');
        }
      };
      accelerometer.onreading = (e) => {
        //problem is reading?
        //xPos = accelerometer.x;
        //yPos = accelerometer.y;
        //zPos = accelerometer.z;
        //freqSensor = e.frequency;
        console.log(e);
      };
      accelerometer.addEventListener('reading', () => {
        console.log(`Acceleration along the X-axis ${accelerometer.x}`);
        console.log(`Acceleration along the Y-axis ${accelerometer.y}`);
        console.log(`Acceleration along the Z-axis ${accelerometer.z}`);
        //xPos = accelerometer.x;
        //yPos = accelerometer.y;
        //zPos = accelerometer.z;
      });
      accelerometer.start();
    } catch (error) {
      // Handle construction errors.
      console.log("fejl i catch");
      if (error.name === 'SecurityError') {
        console.log('Sensor construction was blocked by the Permissions Policy.');
      } else if (error.name === 'ReferenceError') {
        console.log('Sensor is not supported by the User Agent.');
      } else {
        throw error;
      }
    }
  }*/

  function writeSensorData(x, y, z, w) {
    const db = database;
    set(ref(db, 'users/'), {
      xQuart: x,
      yQuart: y,
      zQuart : z,
      wQuart : w
    });
  }
export default App;
