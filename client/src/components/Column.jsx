import { useState } from 'react';
import RunnerCard from './RunnerCard';
import './Column.css';

function Column({ title, status, runners, onMove, onRemove, onRemoveAll }) {
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
  
  const handleRemoveAll = () => {
    if (runners.length === 0) return;
    
    const confirmed = window.confirm(
      `Weet je zeker dat je alle ${runners.length} gelopen runner(s) wilt verwijderen?`
    );
    
    if (confirmed && onRemoveAll) {
      onRemoveAll(status);
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
          {title}
        </h2>
        <div className="column-header-right">
          {status === 'done' && runners.length > 0 && (
            <button 
              className="remove-all-button" 
              onClick={handleRemoveAll}
              title="Verwijder alle gelopen runners"
            >
              Alles wissen
            </button>
          )}
          <span className="column-count">{runners.length}</span>
        </div>
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
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Column;