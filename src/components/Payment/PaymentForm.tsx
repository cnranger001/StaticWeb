import React, { useState, useEffect } from 'react'
import useSupabase from '../../hooks/useSupabase'
import { useAuth } from '../../context/AuthContext'

const PaymentForm = () => {
  const supabase = useSupabase()
  const { user } = useAuth()
  const [costCenters, setCostCenters] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [formData, setFormData] = useState({
    cost_center_id: '',
    payment_amount: '',
    vendor_id: '',
    payment_date: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: ccData } = await supabase.from('cost_center').select('*')
      const { data: vendorData } = await supabase.from('vendor').select('*')
      setCostCenters(ccData || [])
      setVendors(vendorData || [])
    }
    fetchData()
  }, [supabase])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const paymentAmount = parseFloat(formData.payment_amount)
    const isHighValue = paymentAmount > 10000
    
    const { data: manager } = await supabase
      .from('employee')
      .select('*')
      .eq('id', user?.supervisor_id)
      .single()

    const { data: vp } = isHighValue 
      ? await supabase
          .from('employee')
          .select('*')
          .eq('id', manager?.supervisor_id)
          .single()
      : { data: null }

    const { error } = await supabase.from('payment_request').insert([{
      ...formData,
      id: crypto.randomUUID(),
      status: 'pending',
      creator_id: user?.id,
      approving_manager_id: manager?.id,
      approving_vp_id: vp?.id,
      payment_amount: paymentAmount
    }])

    if (error) {
      console.error('Error inserting payment request:', error)
      alert('Failed to submit payment request. Please try again.')
      return
    }

    alert('Payment request submitted successfully!')

    setFormData({
      cost_center_id: '',
      payment_amount: '',
      vendor_id: '',
      payment_date: ''
    })
  }

  return (
    <div className="payment-form">
      <h3>Submit Payment Request</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Cost Center:</label>
          <select 
            value={formData.cost_center_id}
            onChange={(e) => setFormData({...formData, cost_center_id: e.target.value})}
            required
          >
            <option value="">Select Cost Center</option>
            {costCenters.map(cc => (
              <option key={cc.id} value={cc.id}>{cc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Payment Amount:</label>
          <input
            type="number"
            value={formData.payment_amount}
            onChange={(e) => setFormData({...formData, payment_amount: e.target.value})}
            required
          />
        </div>
        <div>
          <label>Vendor:</label>
          <select 
            value={formData.vendor_id}
            onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
            required
          >
            <option value="">Select Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Payment Date:</label>
          <input
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default PaymentForm