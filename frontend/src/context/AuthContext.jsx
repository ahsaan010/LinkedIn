import React from 'react'
import { createContext } from 'react'
export const authDataContext=createContext()

function AuthContext({children}) {
const serverUrl=(import.meta.env.VITE_API_URL || window.location.origin).replace(/\/+$/, '')
    let value={
         serverUrl
    }
  return (
    <div>
        <authDataContext.Provider value={value}>
        {children}
        </authDataContext.Provider>
    </div>
  )
}

export default AuthContext
