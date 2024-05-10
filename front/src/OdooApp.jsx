import { AppRouter } from "./router/AppRouter"
import { AppTheme } from "./theme/AppTheme"

export const OdooApp = () => {
    return (
        <AppTheme>
            <AppRouter />
        </AppTheme>
    )
}
