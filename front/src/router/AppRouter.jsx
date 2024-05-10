import { Navigate, Route, Routes } from "react-router-dom"
import { AuthRoutes } from "../auth/routes/AuthRoutes"
import { DashboardPage } from "../dashboard/page/DashboardPage"
import { useCheckAuth } from "../hooks/useCheckAuth";
import { CheckingAuth } from "../ui/components/CheckingAuth";

export const AppRouter = () => {

    const status = useCheckAuth();

    if ( status === 'checking' ) {
        return <CheckingAuth />
    }

    return (
        <Routes>
            
            {
                (status === 'authenticated')
                ? <Route path="/*" element={ <DashboardPage /> } />
                : <Route path="/auth/*" element={ <AuthRoutes />} />
            }

            <Route path='/*' element={ <Navigate to='/auth/login' />  } />
            
        </Routes>
    )
}