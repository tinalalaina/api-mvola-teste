import { useContext } from 'react'
import { AuthContext } from '../state/authContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.')
  }
  return context
}
