import { useEffect, useMemo, useRef, useState } from "react";
import MemoizedCardTimer from "./CardTimer";
import { generateTimers } from "./utils/functions";
import Container from "@mui/material/Container";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";

function App() {
  const [selectedCount, setSelectedCount] = useState(3);
  const [timers, setTimers] = useState(() => generateTimers(3));

  // Derived global running state
  const runningCount = useMemo(
    () => timers.reduce((c, t) => c + (t.isRunning ? 1 : 0), 0),
    [timers]
  );
  const anyRunning = runningCount > 0;

  // Track running state inside a ref for the RAF loop closure
  const anyRunningRef = useRef(anyRunning);
  useEffect(() => {
    anyRunningRef.current = anyRunning;
  }, [anyRunning]);

  // RAF scheduler
  const rafIdRef = useRef(null);
  const cancelLoop = () => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };
  const ensureLoop = () => {
    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(tickLoop);
    }
  };

  const tickLoop = (now) => {
    // Advance only timers that are due; keep others by reference.
    let didChange = false;
    setTimers((prev) => {
      let next = prev;
      for (let i = 0; i < prev.length; i++) {
        const t = prev[i];
        if (!t.isRunning || t.nextDueAt == null) continue;
        if (now >= t.nextDueAt) {
          // How many ticks should have occurred?
          const ticks = Math.floor((now - t.nextDueAt) / t.intervalMs) + 1; // at least one
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
      rafIdRef.current = requestAnimationFrame(tickLoop);
    } else {
      cancelLoop();
    }
  };

  // Manage loop start/stop when running state changes
  useEffect(() => {
    if (anyRunning) ensureLoop();
    else cancelLoop();
    return cancelLoop; // cleanup on unmount
  }, [anyRunning]);

  // Event handlers
  const handleChangeCount = (e) => {
    const newCount = parseInt(e.target.value, 10);
    setSelectedCount(newCount);
    // Per spec: creating new timers stops everything, resets UI
    cancelLoop();
    setTimers(generateTimers(newCount));
  };

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

  const stopAll = () => {
    cancelLoop();
    setTimers((prev) =>
      prev.map((t) => ({ ...t, isRunning: false, nextDueAt: null }))
    );
  };

  const resetAll = () => {
    setTimers((prev) =>
      prev.map((t) => ({ ...t, currentSeconds: t.initialSeconds }))
    );
  };

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

  const stopOne = (id) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isRunning: false, nextDueAt: null } : t
      )
    );
  };

  return (
    <Container maxWidth="lg" display="flex" flexDirection="column" alignItems="center">
      <h1>React Timer Card App</h1>

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <FormControl size="small">
          <InputLabel id="timerCount-label">Timers</InputLabel>
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
