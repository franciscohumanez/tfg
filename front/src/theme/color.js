import { createTheme } from "@mui/material";
import { red } from "@mui/material/colors";

export const colorTheme = createTheme({
    palette: {
        primary: {
            main: '#28B463'
        },
        secondary: {
            main: '#E5E7E9'
        },
        error: {
            main: red.A400
        }
    }
})