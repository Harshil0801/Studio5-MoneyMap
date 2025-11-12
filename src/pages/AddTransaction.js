import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import '../styles/Dashboard.css';

const AddTransaction = () => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const detectCategory = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('grocery') || d.includes('food')) return 'Grocery';
    if (d.includes('medicine') || d.includes('pharmacy')) return 'Medicine';
    if (d.includes('shop') || d.includes('clothes')) return 'Shopping';
    return 'Other';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert('You must be logged in!');

    const category = type === 'expense' ? detectCategory(description) : 'Income';
    const colRef = collection(db, 'users', user.uid, type === 'expense' ? 'expenses' : 'income');
    await addDoc(colRef, {
      amount: parseFloat(amount),
      description,
      category,
      date: new Date().toISOString(),
    });

    alert(`${type} added successfully!`);
    setAmount('');
    setDescription('');
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Add</button>
    </form>
  );
};

export default AddTransaction;
