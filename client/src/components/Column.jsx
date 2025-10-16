import { useState } from 'react';
import RunnerCard from './RunnerCard';
import './Column.css';

function Column({ title, status, runners, onMove, onRemove, onManualTimeUpdate, emoji }) {
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
    if (data) {
      const { runnerId, currentStatus } = JSON.parse(data);
      
      // Only move if dropping in different column
      if (currentStatus !== status) {
        onMove(runnerId, status);
      }
    }
  }; 

  return (
    <div 
      className={`column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <h2>
          <span className="column-emoji">{emoji}</span>
          {title}
        </h2>
        <span className="column-count">{runners.length}</span>
      </div>
      
      <div className="column-content">
        {runners.length === 0 ? (
          <div className="empty-state">
            Geen lopers
          </div>
        ) : (
          runners.map(runner => (
            <RunnerCard
              key={runner.id}
              runner={runner}
              onRemove={onRemove}
              onManualTimeUpdate={onManualTimeUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Column;