import { Button, Grid, TextField, Typography } from "@mui/material"
import { styled } from '@mui/material/styles'
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import Swal from 'sweetalert2'
import './StyleLogin.css';
import logo from '../img/logoLogin.png';

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
                <img src={logo} alt="Logo" className="auth-logo" />
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
                            className='custom-textfield'
                            InputLabelProps={{ className: 'custom-input-label' }}
                            InputProps={{ className: 'custom-input' }}
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
                            className='custom-textfield'
                            InputLabelProps={{ className: 'custom-input-label' }}
                            InputProps={{ className: 'custom-input' }}
                        />
                    </Grid>

                    <Grid item xs={ 12 }>
                        <Button 
                            // disabled={ isAuthenticating }
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            className='custom-button'>
                            Iniciar Sesión
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    )
}