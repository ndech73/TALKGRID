import { AuthProvider } from './shared/context/AuthContext'
import AppRouter from './router'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App