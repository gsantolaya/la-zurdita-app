import './App.css'
import axios from "axios"
import { AppRouter } from './router/AppRouter'

axios.defaults.baseURL = process.env.LAZURDITA_APP_API_URL || "https://node-la-zurdita-app-api.onrender.com/api"

function App() {
  return (
<div className="App">
      <AppRouter />
    </div>
  )
}

export default App
