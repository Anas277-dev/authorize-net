import React, { useState } from 'react';
import axios from 'axios';
import './CheckoutForm.css'; // Import the CSS

const CheckoutForm = () => {
  const [form, setForm] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    amount: ''
  });

  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "cardNumber") {
      newValue = value.replace(/\D/g, "").slice(0, 16);
    } else if (name === "cvv") {
      newValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "expMonth") {
      newValue = value.replace(/\D/g, "").slice(0, 2);
    } else if (name === "expYear") {
      newValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "amount") {
      newValue = value.replace(/[^0-9.]/g, "");
    }

    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/payment', form);
      setResponse(res.data);
    } catch (err) {
      setResponse(err.response?.data || { message: 'Unexpected error' });
    }
  };

  return (
    

    
  <div className="checkout-wrapper">
    <div className="checkout-card">
      <h2>Authorize.Net Payment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={form.cardNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="expMonth"
          placeholder="MM"
          value={form.expMonth}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="expYear"
          placeholder="YYYY"
          value={form.expYear}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          value={form.cvv}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <button type="submit">Pay</button>
      </form>
      {response && (
        <div className={`response-message ${response.success ? 'success' : 'error'}`}>
          {response.success ? (
            <>
              ✅ {response.message} <br />
              Transaction ID: {response.transactionId}
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
