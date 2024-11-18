import React, {Component, createContext, useState} from "react";
import {createRoot} from "react-dom/client"; // 引入 createRoot 而不是 render

import RouterPage from "./router/RouterPage";

const App = () => {

    return (
        <RouterPage />
    );
}

export default App;

const appDiv = document.getElementById("app");

// 使用 createRoot 而不是 render
const root = createRoot(appDiv);
root.render(<App/>);

