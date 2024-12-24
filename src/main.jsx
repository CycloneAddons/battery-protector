import React from "react";
import ReactDOM from "react-dom/client";  // Import from react-dom/client
import "./main.css";
import App from "./view/App";
import Background from "./view/background/bg";
import Footer from "./view/background/footer";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);  // Create root using createRoot
root.render(
  // <React.StrictMode>
  <>
  <Background />
  <App />
  <Footer />
</>

  // </React.StrictMode>
);
