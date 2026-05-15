import React from "react";import ReactDOM from "react-dom/client";import{BrowserRouter}from"react-router-dom";import"leaflet/dist/leaflet.css";import"./styles/app.css";import App from"./App.jsx";
const basename=import.meta.env.BASE_URL==="/"?undefined:import.meta.env.BASE_URL.replace(/\/$/,"");
ReactDOM.createRoot(document.getElementById("root")).render(<BrowserRouter basename={basename}><App/></BrowserRouter>);
