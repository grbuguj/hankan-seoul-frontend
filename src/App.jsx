import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SquaresProvider } from './context/SquaresContext';
import Home from './pages/Home';
import Admin from './pages/Admin';

export default function App() {
  return (
    <SquaresProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </SquaresProvider>
  );
}
