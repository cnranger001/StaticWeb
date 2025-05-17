import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import useSupabase from '../hooks/useSupabase'
import PaymentForm from './Payment/PaymentForm'
import PaymentList from './Payment/PaymentList'
import ApprovalList from './Payment/ApprovalList'

// Define the VPViewItem type
type VPViewItem = {
  department_name: string
  cost_center_name: string
}

const Tabs = () => {
  const { user } = useAuth()
  const supabase = useSupabase()
  const [activeTab, setActiveTab] = useState('me')
  const [managers, setManagers] = useState([]) // For the Delegation dropdown
  const [delegations, setDelegations] = useState([]) // For the Delegation table
  const [holidays, setHolidays] = useState([]) // For the Holiday table

  useEffect(() => {
    const fetchManagers = async () => {
      if (user?.employee_type === 'vp') {
        const { data, error } = await supabase
          .from('employee')
          .select('id, first_name, last_name')
          .eq('supervisor_id', user.id) // Assuming `supervisor_id` links managers to the VP
          .eq('employee_type', 'manager')

        if (!error) {
          setManagers(data.map((manager) => ({
            id: manager.id,
            name: `${manager.first_name} ${manager.last_name}`,
          })))
        }
      }
    }

    const fetchDelegations = async () => {
      if (user?.employee_type === 'vp') {
        const { data, error } = await supabase
          .from('Delegation')
          .select('id, manager_id, fromDateTime, toDateTime, employee(first_name, last_name)')
          .eq('vp_id', user.id)

        if (!error) {
          setDelegations(data.map((delegation) => ({
            id: delegation.id,
            manager_name: `${delegation.employee.first_name} ${delegation.employee.last_name}`,
            fromDateTime: delegation.fromDateTime,
            toDateTime: delegation.toDateTime,
          })))
        }
      }
    }

    const fetchHolidays = async () => {
      if (user?.employee_type === 'manager') {
        const { data, error } = await supabase
          .from('Holiday')
          .select('id, fromDateTime, toDateTime')
          .eq('manager_id', user.id)

        if (!error) {
          setHolidays(data)
        }
      }
    }

    fetchManagers()
    fetchDelegations()
    fetchHolidays()
  }, [user, supabase])

  const handleDelegationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const delegateTo = formData.get('delegateTo')

    const { error } = await supabase
      .from('Delegation')
      .insert({
        vp_id: user.id,
        manager_id: delegateTo,
        fromDateTime: new Date(),
      })

    if (!error) {
      // Refresh delegations
      const { data } = await supabase
        .from('Delegation')
        .select('id, manager_id, fromDateTime, toDateTime, employee(first_name, last_name)')
        .eq('vp_id', user.id)

      setDelegations(data)
    }
  }

  const handleCancelDelegation = async (id: number) => {
    const { error } = await supabase
      .from('Delegation')
      .update({ toDateTime: new Date() })
      .eq('id', id)

    if (!error) {
      // Refresh delegations
      const { data } = await supabase
        .from('Delegation')
        .select('id, manager_id, fromDateTime, toDateTime, employee(first_name, last_name)')
        .eq('vp_id', user.id)

      setDelegations(data)
    }
  }

  const handleHolidaySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fromDate = formData.get('fromDate')
    const toDate = formData.get('toDate')

    const { error } = await supabase
      .from('Holiday')
      .insert({
        manager_id: user.id,
        fromDateTime: fromDate,
        toDateTime: toDate,
      })

    if (!error) {
      // Refresh holidays
      const { data } = await supabase
        .from('Holiday')
        .select('id, fromDateTime, toDateTime')
        .eq('manager_id', user.id)

      setHolidays(data)
    }
  }

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
        {user.employee_type === 'vp' && (
          <button
            className={activeTab === 'delegation' ? 'active' : ''}
            onClick={() => setActiveTab('delegation')}
          >
            Delegation
          </button>
        )}
        {user.employee_type === 'manager' && (
          <button
            className={activeTab === 'holiday' ? 'active' : ''}
            onClick={() => setActiveTab('holiday')}
          >
            Holiday
          </button>
        )}
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

        {activeTab === 'payments' && user.employee_type === 'associate' && (<PaymentForm />)}
        {activeTab === 'payments' && user.employee_type === 'manager' && (<PaymentList />)}
        {activeTab === 'payments' && user.employee_type === 'vp' && (<PaymentList />)}

        {activeTab === 'delegation' && user.employee_type === 'vp' && (
          <>
            <h2>Delegation</h2>
            <form onSubmit={handleDelegationSubmit}>
              <label>
                Delegate To:
                <select name="delegateTo" required>
                  {managers.map((manager: any) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Submit</button>
            </form>
            <h3>Existing Delegations</h3>
            <table>
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {delegations.map((delegation: any) => (
                  <tr key={delegation.id}>
                    <td>{delegation.manager_name}</td>
                    <td>{delegation.fromDateTime}</td>
                    <td>{delegation.toDateTime || 'Ongoing'}</td>
                    <td>
                      {!delegation.toDateTime && (
                        <button onClick={() => handleCancelDelegation(delegation.id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'holiday' && user.employee_type === 'manager' && (
          <>
            <h2>Holiday</h2>
            <form onSubmit={handleHolidaySubmit}>
              <label>
                From:
                <input type="date" name="fromDate" required />
              </label>
              <label>
                To:
                <input type="date" name="toDate" required />
              </label>
              <button type="submit">Submit</button>
            </form>
            <h3>Existing Holidays</h3>
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday: any) => (
                  <tr key={holiday.id}>
                    <td>{holiday.fromDateTime}</td>
                    <td>{holiday.toDateTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

export default Tabs