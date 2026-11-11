import { HashRouter, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Search from './pages/Search';
import ReadingList from './pages/ReadingList';

function App() {
  return (
    <HashRouter>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/reading-list" element={<ReadingList />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
