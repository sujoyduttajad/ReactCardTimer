import { createTheme } from '@mui/material/styles'


const theme = createTheme({
  typography: {
    fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  palette: {
    mode: 'light',
  },
})

export default theme
