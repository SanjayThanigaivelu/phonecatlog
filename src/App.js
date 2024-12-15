import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Fitness from "./Fitness";
function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<Fitness/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
