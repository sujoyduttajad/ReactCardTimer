
// Pads a number to ensure it has at least two digits
export const pad2 = (n) => {
  return String(n).padStart(2, "0");
};

// Formats total seconds into MM:SS format
export const formatMMSS = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${pad2(m)}:${pad2(s)}`;
};

// Returns a random integer between min and max values, inclusive
export const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Creates a timer object with random initial seconds and interval
export const createTimer = (i) => {
  const initial = randInt(0, 60);
  const intervalMs = randInt(200, 2800);

  return {
    id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    label: `Card ${i + 1}`,
    initialSeconds: initial,
    currentSeconds: initial,
    intervalMs,
    isRunning: false,
    nextDueAt: null, 
  };
};

// Generates an array of timer objects based on the select dropdown count
export const generateTimers = (count) => {
  return Array.from({ length: count }, (_, i) => createTimer(i));
};
