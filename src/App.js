import './App.css'
import axios from "axios"
import { AppRouter } from './router/AppRouter'

axios.defaults.baseURL = process.env.REACT_APP_LAZURDITA_API_URL || "https://node-la-zurdita-app-api.onrender.com/api"
console.log(axios.defaults.baseURL)
function App() {
  return (
<div className="App">
      <AppRouter />
    </div>
  )
}

export default App
