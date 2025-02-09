
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Dashboard from "./Dashboard";
import { createRoot } from 'react-dom/client'
import VideoCall from "./VideoCall";


createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/videocall" element={<VideoCall/>} />
    </Routes>
  </Router>,
)
