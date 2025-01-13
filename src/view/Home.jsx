import React from 'react';
import './app.css';
const Home = ({ batteryInfo, handleCheckboxChange, isChecked }) => {
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

export default Home;
