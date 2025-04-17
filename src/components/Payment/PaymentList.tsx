import React, { useState, useEffect } from 'react';
import useSupabase from '../../hooks/useSupabase';
import { useAuth } from '../../context/AuthContext';

const PaymentList = () => {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;

      let query = supabase
        .from('payment_request')
        .select(`
          *,
          cost_center:cost_center_id(name),
          vendor:vendor_id(name),
          manager:approving_manager_id(first_name, last_name),
          vp:approving_vp_id(first_name, last_name)
        `)
        .order('created_date', { ascending: false });

      if (user.employee_type === 'associate') {
        query = query.eq('creator_id', user.id);
      } else if (user.employee_type === 'manager') {
        query = query.eq('approving_manager_id', user.id);
      } else if (user.employee_type === 'vp') {
        query = query.eq('approving_vp_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payments:', error);
      } else {
        setPayments(data || []);
      }
      setLoading(false);
    };

    fetchPayments();
  }, [supabase, user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="payment-list">
      <h3>My Payment Requests</h3>
      {payments.length === 0 ? (
        <p>No payment requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Cost Center</th>
              <th>Amount</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Approved By</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.cost_center?.name}</td>
                <td>${payment.payment_amount.toLocaleString()}</td>
                <td>{payment.vendor?.name}</td>
                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td className={`status-${payment.status.replace('_', '-')}`}>
                  {payment.status.split('_').join(' ')}
                </td>
                <td>
                  {payment.status.includes('manager') && payment.manager && (
                    `${payment.manager.first_name} ${payment.manager.last_name}`
                  )}
                  {payment.status.includes('vp') && payment.vp && (
                    `VP: ${payment.vp.first_name} ${payment.vp.last_name}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentList;