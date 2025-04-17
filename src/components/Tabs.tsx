import React, { useState } from 'react'

// Define the VPViewItem type
type VPViewItem = {
  department_name: string
  cost_center_name: string
}
import { useAuth } from '../context/AuthContext'
import PaymentForm from './Payment/PaymentForm'
import PaymentList from './Payment/PaymentList'
import ApprovalList from './Payment/ApprovalList'

const Tabs = () => {
  const { user } = useAuth()
  const { vpview } = useAuth()
  
  const [activeTab, setActiveTab] = useState('me')

  if (!user) return null

  return (
    <div className="tabs-container">
      <div className="tabs">
        <button 
          className={activeTab === 'me' ? 'active' : ''}
          onClick={() => setActiveTab('me')}
        >
          Me
        </button>
        <button 
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'me' && (
          <>
            <h2>My Information</h2>
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>Role: {user.employee_type}</p>
            {(user.employee_type === 'associate' || user.employee_type === 'manager') && (
              <>
                <p>Department: {user.cost_center.department.name}</p>
                <p>Cost Center: {user.cost_center.name}</p>
              </>
            )}
            
            {user.employee_type === 'vp' && (
              <>
                <p>Departments:</p>
                <ul>
                    {vpview?.map((item: VPViewItem, index: number) => (
                    <li key={index}>{item.department_name}</li>
                    ))}
                </ul>
                <p>Cost Centers:</p>
                <ul>
                    {vpview?.map((item: VPViewItem, index: number) => (
                    <li key={index}>{item.cost_center_name}</li>
                    ))}
                </ul>
              </>
            )}

            {user.employee_type === 'associate' && <PaymentList />}
            <ApprovalList />
          </>
        )}

        {activeTab === 'payments' && user.employee_type === 'associate' && (<PaymentForm /> )}
        {activeTab === 'payments' && user.employee_type === 'manager' && (<PaymentList /> )}
        {activeTab === 'payments' && user.employee_type === 'vp' && (<PaymentList /> )}
      </div>
    </div>
  )
}

export default Tabs