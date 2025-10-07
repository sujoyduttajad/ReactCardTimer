import React from "react";
import { formatMMSS } from "./utils/functions";

const MemoizedCardTimer = React.memo(function CardTimer({
  id,
  label,
  currentSeconds,
  intervalMs,
  isRunning,
  onStart,
  onStop,
}) {
  return (
    <div className="rounded-xl border p-4 shadow-sm flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-semibold tabular-nums">
          {formatMMSS(currentSeconds)}
        </div>
        <div className="text-xs text-gray-400 mt-1">tick: ~{intervalMs} ms</div>
      </div>
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <button
            onClick={() => onStart(id)}
            className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            aria-label={`Start ${label}`}
          >
            Start Me
          </button>
        ) : (
          <button
            onClick={() => onStop(id)}
            className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            aria-label={`Stop ${label}`}
          >
            Stop Me
          </button>
        )}
      </div>
    </div>
  );
});

export default MemoizedCardTimer;
