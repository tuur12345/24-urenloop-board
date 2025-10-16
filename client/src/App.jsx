import { useState, useEffect } from 'react';
import useSocket from './hooks/useSocket';
import Board from './components/Board';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  
  const {
    runners,
    connectionStatus,
    addRunner,
    moveRunner,
    removeRunner
  } = useSocket();
  
  const handleAddRunner = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addRunner(name.trim());
      setName('');
    }
  };
  
  const handleRemoveRunner = (id) => {
    // Check if PIN is required (you can make this configurable)
    const requiresPin = false; // Set to true if ADMIN_PIN is configured
    
    if (requiresPin && !showPinPrompt) {
      setPendingRemoveId(id);
      setShowPinPrompt(true);
    } else {
      removeRunner(id, pin || undefined);
      setShowPinPrompt(false);
      setPendingRemoveId(null);
      setPin('');
    }
  };
  
  const cancelPinPrompt = () => {
    setShowPinPrompt(false);
    setPendingRemoveId(null);
    setPin('');
  };
  
  return (
    <div className="app">
      <header className="header">
        <h1>🏃 24-urenloop Board</h1>
        <div className={`status status-${connectionStatus}`}>
          {connectionStatus === 'connected' && '● Verbonden'}
          {connectionStatus === 'connecting' && '◐ Verbinden...'}
          {connectionStatus === 'disconnected' && '○ Niet verbonden'}
        </div>
      </header>
      
      <div className="add-runner-section">
        <form onSubmit={handleAddRunner} className="add-runner-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naam van de loper..."
            className="add-runner-input"
            disabled={connectionStatus !== 'connected'}
          />
          <button 
            type="submit" 
            className="add-runner-button"
            disabled={connectionStatus !== 'connected' || !name.trim()}
          >
            Toevoegen
          </button>
        </form>
      </div>
      
      {showPinPrompt && (
        <div className="pin-modal-overlay">
          <div className="pin-modal">
            <h3>Admin PIN vereist</h3>
            <p>Voer de admin PIN in om deze loper te verwijderen:</p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="pin-input"
              autoFocus
            />
            <div className="pin-modal-buttons">
              <button 
                onClick={() => handleRemoveRunner(pendingRemoveId)}
                className="pin-confirm-button"
              >
                Bevestigen
              </button>
              <button 
                onClick={cancelPinPrompt}
                className="pin-cancel-button"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Board
        runners={runners}
        onMove={moveRunner}
        onRemove={handleRemoveRunner}
      />
      
      <footer className="footer">
        <p>Totaal lopers: {Object.keys(runners).length}</p>
      </footer>
    </div>
  );
}

export default App;