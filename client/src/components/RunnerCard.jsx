import { useState, useEffect } from 'react';
import './RunnerCard.css';

function RunnerCard({ runner, onRemove, onManualTimeUpdate }) {
  const [elapsed, setElapsed] = useState(0);
  const [editing, setEditing] = useState(false);
  const [manualTime, setManualTime] = useState('');

  // Calculate elapsed time
  useEffect(() => {
    const calculateElapsed = () => {
      const now = Date.now();
      let startTime = 0;
      let endTime = null;

      if (runner.status === 'warming') startTime = runner.start_ts;
      else if (runner.status === 'queue') startTime = runner.queue_ts || now;
      else if (runner.status === 'done') {
        startTime = runner.queue_ts || runner.start_ts;
        endTime = runner.end_ts;
      }

      const elapsed = endTime ? endTime - startTime : now - startTime;
      setElapsed(Math.max(0, elapsed));
    };

    calculateElapsed();
    if (runner.status !== 'done') {
      const interval = setInterval(calculateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [runner]);

  // Reset when entering queue
  useEffect(() => {
    if (runner.status === 'queue') {
      setElapsed(0);
      runner.queue_ts = Date.now();
    }
  }, [runner.status]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleDragStart = (e) => {
    if (runner.status === 'done') return e.preventDefault();
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ runnerId: runner.id, currentStatus: runner.status })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(runner.id);
  };

  const handleTimeClick = () => {
    if (runner.status === 'done') {
      setManualTime(formatTime(elapsed));
      setEditing(true);
    }
  };

  const handleTimeChange = (e) => setManualTime(e.target.value);

  const applyManualTime = () => {
    const parts = manualTime.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs)) {
        const newElapsed = (mins * 60 + secs) * 1000;
        setElapsed(newElapsed);
        onManualTimeUpdate?.(runner.id, newElapsed);
        setEditing(false);
        return;
      }
    }
    alert('Invalid time format (use mm:ss)');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyManualTime();
    else if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="runner-card" draggable onDragStart={handleDragStart}>
      <div className="runner-card-content">
        <div className="runner-name">{runner.name}</div>

        <div className="runner-time" onClick={handleTimeClick}>
          {editing ? (
            <div className="time-edit">
              <input
                type="text"
                value={manualTime}
                onChange={handleTimeChange}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                className="apply-button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  applyManualTime();
                }}
              >
                ✓
              </button>
            </div>
          ) : (
            formatTime(elapsed)
          )}
        </div>

        <div className="runner-meta">
          {runner.status === 'warming' && 'Opwarmen'}
          {runner.status === 'queue' && 'Lopen'}
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
