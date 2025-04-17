import React, { createContext, useContext, useState, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'

type AuthContextType = {
  user: any
  vpview: any
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [vpview, setVpview] = useState<any>(null)
  const supabaseUrl = 'https://rhbjcqgmeuyyipnstrpm.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYmpjcWdtZXV5eWlwbnN0cnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MDg1OTAsImV4cCI6MjA2MDA4NDU5MH0.xR-pVUEbmYVi97mqgUgqabff8cTNEjI1xUblL5Loi50'
  const supabase = createClient(supabaseUrl, supabaseKey)

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('employee')
      .select(`
      *,
      cost_center:cost_center_id (name,
      department:department_id (name))      
      `)
      .eq('email', email)
      .eq('password_hash', password)
      .single()

    if (error || !data) return false
   
    setUser(data)
    
    const { data: vpData, error: vpError } = await supabase
      .from('vp_view')
      .select('*')
      .eq('vp_id', data.id)       

    if (vpError || !vpData) return false

    console.log('VP Data:', vpData)
    
    setVpview(vpData)

    return true
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, vpview, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}