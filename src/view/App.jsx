import React, { useState, useEffect } from 'react';
import { setupTray, updateTray } from '../app-api/setupTray';
import { notifyUser } from '../app-api/notify';
import { invoke } from '@tauri-apps/api/core';
import './app.css';
import { Store } from '@tauri-apps/plugin-store'

import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { resolveResource } from '@tauri-apps/api/path';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Home from './Home';
import Setting from './Setting';

const App = () => {
  const [isSoundStopped, setIsSoundStopped] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [batteryInfo, setBatteryInfo] = useState({ level: 1, charging: true });
  const [isChecked, setIsChecked] = useState(false);
  const [store, setStore] = useState(null);

  const navigate = useNavigate();
  let isAlerted = false;

  useEffect(() => {
    const loadStore = async () => {
      const loadedStore = await Store.load('.settings.dat');
      await setStore(loadedStore);

      const soundStatus = await loadedStore.get('soundStatus');
      const stopTimestamp = await loadedStore.get('stopTimestamp');
      const stopDuration = await loadedStore.get('stopDuration');
      getBatteryInfo(loadedStore);

      if (soundStatus === 'stopped' && stopTimestamp && stopDuration) {
        const elapsed = Date.now() - stopTimestamp;
        const remaining = stopDuration - elapsed;

        if (remaining > 0) {
          setIsSoundStopped(true);
          const id = setTimeout(() => {
            handleStartSound();
          }, remaining);
          setTimeoutId(id);
        } else {
          handleStartSound();
        }
      }
    };

 loadStore();
    

  const getBatteryInfo = async (loadedStore) => {
    const battery = await navigator.getBattery();
    updateBatteryInfo(battery, loadedStore);
    const iconStart = await resolveResource(`assets/tray/dark/` + Math.round(battery.level * 100) + ".png");
    console.log(iconStart);
    setupTray({
      tooltip: `Battery Status: ${Math.round(battery.level * 100)}%${battery.charging ? ' (Charging)' : ' (Remaining)'
        }`,
      icon: iconStart,
    });

    battery.addEventListener('levelchange', async () => await updateBatteryInfo(battery, loadedStore));
    battery.addEventListener('chargingchange', async () =>
      await updateBatteryInfo(battery, loadedStore)
    );
  };

  }, []);



  

  const updateBatteryInfo = async (battery, loadedStore) => {
    const roundedLevel = Math.round(battery.level * 100);
    const soundStatus = await loadedStore.get('soundStatus');

    setBatteryInfo({
      level: roundedLevel / 100,
      charging: battery.charging,
    });
    const icon = await resolveResource(`assets/tray/dark/` + roundedLevel + ".png");
    updateTray({
      tooltip: `Battery Status: ${roundedLevel}%${battery.charging ? ' (Charging)' : ' (Remaining)'
        }`,
      icon: icon,
    });

    if (battery.charging && battery.level >= 0.8 && !isAlerted) {
      notifyUser(
        `Battery level reached ${roundedLevel}%. Please unplug the charger`,
        'Warning:'
      );
      if (soundStatus !== 'stopped') return startSound();
    }

    if (!battery.charging || battery.level < 0.8) {
      stopSound();
    }
  };

  const checkIsEnabled = async () => {
    const enabled = await isEnabled();
    console.log('Is enabled:', enabled);
    setIsChecked(enabled);
  };

  checkIsEnabled();

  const handleCheckboxChange = async () => {
    if (isChecked) {
      await disable();
    } else {
      await enable();
    }
    setIsChecked(!isChecked);
  };


  const handleNavigate = (path) => {
    navigate(path);
  };




  const startSound = async () => {
    try {
      await invoke('play_sound');
      console.log('Sound started');
      isAlerted = true;
    } catch (error) {
      console.error('Error starting sound:', error);
    }
  };

  const stopSound = async () => {
    try {
      await invoke('stop_sound');
      console.log('Sound stopped');
      isAlerted = false;
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };



  const handleStopSound = () => {
    setPopupVisible(true);
  };

  const handleSelectTime = async (time) => {
    setPopupVisible(false);
    setIsSoundStopped(true);
    stopSound()
    let timeoutDuration;
    switch (time) {
      case '5min':
        timeoutDuration = 5 * 60 * 1000;
        break;
      case '10min':
        timeoutDuration = 10 * 60 * 1000;
        break;
      case '30min':
        timeoutDuration = 30 * 60 * 1000;
        break;
      case 'untilTurnedOn':
        timeoutDuration = null;
        break;
      default:
        timeoutDuration = null;
    }

    if (store) {
      await store.set('soundStatus', 'stopped');
      await store.set('stopTimestamp', Date.now());
      await store.set('stopDuration', timeoutDuration);
      await store.save();
      console.log('Stopped instantly');
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (timeoutDuration) {
      const id = setTimeout(async () => {
        handleStartSound();
      }, timeoutDuration);
      setTimeoutId(id);
    }
  };

  const handleStartSound = async () => {
    setIsSoundStopped(false);
    if(batteryInfo.charging && batteryInfo.level >= 0.8) {
      notifyUser(
        `Battery level reached ${Math.round(batteryInfo.level * 100)}%. Please unplug the charger`,
        'Stop Sound Time Reached:'
      );
       startSound() }
    if (store) {
      await store.set('soundStatus', 'started');
      await store.set('stopTimestamp', null);
      await store.set('stopDuration', null);
      await store.save();
      console.log('Started again');
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };


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
            <button onClick={() => handleSelectTime('5min')}>5 min</button>
            <button onClick={() => handleSelectTime('10min')}>10 min</button>
            <button onClick={() => handleSelectTime('30min')}>30 min</button>
            <button onClick={() => handleSelectTime('untilTurnedOn')}>Until I turn it back on</button>
          </div>
        </>
      )}

      <Routes>
        <Route path="/" element={<Home batteryInfo={batteryInfo} handleCheckboxChange={handleCheckboxChange} isChecked={isChecked} />} />
        <Route path="/settings" element={<Setting />} />
      </Routes>
    </div>

  );
};

export default App;