import { createTheme } from '@mui/material/styles'

// Simple MUI theme; extend as needed
const theme = createTheme({
  typography: {
    fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  palette: {
    mode: 'light',
  },
})

export default theme
