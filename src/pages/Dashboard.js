import React, { useState } from 'react';
import History from './History';
import Overview from './Overview';
import AddTransaction from './AddTransaction';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="dashboard-container">
      {/* <h2 className="dashboard-title"></h2> */}

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>

        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>

        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Add Transaction
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'history' && <History />}
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'add' && <AddTransaction />}
      </div>
    </div>
  );
};

export default Dashboard;
