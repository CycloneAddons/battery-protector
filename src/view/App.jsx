import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart'
import { startSound, stopSound } from '../app-api/soundControl';
import { setupTray, updateTray } from '../app-api/setupTray';
import { Route, Routes, useNavigate } from 'react-router';
import { write, read, clear } from '../app-api/configStore';
import React, { useState, useEffect } from 'react';
import { notifyUser } from '../app-api/notify';
import Setting from './Setting';
import Home from './Home';
import './app.css';





const App = () => {
  const [batteryInfo, setBatteryInfo] = useState({ level: 1, charging: true });
  const [isSoundStopped, setIsSoundStopped] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const navigate = useNavigate();
  let isAlerted = false;

  useEffect(() => {
    checkStopSound();
    getBatteryInfo();
    checkIsEnabled();
  }, []);


  //Check Stop Sound on App Start or Restart
  const checkStopSound = async () => {
    const soundStatus = await read('soundStatus');
    if (soundStatus === 'stopped') {
      stopSound();
      const stopTimestamp = await read('stopTimestamp');  
      const stopDuration = await read('stopDuration');
      if (stopDuration === "Infinite") {
        setIsSoundStopped(true);
        return;
      }
      const currentTime = Date.now();
      const remainingTime = stopDuration - (currentTime - stopTimestamp);
      if (remainingTime > 0) {
        const id = setTimeout(async () => {
          handleStartSound();
        }, remainingTime);
        setTimeoutId(id);
        setIsSoundStopped(true);
      } else {
        setIsSoundStopped(false);
      }
    } else {
      setIsSoundStopped(false);
    }
  };

  //Fetch & Update Battery Info
  const getBatteryInfo = async () => {
    const battery = await navigator.getBattery();
    const roundedLevel = Math.round(battery.level * 100);
    updateBatteryInfo(battery);
    setupTray({ tooltip: `Battery Status: ${roundedLevel}%${battery.charging ? ' (Charging)' : ' (Remaining)'}`, level: roundedLevel });
    
    //Battery Event Listeners
    battery.addEventListener('levelchange', async () => await updateBatteryInfo(battery));
    battery.addEventListener('chargingchange', async () => await updateBatteryInfo(battery));
  };

  const updateBatteryInfo = async (battery) => {
    const roundedLevel = Math.round(battery.level * 100);
    setBatteryInfo({ level: roundedLevel / 100, charging: battery.charging });
    updateTray({ tooltip: `Battery Status: ${roundedLevel}%${battery.charging ? ' (Charging)' : ' (Remaining)'}`, level: roundedLevel, });


    if (battery.charging && battery.level >= 0.8 && !isAlerted && !isSoundStopped) { isAlerted = await startSound(); notifyUser(`Battery level reached ${roundedLevel}%. Please unplug the charger`, 'Warning:'); }
    if (!battery.charging || battery.level < 0.8) { isAlerted = await stopSound(); }
  };





  //AutoStart Controler
  const checkIsEnabled = async () => {
    const enabled = await isEnabled();
    setIsChecked(enabled);
  };

  const handleCheckboxChange = async () => {
console.log(await read('stopDuration'));
    if (isChecked) { await disable(); } else { await enable();}
    setIsChecked(!isChecked);
  };



  //Redirect Controler
  const handleNavigate = (path) => {
    navigate(path);
  };


  //ALarm Controler
  const handleSelectTime = async (time) => {
    if (timeoutId) { clearTimeout(timeoutId); setTimeoutId(null); }
    stopSound()
    setPopupVisible(false);
    setIsSoundStopped(true);

   await write('soundStatus', 'stopped');
   await write('stopTimestamp', Date.now());
   await write('stopDuration', time);

   if(time === "Infinite") return; //
    const id = setTimeout(async () => {
        handleStartSound();
    }, time);
    setTimeoutId(id);
  }

  const handleStartSound = async () => {
    if (timeoutId) { clearTimeout(timeoutId); setTimeoutId(null); }

   await write('soundStatus', 'started');
   await write('stopTimestamp', null);
   await write('stopDuration', null);

    if(batteryInfo.charging && batteryInfo.level >= 0.6) {
      notifyUser(`Battery level reached ${Math.round(batteryInfo.level * 100)}%. Please unplug the charger`, 'Stop Sound Time Reached:');
      isAlerted = await startSound(); 
      setIsSoundStopped(false);
    } else {
      setIsSoundStopped(false);
    }
  }

  const handleStopSound = () => {
    setPopupVisible(true);
  }





  return (
    <div>
      <div className="navbar">
        <button
          onClick={() => handleNavigate('/')}
          className="navbutton normal no-animation"
        >
          <span className="itemname">Home</span>
        </button>
        <button
          onClick={isSoundStopped ? handleStartSound : handleStopSound}
          className={isSoundStopped ? "navbutton onbutton no-animation" : "navbutton stopbutton no-animation"}
        >
          <span className="itemname">{isSoundStopped ? 'On Sound' : 'Stop Sound'}</span>
        </button>
        <button
          onClick={() => handleNavigate('/settings')}
          className="navbutton normal no-animation"
        >
          <span className="itemname">Settings</span>
        </button>
      </div>

      {popupVisible && (
        <>
          <div className="popup-backdrop" onClick={() => setPopupVisible(false)}></div>
          <div className="popup-menu">
            <button onClick={() => handleSelectTime(300000)}>5 min</button>
            <button onClick={() => handleSelectTime(600000)}>10 min</button>
            <button onClick={() => handleSelectTime(30 * 60 * 1000)}>30 min</button>
            <button onClick={() => handleSelectTime("Infinite")}>Until I turn it back on</button>
          </div>
        </>
      )}

      <Routes>
        <Route path="/" element={<Home batteryInfo={batteryInfo} handleCheckboxChange={handleCheckboxChange} isChecked={isChecked} />} />
        <Route path="/settings" element={<Setting />} />
      </Routes>
    </div>
  );
}

export default App;
