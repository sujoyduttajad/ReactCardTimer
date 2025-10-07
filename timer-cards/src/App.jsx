import { useEffect, useMemo, useRef, useState } from "react";
import MemoizedCardTimer from "./CardTimer";
import { generateTimers } from "./utils/functions";
import Container from "@mui/material/Container";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";

function App() {
  const [selectedCount, setSelectedCount] = useState(3);
  const [timers, setTimers] = useState(() => generateTimers(3));

  // This function counts how many timers are running currently
  const runningCount = useMemo(
    () => timers.reduce((c, t) => c + (t.isRunning ? 1 : 0), 0),
    [timers]
  );
  const anyRunning = runningCount > 0;

// Track running state inside a ref
  const anyRunningRef = useRef(anyRunning);
  useEffect(() => {
    anyRunningRef.current = anyRunning;
  }, [anyRunning]);


  const rafIdRef = useRef(null);
  // This function cancels the loop if active
  const cancelLoop = () => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };
  // This function ensures the loop is running
  /* 
    The window.requestAnimationFrame() method tells the browser you wish to perform an animation. 
    It requests the browser to call a user-supplied callback function before the next repaint.
    The frequency of calls to the callback function will generally match the display refresh rate. 
    The most common refresh rate is 60hz, (60 cycles/frames per second), though 75hz, 120hz, and 144hz 
    are also widely used. requestAnimationFrame() calls are paused in most browsers when running in 
    background tabs or hidden <iframe>s, in order to improve performance and battery life.
  */
  const ensureLoop = () => {
    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(timerLoopFunc);
    }
  };

  // This loop is an efficient way to update all timers that are runnning instead of using setInterval for each timer
  // The loop checks which timers need to be updated based on their nextDueAt timestamps
  // I used this method to minimize the number of state updates and re-renders
  const timerLoopFunc = (now) => {
    let didChange = false;
    setTimers((prev) => {
      let next = prev;
      for (let i = 0; i < prev.length; i++) {
        const t = prev[i];
        if (!t.isRunning || t.nextDueAt == null) continue;
        if (now >= t.nextDueAt) {
          const ticks = Math.floor((now - t.nextDueAt) / t.intervalMs) + 1;
          const updated = {
            ...t,
            currentSeconds: t.currentSeconds + ticks,
            nextDueAt: t.nextDueAt + ticks * t.intervalMs,
          };
          if (next === prev) next = prev.slice();
          next[i] = updated;
          didChange = true;
        }
      }
      return next;
    });

    if (anyRunningRef.current) {
      rafIdRef.current = requestAnimationFrame(timerLoopFunc);
    } else {
      cancelLoop();
    }
  };

  // Manage loop start/stop when running state changes
  useEffect(() => {
    if (anyRunning) ensureLoop();
    else cancelLoop();
    return cancelLoop;
  }, [anyRunning]);

  // Event handlers
  const handleChangeCount = (e) => {
    const newCount = parseInt(e.target.value, 10);
    setSelectedCount(newCount);
    cancelLoop();
    setTimers(generateTimers(newCount));
  };

  // This function starts all timers at once
  const startAll = () => {
    const now = performance.now();
    setTimers((prev) =>
      prev.map((t) => ({
        ...t,
        isRunning: true,
        nextDueAt: now + t.intervalMs,
      }))
    );
  };

  // This function stops all timers at once
  const stopAll = () => {
    cancelLoop();
    setTimers((prev) =>
      prev.map((t) => ({ ...t, isRunning: false, nextDueAt: null }))
    );
  };

  // This function resets all timers to their initial seconds
  const resetAll = () => {
    setTimers((prev) =>
      prev.map((t) => ({ ...t, currentSeconds: t.initialSeconds }))
    );
  };

  // This function starts a single timer by id
  const startOne = (id) => {
    const now = performance.now();
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, isRunning: true, nextDueAt: now + t.intervalMs }
          : t
      )
    );
  };

  // This function stops a single timer by id
  const stopOne = (id) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isRunning: false, nextDueAt: null } : t
      )
    );
  };

  return (
    <Container
      maxWidth="lg"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <h1>React Timer Card App</h1>

      <Stack direction="row" alignItems="center" margin={3} mb={5} gap={4} width={"100%"}>
        <FormControl variant="filled" size="small">
          <label>Select the number of timers</label>
          <Select
            labelId="timerCount-label"
            id="timerCount"
            value={selectedCount}
            label="Timers"
            onChange={handleChangeCount}
          >
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {runningCount === 0 ? (
          <>
            <Button variant="contained" color="primary" onClick={startAll}>
              Start All
            </Button>
            <Button variant="outlined" onClick={resetAll}>
              Reset All
            </Button>
          </>
        ) : (
          <Button variant="contained" color="error" onClick={stopAll}>
            Stop All
          </Button>
        )}
      </Stack>

      <Box
        display="grid"
        gridTemplateColumns={"repeat(auto-fit, minmax(250px, 1fr)) "}
        gap={2}
      >
        {timers.map((t) => (
          <MemoizedCardTimer
            key={t.id}
            id={t.id}
            label={t.label}
            currentSeconds={t.currentSeconds}
            intervalMs={t.intervalMs}
            isRunning={t.isRunning}
            onStart={startOne}
            onStop={stopOne}
          />
        ))}
      </Box>
    </Container>
  );
}

export default App;
