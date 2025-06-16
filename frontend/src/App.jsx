import AudioTest from './components/AudioTest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Watch from './components/Watch';
import Search from './components/Search';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch" element={<Watch />} />   
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;