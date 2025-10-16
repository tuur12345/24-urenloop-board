import { useState } from 'react';
import RunnerCard from './RunnerCard';
import './QueueCard.css';

function QueueCard({ title = 'Aan het lopen', currentRunner, onMoveToQueue, onGetNext, onStop, onRemove }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    try {
      const { runnerId } = JSON.parse(data);
      if (runnerId) {
        // Ask parent to move this runner into queue (parent handles pushing existing queue to done)
        onMoveToQueue(runnerId);
      }
    } catch (err) {
      // ignore parse errors
    }
  };

  return (
    <div
      className={`queue-card ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="queue-header">
        <h2>⏳ {title}</h2>
        <span className="queue-count">{currentRunner ? 1 : 0}</span>
      </div>

      <div className="queue-body">
        {currentRunner ? (
          <RunnerCard runner={currentRunner} onRemove={onRemove} />
        ) : (
          <div className="queue-empty">Geen loper in de wachtrij</div>
        )}
      </div>

      <div className="queue-controls">
        <button className="queue-button" onClick={onGetNext}>
          Get next
        </button>
        <button
          className="queue-button"
          onClick={onStop}
          disabled={!currentRunner}
          title={currentRunner ? 'Stop en verplaats naar done' : 'Geen runner in queue'}
        >
          ▶️
        </button>
      </div>
    </div>
  );
}

export default QueueCard;
