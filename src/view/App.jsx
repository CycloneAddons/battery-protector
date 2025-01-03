import React, { useState, useEffect } from 'react';
import { setupTray, updateTray } from '../app-api/setupTray';
import { notifyUser } from '../app-api/notify';
import { invoke } from '@tauri-apps/api/core';
import './app.css';
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart'
import { resolveResource } from '@tauri-apps/api/path';


const App = () => {
  const [batteryInfo, setBatteryInfo] = useState({
    level: 1,
    charging: true,
  });
  const [isChecked, setIsChecked] = useState(false);
  let isAlerted = false;

  useEffect(() => {
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

    const updateBatteryInfo = async (battery) => {
      const roundedLevel = Math.round(battery.level * 100);

      setBatteryInfo({
        level: roundedLevel / 100,
        charging: battery.charging,
      });
      const icon = await resolveResource(`assets/tray/dark/`+roundedLevel+".png");
console.log(icon)
      updateTray({
        tooltip: `Battery Status: ${roundedLevel}%${
          battery.charging ? ' (Charging)' : ' (Remaining)'
        }`,
        icon: icon,
      });

      if (battery.charging && battery.level >= 0.8 && !isAlerted) {
        startSound();
        notifyUser(
          `Battery level reached ${roundedLevel}%. Please unplug the charger`,
          'Warning:'
        );
      }

      if (!battery.charging || battery.level < 0.8) {
        stopSound();
      }
    };

    const getBatteryInfo = async () => {
      const battery = await navigator.getBattery();
      updateBatteryInfo(battery);
      const iconStart = await resolveResource(`assets/tray/dark/`+Math.round(battery.level * 100)+".png");
console.log(iconStart)
      setupTray({
        tooltip: `Battery Status: ${Math.round(battery.level * 100)}%${
          battery.charging ? ' (Charging)' : ' (Remaining)'
        }`,
        icon: iconStart,
      });

      battery.addEventListener('levelchange', async () => await updateBatteryInfo(battery));
      battery.addEventListener('chargingchange', async () =>
       await updateBatteryInfo(battery)
      );
    };

    getBatteryInfo();

    const checkIsEnabled = async () => {
      const enabled = await isEnabled();
      console.log('Is enabled:', enabled);
      setIsChecked(enabled);
    };

    checkIsEnabled();
  }, []);

  const handleCheckboxChange = async () => {
    if (isChecked) {
      await disable();
    } else {
      await enable();
    }
    setIsChecked(!isChecked);
  };
  
  return (
    <div>
      <div className="card">
        
            <p className="ctitle"><span>Battery Level</span></p>
            <div className={`g-circle ${!batteryInfo.charging ? 'hidden' : ''}`}></div>
          
        <p className="ccontent battery-p">{Math.round(batteryInfo.level * 100)}%</p>
      </div>
      <div className="card buttom">
        <p className="ctitle autostart"><span>Autostart</span></p>
        <label className="cosmic-toggle">
          <input 
            className="toggle" 
            type="checkbox" 
            checked={isChecked} 
            onChange={handleCheckboxChange} 
          />
          <div className="slider">
            <div className="cosmos" />
            <div className="energy-line" />
            <div className="energy-line" />
            <div className="energy-line" />
            <div className="toggle-orb">
              <div className="inner-orb" />
              <div className="ring" />
            </div>
            <div className="particles">
              <div style={{ '--angle': '30deg' }} className="particle" />
              <div style={{ '--angle': '60deg' }} className="particle" />
              <div style={{ '--angle': '90deg' }} className="particle" />
              <div style={{ '--angle': '120deg' }} className="particle" />
              <div style={{ '--angle': '150deg' }} className="particle" />
              <div style={{ '--angle': '180deg' }} className="particle" />
            </div>
          </div>
        </label>
        <p className="ccontent on-of">{isChecked ? 'On' : 'Off'}</p>
      </div>
    </div>
  );
};

export default App;
