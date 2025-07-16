import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CheckoutForm.css';

const CheckoutForm = () => {
  const [form, setForm] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    amount: ''
  });

  const [isProduction, setIsProduction] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const storedToggle = localStorage.getItem('isProduction');
    if (storedToggle !== null) {
      setIsProduction(storedToggle === 'true');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "cardNumber") newValue = value.replace(/\D/g, "").slice(0, 16);
    else if (name === "cvv") newValue = value.replace(/\D/g, "").slice(0, 4);
    else if (name === "expMonth") newValue = value.replace(/\D/g, "").slice(0, 2);
    else if (name === "expYear") newValue = value.replace(/\D/g, "").slice(0, 4);
    else if (name === "amount") newValue = value.replace(/[^0-9.]/g, "");

    setForm({ ...form, [name]: newValue });
  };

  const handleToggle = () => {
    const newValue = !isProduction;
    setIsProduction(newValue);
    localStorage.setItem('isProduction', newValue);
    setResponse(null); // Clear old message when switching mode
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null);

    try {
      const res = await axios.post('http://localhost:5000/api/payment', {
        ...form,
        isProduction
      });
      setResponse(res.data);
    } catch (err) {
      setResponse(err.response?.data || { message: 'Unexpected error' });
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-card">
        <h2>Authorize.Net Payment</h2>

        <div className="mode-toggle">
          <label className="switch">
            <input type="checkbox" checked={isProduction} onChange={handleToggle} />
            <span className="slider"></span>
          </label>
          <span className="mode-label">{isProduction ? 'Production Mode' : 'Sandbox Mode'}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="text" name="cardNumber" placeholder="Card Number" value={form.cardNumber} onChange={handleChange} required />
          <input type="text" name="expMonth" placeholder="MM" value={form.expMonth} onChange={handleChange} required />
          <input type="text" name="expYear" placeholder="YYYY" value={form.expYear} onChange={handleChange} required />
          <input type="text" name="cvv" placeholder="CVV" value={form.cvv} onChange={handleChange} required />
          <input type="text" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required />
          <button type="submit">Pay</button>
        </form>

        {response && (
          <div className={`response-message ${response.success ? 'success' : 'error'}`}>
            {response.success ? (
              <>
                ✅ {response.message}<br />
                Transaction ID: {response.transactionId}<br />
                <strong>Mode: {response.mode}</strong>
              </>
            ) : (
              <>❌ {response.message}</>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
