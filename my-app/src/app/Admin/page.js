import React, { useState, useEffect } from 'react';

const AdminPage = () => {
  const [adminData, setAdminData] = useState([]);
  const [newAdminItem, setNewAdminItem] = useState('');

  useEffect(() => {
    // Fetch admin data from your API and set it in the state
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Make an API request to fetch admin data
      const response = await fetch('your-admin-api-endpoint');
      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      } else {
        console.error('Failed to fetch admin data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleAddAdminItem = async () => {
    try {
      // Make an API request to add a new admin item
      const response = await fetch('your-admin-api-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newItem: newAdminItem }),
      });
      if (response.ok) {
        // Update the admin data with the new item
        const newItemData = await response.json();
        setAdminData([...adminData, newItemData]);
        setNewAdminItem('');
      } else {
        console.error('Failed to add admin item');
      }
    } catch (error) {
      console.error('Error adding admin item:', error);
    }
  };

  const handleDeleteAdminItem = async (itemId) => {
    try {
      // Make an API request to delete an admin item
      const response = await fetch(`your-admin-api-endpoint/${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove the item from the admin data
        setAdminData(adminData.filter(item => item.id !== itemId));
      } else {
        console.error('Failed to delete admin item');
      }
    } catch (error) {
      console.error('Error deleting admin item:', error);
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      
      {/* Form to add a new admin item */}
      <div>
        <input
          type="text"
          placeholder="New Admin Item"
          value={newAdminItem}
          onChange={(e) => setNewAdminItem(e.target.value)}
        />
        <button onClick={handleAddAdminItem}>Add Item</button>
      </div>

      {/* List of admin items */}
      <ul>
        {adminData.map((item) => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => handleDeleteAdminItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
