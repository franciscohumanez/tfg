import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { BrowserRouter } from 'react-router-dom'
import { OdooApp } from './OdooApp'
import { Provider } from 'react-redux'
import { store } from './store/store'
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={ store }>
      <BrowserRouter>
        <OdooApp />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
