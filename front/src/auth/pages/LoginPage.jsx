import { Button, Grid, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import Swal from 'sweetalert2'
import './StyleLogin.css';

// import { useNavigate } from "react-router-dom"

export const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] =useState("");
    const navigate = useNavigate();

    const database = 'odoo';
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Envia los parametros en xml a la url de la api
        try {
            const response = await axios.post("http://localhost:3000/api/login", { database, email, password });
            
            const token = response.data.token;
           
            localStorage.setItem('token', token);  
            window.location.reload();
            //navigate('/');

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
        <div className="auth-layout">
            <div className="auth-header">
                <img src="https://via.placeholder.com/150" alt="Logo" />
                <Typography variant="h5" component="h5">
                    Ingeniería e Instalaciones
                </Typography>
            </div>
            
            <form onSubmit={handleSubmit} className='auth-form animate__animated animate__fadeIn animate__faster'>
                <Grid container spacing={2}>
                    <Grid item xs={ 12 }>
                        <TextField 
                            autoFocus
                            label="Correo" 
                            type="text" 
                            placeholder="correo@google.com"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='MuiTextField-root'
                            InputProps={{ className: 'MuiInputBase-root' }}
                        />
                    </Grid>
                    <Grid item xs={ 12 }>
                        <TextField 
                            label="Contraseña" 
                            type="password" 
                            placeholder="Contraseña"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='MuiTextField-root'
                            InputProps={{ className: 'MuiInputBase-root' }}
                        />
                    </Grid>

                    <Grid item xs={ 12 }>
                        <Button 
                            // disabled={ isAuthenticating }
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            className='MuiButton-root'>
                            Iniciar Sesión
                        </Button>
                    </Grid>
                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                        <Typography variant="body2" component="p">
                            Si quieres eliminar tu cuenta, por favor acceda <a href="#">aquí</a>
                        </Typography>
                    </Grid>
                </Grid>
            </form>
        
        </div>
    )
}