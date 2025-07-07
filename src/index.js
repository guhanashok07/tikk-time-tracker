import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
=======
import './index.css'; // This line is CRUCIAL for Tailwind CSS to be included
import MainApp from './App'; // Assuming your main component is named MainApp in App.js
import reportWebVitals from './reportWebVitals'; // Keep if present, otherwise remove
>>>>>>> 89442a839dabe057b1c703a82857d50dc517453a

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <App />
=======
    <MainApp />
>>>>>>> 89442a839dabe057b1c703a82857d50dc517453a
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
<<<<<<< HEAD
reportWebVitals();
=======
reportWebVitals();
>>>>>>> 89442a839dabe057b1c703a82857d50dc517453a
