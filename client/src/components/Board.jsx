import Column from './Column';
import QueueCard from './QueueCard';
import './Board.css';

function Board({ runners, onMove, onRemove }) {
  // Convert runners prop to array (works whether it's object or array)
  const runnersArray = Array.isArray(runners) ? runners : Object.values(runners || {});

  // Group runners by status
  const runnersByStatus = {
    warming: [],
    queue: [],
    done: []
  };

  runnersArray.forEach(runner => {
    if (runnersByStatus[runner.status]) {
      runnersByStatus[runner.status].push(runner);
    }
  });

  // Sort: warming oldest-first (so getNext picks [0]), queue newest-first (but we only use first), done newest-first
  runnersByStatus.warming.sort((a, b) => a.start_ts - b.start_ts);
  runnersByStatus.queue.sort((a, b) => (b.queue_ts || 0) - (a.queue_ts || 0));
  runnersByStatus.done.sort((a, b) => (b.end_ts || 0) - (a.end_ts || 0));

  // Helper to find runner by id
  const findRunner = (id) => runnersArray.find(r => r.id === id);

  // Centralized move handler that enforces rules:
  // - Only one in queue
  // - If queue occupied and new one arrives, push current queue to done first
  const handleMove = (runnerId, newStatus) => {
    const runner = findRunner(runnerId);
    if (!runner) return;

    // If moving into queue
    if (newStatus === 'queue') {
      const currentQueue = runnersByStatus.queue[0];

      // If the runner is already in queue, nothing to do
      if (runner.status === 'queue') return;

      // If there's someone in queue and it's not the same runner -> push them to done
      if (currentQueue && currentQueue.id !== runnerId) {
        onMove(currentQueue.id, 'done');
      }

      // Now move the requested runner to queue
      onMove(runnerId, 'queue');
      return;
    }

    // For other moves (warming -> done etc.) just pass through
    onMove(runnerId, newStatus);
  };

  // "Get next" implementation: take oldest warming, push current queue to done, move oldest to queue
  const handleGetNext = () => {
    const oldest = runnersByStatus.warming[0];
    if (!oldest) return;

    const currentQueue = runnersByStatus.queue[0];
    if (currentQueue) {
      onMove(currentQueue.id, 'done');
    }
    onMove(oldest.id, 'queue');
  };

  // Stop current queue runner (move to done)
  const handleStopCurrent = () => {
    const currentQueue = runnersByStatus.queue[0];
    if (!currentQueue) return;
    onMove(currentQueue.id, 'done');
  };

  return (
    <div className="board">
      <Column
        title="Aan het opwarmen"
        status="warming"
        runners={runnersByStatus.warming}
        onMove={handleMove}
        onRemove={onRemove}
        emoji="🔥"
      />

      <QueueCard
        title="Aan het lopen"
        currentRunner={runnersByStatus.queue[0] || null}
        onMoveToQueue={(runnerId) => handleMove(runnerId, 'queue')}
        onGetNext={handleGetNext}
        onStop={handleStopCurrent}
        onRemove={onRemove}
      />

      <Column
        title="Heeft gelopen"
        status="done"
        runners={runnersByStatus.done}
        onMove={handleMove}
        onRemove={onRemove}
        emoji="✅"
      />
    </div>
  );
}

export default Board;
