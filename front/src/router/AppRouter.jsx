import { Navigate, Route, Routes } from "react-router-dom"
import { AuthRoutes } from "../auth/routes/AuthRoutes"
import { DashboardPage } from "../dashboard/page/DashboardPage"
import { Projects } from "../dashboard/page/Projects";
import { TaskProject } from "../dashboard/page/TaskProject";
import { useCheckAuth } from "../hooks/useCheckAuth";
import { CheckingAuth } from "../ui/components/CheckingAuth";
import { ProjectEmployee } from "../dashboard/page/ProjectsEmployee";
import { Employee } from "../dashboard/page/Employee";
import { Asdf } from "../dashboard/page/Asdf";
import { Tasks } from "../dashboard/page/Tasks";
import TasksEmployee from "../dashboard/page/TasksEmployee";

export const AppRouter = () => {

    const status = useCheckAuth();

    if ( status === 'checking' ) {
        return <CheckingAuth />
    }

    return (
        <Routes>
            {status === 'authenticated' ? (
                    <>
                        <Route path='/' element={<DashboardPage />}>
                            <Route index element={<Asdf />} />
                            <Route path="projects" element={<Projects />} />
                            <Route path="projectsEmployee" element={<ProjectEmployee />} />
                            <Route path="tasks" element={<Tasks />} />
                            <Route path="tasksEmployee" element={<TasksEmployee />} />
                            <Route path="employee" element={<Employee />} />
                            <Route path='tasks/:projectId' element={<TaskProject />} />
                        </Route>
                        <Route path='*' element={<Navigate to="/" />} />
                    </>
                ) : (
                    <>
                        <Route path="/auth/*" element={<AuthRoutes />} />
                        <Route path='*' element={<Navigate to='/auth/login' />} />
                    </>
                )}
        </Routes>
    )
}