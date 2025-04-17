import React, { useState, useEffect } from 'react'
import useSupabase from '../../hooks/useSupabase'
import { useAuth } from '../../context/AuthContext'

const ApprovalList = () => {
  const supabase = useSupabase()
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const fetchRequests = async () => {
      let query = supabase
        .from('payment_request')
        .select('*, cost_center(*), vendor(*)')

      if (user?.employee_type === 'manager') {
        query = query.eq('approving_manager_id', user.id).eq('status', 'pending')
      } else if (user?.employee_type === 'vp') {
        query = query.eq('approving_vp_id', user.id).eq('status', 'manager_approved')
      }

      const { data } = await query
      setRequests(data || [])
    }
    fetchRequests()
  }, [supabase, user])

  const handleApprove = async (id: string) => {
    const newStatus = user?.employee_type === 'manager' 
      ? 'manager_approved' 
      : 'vp_approved'
    
    await supabase
      .from('payment_request')
      .update({ 
        status: newStatus,
        ...(user?.employee_type === 'manager' 
          ? { manager_action_date: new Date().toISOString() }
          : { vp_action_date: new Date().toISOString() })
      })
      .eq('id', id)
  }

  const handleReject = async (id: string) => {
    const newStatus = user?.employee_type === 'manager' 
      ? 'manager_rejected' 
      : 'vp_rejected'
    
    await supabase
      .from('payment_request')
      .update({ 
        status: newStatus,
        ...(user?.employee_type === 'manager' 
          ? { manager_action_date: new Date().toISOString() }
          : { vp_action_date: new Date().toISOString() })
      })
      .eq('id', id)
  }

  if (!['manager', 'vp'].includes(user?.employee_type)) return null

  return (
    <div className="approval-list">
      <h3>Pending Approvals</h3>
      <table>
        <thead>
          <tr>
            <th>Cost Center</th>
            <th>Amount</th>
            <th>Vendor</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.cost_center?.name}</td>
              <td>${req.payment_amount}</td>
              <td>{req.vendor?.name}</td>
              <td>{req.payment_date}</td>
              <td>
                <button onClick={() => handleApprove(req.id)}>Approve</button>
                <button onClick={() => handleReject(req.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ApprovalList