import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatBot from "./ChatBot";

export default function App() {
return (
<Router>
<Routes>
<Route path="/" element={<ChatBot />} />
</Routes>
</Router>
);
}