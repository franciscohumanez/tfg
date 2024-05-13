import { Button, Grid, TextField } from "@mui/material"
import { AuthLayout } from "../layout/AuthLayout"
import { useEffect, useState } from "react"
import axios from "axios"
import Swal from 'sweetalert2'
// import { useNavigate } from "react-router-dom"

export const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] =useState("");
    // const navigate = useNavigate();

    const database = 'odoo';
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Envia los parametros en xml a la url de la api
        try {
            const response = await axios.post("http://localhost:3000/api/login", { database, email, password });
            console.log(response)
            const token = response.data.token;
           
            localStorage.setItem('token', token);
            window.location.reload();
            // navigate('/', { replace: true })

        } catch (error){
            console.log("Error al iniciar sesión:", error)
            Swal.fire({
                showConfirmButton: true,
                icon: 'error',
                text: 'Error al iniciar sesión. Intentelo más tarde.'
            }).then(()=>{
                // localStorage.removeItem('token');
                window.location.reload(false)
            })
        }
    };

    return (
        <AuthLayout title="Login">
            <form onSubmit={handleSubmit} className='animate__animated animate__fadeIn animate__faster'>
                <Grid container>
                    <Grid item xs={ 12 } sx={{ mt: 2 }}>
                        <TextField 
                            label="Correo" 
                            type="text" 
                            placeholder="correo@google.com"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={ 12 } sx={{ mt: 2 }}>
                        <TextField 
                            label="Contraseña" 
                            type="password" 
                            placeholder="Contraseña"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Grid>

                    <Grid container spacing={ 2 } sx={{ mb: 2, mt: 1 }}>
                        <Grid item xs={ 12 }>
                            <Button 
                                // disabled={ isAuthenticating }
                                type="submit" 
                                variant="contained" 
                                fullWidth>
                                Login
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </AuthLayout>
    )
}