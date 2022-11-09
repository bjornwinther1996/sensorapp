//import logo from './logo.svg';
import './App.css';
//import {Accelerometer, LinearAccelerationSensor, Sensor} from 'motion-sensors-polyfill' // not used 
import {Gyroscope, AbsoluteOrientationSensor} from 'motion-sensors-polyfill'
import { useEffect, useState } from 'react';
import { child, getDatabase, ref, set, update } from "firebase/database"; // Main Firebase implemenentation from general Lib
import {database} from "./firebase" // referencing manually created firebase.js to reference database - like databaseRef.
import { v4 as uuid } from 'uuid'; // Unique ID package for React
import styled from 'styled-components' // lib for styling - `writing within these backticks is writing css.`
import React from 'react';
//import useGeolocation from './hooks/useGeolocation'; // can only call hooks from react functions (ex: useState, useEffect) - Not used
import axios from 'axios'

const Button = styled.button`
  background-color: white;
  padding: 90px 100px;
  border-radius: 20px;
  font-size: 20px;
  font-family: monospace;
  text-align: center;
  background-color: #2a2d32;
  color: white;
`
const PlayButton = styled.button`
  background-color: white;
  padding: 40px 70px;
  border-radius: 20px;
  font-size: 20px;
  font-family: monospace;
  text-align: center;
  background-color: #2a2d32;
  color: white;
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
  background-color: #2a2d32;
  color: white;
`
const uniqueId = uuid(); // creating unique id with uuid lib - Replace with Ipv4 adress eventually if possible?

function App() {  

  const [quaternion, setQuaternion] = useState({ // is currently not used. Was used to display Quart values on screen.
    x: 0,
    y: 0,
    z: 0,
    w: 0
  });
  //const location = useGeolocation(); // importing from hook.// needs to be called in function to update lat and long again, when clicked and not just use same variables.
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [status, setStatus] = useState(null);
  const options = { // Options for the currentPosition method.
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 2700
  };
  const [debugMsg, setDebugMsg] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(null);//isn't used currently // set to false default?
  const [ip, setIP] = useState('');
  const [UI, setUI] = useState(false);

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
  const getData = async () => {
    const res = await axios.get('https://geolocation-db.com/json/')
    console.log(res.data);
    setIP(res.data.IPv4)
  }
  
  function requestAccessIOS() { // Request Access for IOS
    DeviceOrientationEvent.requestPermission().then(response => {
      if(response = 'granted'){
        setPermissionGranted(true);
        }
      })
      .catch(console.error);
  }

  function requestAccessAndroid() {
    if (navigator.permissions) { // call from function on click "play"
      setDebugMsg("Asking permissions");
      Promise.all([navigator.permissions.query({ name: "accelerometer" }),
                  navigator.permissions.query({ name: "magnetometer" }),
                  navigator.permissions.query({ name: "gyroscope" })])
            .then(results => {
                  if (results.every(result => result.state === "granted")) {
                      setDebugMsg("Permission Granted");
                      setPermissionGranted(true); // use this bool to call initSensor in useEffect()
                  } else {
                      console.log("Permission to use sensor was denied.");
                      setDebugMsg("Permission to use sensor was denied.");
                  }
            }).catch(err => {
                  console.log("Integration with Permissions API is not enabled, still try to start app.");
                  setDebugMsg("Integration with Permissions API is not enabled, still try to start app.");
            });
    }else{
        console.log("No Permissions API, still try to start app.");
        setDebugMsg("No Permissions API, still try to start app.");
    }
  }

  function requestAccess() {
    if(getMobileOperatingSystem() === 'iOS'){
      requestAccessIOS();
    }else{ //android or windows phone: // "else" // dekstop browsers
      requestAccessAndroid();
    }
    const startElements = document.querySelector('.startElement');
    startElements.remove();
    let root = document.documentElement;
    root.style.setProperty('--setDisplayPermissionGranted', 'flex')
    root.style.setProperty('--setDisplayStart', 'none')
  }

  function showUI(){
    console.log('functions runs?');
    let root = document.documentElement;
    setUI(!UI); // toggle bool to show sensor values locally
    console.log('UI: ' + UI);
    if(UI){
      root.style.setProperty('--hideUI', 'block')
    }else{
      root.style.setProperty('--hideUI', 'none')
    }
  }
  
  function initSensor() { // Is everything called contionusly or only the callback part (eventListener).
    /*if(!permissionGranted){
      setDebugMsg('PermissionGranted = false');
      return;}*/
    //Tested - Only the callback function is called continously. Options and sensors are only instantiated once in UseEffect.
    const options = { frequency: 70, referenceFrame: "device" }; // changed to 30 freq, was 60. // changed back to 60
    const sensor = new AbsoluteOrientationSensor(options);
    sensor.addEventListener("reading", () => {
      writeSensorData(sensor.quaternion[0],sensor.quaternion[1],sensor.quaternion[2],sensor.quaternion[3], uniqueId);
      if(!UI){
        setQuaternion({x: sensor.quaternion[0],y: sensor.quaternion[1],z: sensor.quaternion[2],w: sensor.quaternion[3]});
      }
    });
    //sensor.onreading = () => setQuaternion({x: sensor.quaternion[0],y: sensor.quaternion[1],z: sensor.quaternion[2],w: sensor.quaternion[3]});;
    sensor.onerror = (event) => {
      if (event.error.name == 'NotReadableError') {
        console.log("Sensor is not available.");
        setDebugMsg("Sensor is not avaliable InitSensorMethod");
      }
    }
    sensor.start();
  }

  useEffect(() =>{ // Things are only called once because of []?
    var getOrientation = require('o9n').getOrientation;
    var orientation = getOrientation();
    orientation.lock('portrait'); // could also be 'portait-primary' // either one doesnt seem to work tho.
    getData(); // Get IpV4 adress - Needs workaround to be used as ID as it is Async value.
    writeActionInput(0,0,uniqueId); // cant pass ID
    //setDebugMsg('UseEffect called');
    //if(!permissionGranted){return;} //useEffect bliver kun kaldt én gang og det er når app kører og der er Pgranted false. Skal være callback function
    //setDebugMsg('Permissions granted in UseEffect');
    if(getMobileOperatingSystem() === 'iOS'){ // check that this actually works - WHAT IF CHROME OR OTHER BROWSER ON IOS!!!
      setDebugMsg("Running on iOS");
      if (typeof (DeviceOrientationEvent) !== 'undefined' && typeof (DeviceOrientationEvent.requestPermission) === 'function') {// iOS 13+
        initSensor();
        setDebugMsg("IOS 13 device");
      } else {// non iOS 13+
        setDebugMsg("NON-IOS 13 device");
      }
    }else if(getMobileOperatingSystem() === 'Android'){ //IS all this permission-halløj making it lag for android? Maybe more efficient way or mby just UI.
      setDebugMsg('Running on Android');
      initSensor(); // check if its better to run const sensor and const options outside init-method.
    }else if(getMobileOperatingSystem() === 'WindowsPhone'){
      initSensor(); // check if its better to run const sensor and const options outside init-method.
      setDebugMsg('Running Windows Phone');
    }
  }, []);

  //Arrow thing on shoot onClick as well, so it soesnt trigger onRender?: https://stackoverflow.com/questions/33846682/react-onclick-function-fires-on-render
  return (
    <div className="App">
      <div className='startElement' id='startDiv'>
        <h1 id='startText'>Hold your phone flat in your hand and press Play</h1>
        <PlayButton className='startElement' id='playButton' onClick={() =>{requestAccess()}}>Play</PlayButton>
      </div>
      <header className="App-header">
      <GeoButton className='hiddenUI' onClick={() =>{setGeoPos(lat,lng,'top')}}>
          Top
          </GeoButton>
      <GeoButton onClick={() =>{showUI()}}>
          Debug
      </GeoButton>    
        <Span>V21</Span> 
        <div className='hiddenUI rowDiv'>
          <div className='hiddenUI colDiv'><GeoButton onClick={() =>{setGeoPos(lat,lng,'left')}}>Left</GeoButton></div>
          <div className='hiddenUI colDiv'><GeoButton onClick={() =>{setGeoPos(lat,lng,'middle')}}>Middle</GeoButton></div>
          <div className='hiddenUI colDiv'><GeoButton onClick={() =>{setGeoPos(lat,lng,'right')}}>Right</GeoButton></div>
        </div>
        <span className='hiddenUI'>X: {quaternion.x}</span>
        <span className='hiddenUI'>Y: {quaternion.y}</span>
        <span className='hiddenUI'>Z: {quaternion.z}</span>
        <span className='hiddenUI'>W: {quaternion.w}</span>
        <span className='hiddenUI'>debugMsg: {debugMsg}</span>
        <GeoButton className='hiddenUI' onClick={() =>{getLocation()}}>UpdateGeo</GeoButton>
        <span className='hiddenUI'>Geo Location Status {status}</span>
        <span className='hiddenUI'>Lat {lat}</span>
        <span className='hiddenUI'>Long {lng}</span>
        <span className='hiddenUI'>Browser: {fnBrowserDetect()}</span>
        <span className='hiddenUI'>IP: {ip}</span>
        <Button onClick={clickMe}>
          Shoot
        </Button>
        <div> 
        <GeoButton className='hiddenUI' onClick={() =>{setGeoPos(lat,lng,'bottom')}}>
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

function fnBrowserDetect(){ // Detect browser
                  
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

function getMobileOperatingSystem() { // Detect device
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
      return "WindowsPhone";
  }

  if (/android/i.test(userAgent)) {
      return "Android";
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
  }

  return "unknown";
}

export default App;
