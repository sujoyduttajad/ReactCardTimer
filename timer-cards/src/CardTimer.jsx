import React from "react";
import { formatMMSS } from "./utils/functions";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

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
    <Box>
      <Card variant="outlined" sx={{ minWidth: 200, mb: 2, p: 2}}>
        <Stack >
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            {label}
          </Typography>
          <Box display={"flex"} alignItems={"center"} spacing={2} justifyContent={"space-between"} mb={1}>
            <Typography variant="h5" component="div">{formatMMSS(currentSeconds)}</Typography>
            {!isRunning ? (
              <Button onClick={() => onStart(id)} aria-label={`Start ${label}`}>
                Start Me
              </Button>
            ) : (
              <Button onClick={() => onStop(id)} aria-label={`Stop ${label}`}>
                Stop Me
              </Button>
            )}
          </Box>

          <Typography>Random tick: {intervalMs} ms</Typography>
        </Stack>
      </Card>
    </Box>
  );
});

export default MemoizedCardTimer;
