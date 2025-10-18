import Column from './Column';
import './Board.css';

function Board({ runners, onMove, onRemove, onRemoveAll }) {
  // Group runners by status
  const runnersByStatus = {
    warming: [],
    queue: [],
    done: []
  };
  
  Object.values(runners).forEach(runner => {
    if (runnersByStatus[runner.status]) {
      runnersByStatus[runner.status].push(runner);
    }
  });
  
  // Sort by timestamp (newest first for warming/queue, oldest first for done)
  runnersByStatus.warming.sort((a, b) => a.start_ts - b.start_ts);
  runnersByStatus.queue.sort((a, b) => (a.queue_ts || 0) - (b.queue_ts || 0));
  runnersByStatus.done.sort((a, b) => (b.end_ts || 0) - (a.end_ts || 0));
  
  return (
    <div className="board">
      <Column
        title="Aan het opwarmen"
        status="warming"
        runners={runnersByStatus.warming}
        onMove={onMove}
        onRemove={onRemove}
        onRemoveAll={onRemoveAll}
      />
      <Column
        title="In de wachtrij"
        status="queue"
        runners={runnersByStatus.queue}
        onMove={onMove}
        onRemove={onRemove}
        onRemoveAll={onRemoveAll}
      />
      <Column
        title="Heeft gelopen"
        status="done"
        runners={runnersByStatus.done}
        onMove={onMove}
        onRemove={onRemove}
        onRemoveAll={onRemoveAll}
      />
    </div>
  );
}

export default Board;