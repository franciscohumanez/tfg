import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/auth/authSlice';



export const useCheckAuth = () => {
  
    const { status } = useSelector( state => state.auth );
    const dispatch = useDispatch();

    useEffect(() => {
        
        // Aquí puedes implementar tu lógica para verificar la autenticación del usuario
        // Por ejemplo, podrías verificar si hay un token almacenado en localStorage
        const token = localStorage.getItem('token');

        if (token) {
            // Si hay un token almacenado, el usuario está autenticado
            // Puedes despachar una acción de inicio de sesión con los datos del usuario si es necesario
            // Por ejemplo, dispatch(login({ uid: '', email: '', displayName: '', photoURL: '' }));
            // Reemplaza los valores vacíos con los datos reales del usuario si los tienes disponibles
            dispatch(login({ uid: '', email: '', displayName: '', photoURL: '' }));
        } else {
            // Si no hay un token almacenado, el usuario no está autenticado
            // Puedes despachar una acción de cierre de sesión si es necesario
            dispatch(logout());
        }
    }, [dispatch]);

    return status;
}