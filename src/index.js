import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This line is CRUCIAL for Tailwind CSS to be included
import MainApp from './App'; // Assuming your main component is named MainApp in App.js
import reportWebVitals from './reportWebVitals'; // Keep if present, otherwise remove

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();