import { useState, useEffect } from 'react';
import './RunnerCard.css';

function RunnerCard({ runner, onRemove }) {
  const [elapsed, setElapsed] = useState(0);
  
  // Calculate elapsed time based on server timestamps
  useEffect(() => {
    const calculateElapsed = () => {
      const now = Date.now();
      let startTime = 0;
      let endTime = null;

      if (runner.status === 'warming') {
        startTime = runner.start_ts;
      } else if (runner.status === 'queue') {
        startTime = runner.queue_ts || now;
      } else if (runner.status === 'done') {
        startTime = runner.queue_ts || runner.start_ts;
        endTime = runner.end_ts;
      }

      const elapsed = endTime ? (endTime - startTime) : (now - startTime);
      setElapsed(Math.max(0, elapsed));
    };

    
    // Initial calculation
    calculateElapsed();
    
    // Update every second for running timers
    if (runner.status !== 'done') {
      const interval = setInterval(calculateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [runner]);
  
useEffect(() => {
  if (runner.status === 'queue') {
    // reset the base timestamp each time it enters queue
    setElapsed(0);
    runner.queue_ts = Date.now();
  }
}, [runner.status]);


  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleDragStart = (e) => {
    if (runner.status === 'done') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify({
      runnerId: runner.id,
      currentStatus: runner.status
    }));
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleRemove = (e) => {
    e.stopPropagation();
    //if (window.confirm(`Weet je zeker dat je ${runner.name} wilt verwijderen?`)) {
      onRemove(runner.id);
    //}
  };
  
  return (
    <div
      className="runner-card"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="runner-card-content">
        <div className="runner-name">{runner.name}</div>
        <div className="runner-time">{formatTime(elapsed)}</div>
        <div className="runner-meta">
          {runner.status === 'warming' && 'Opwarmen'}
          {runner.status === 'queue' && 'Wachtrij'}
          {runner.status === 'done' && 'Gelopen'}
        </div>
      </div>
      
      {runner.status === 'done' && (
        <button
          className="remove-button"
          onClick={handleRemove}
          title="Verwijderen"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default RunnerCard;