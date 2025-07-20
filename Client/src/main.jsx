import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import App from './App'
import './index.css'

// Configure React Router future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter {...router}>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)
