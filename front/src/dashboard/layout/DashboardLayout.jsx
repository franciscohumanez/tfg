import { Box } from "@mui/material"

export const DashboardLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            {/* Navbar */}


            {/* Sidebar */}

            <Box 
                component='main'
                sx={{ flexGrow: 1, p: 3}}
            >
                { children }

            </Box>

        </Box>
    )
}
