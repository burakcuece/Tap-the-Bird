import React from 'react';
import Game from './components/Game';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      <Game />
      <Footer />
    </div>
  );
}

export default App;