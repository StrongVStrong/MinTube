import AudioTest from './components/AudioTest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Watch from './components/Watch';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch" element={<Watch />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;