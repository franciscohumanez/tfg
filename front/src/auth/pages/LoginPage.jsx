import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import Swal from 'sweetalert2'
import logo from '../img/logoLogin.png';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

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
            
            <Form onSubmit={handleSubmit} className='auth-form animate__animated animate__fadeIn animate__faster'>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className='auth-label'>Usuario</Form.Label>
                    <Form.Control 
                        type="text" 
                        className="auth-textfield auth-placeholder" 
                        placeholder="correo@google.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label className='auth-label'>Contraseña</Form.Label>
                    <Form.Control
                        label="Contraseña" 
                        type="password" 
                        placeholder="·········"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='auth-textfield auth-placeholder'
                    />
                </Form.Group>
                <Button className='auth-button' type="submit">
                    Iniciar Sesión
                </Button>
            </Form>
        </div>
    )
}