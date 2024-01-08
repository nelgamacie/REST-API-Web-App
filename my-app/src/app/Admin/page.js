'use client';
import React, { useState, useEffect } from 'react';

// Define the URL for API requests
const url = 'http://localhost:5001';

const AdminPanel = () => {
    // State variables for users, selected user, public lists, and button label
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [publicLists, setPublicLists] = useState([]);
    const [selectedUserButtonLabel, setSelectedUserButtonLabel] = useState(''); // Added state for button label

    // Fetch users and public lists when the component mounts
    useEffect(() => {
        fetchUsers();
        fetchPublicLists();
    }, []);

    // Function to fetch non-admin users
    const fetchUsers = async () => {
        const token = localStorage.getItem('jwtToken');
        try {
            // Send a GET request to retrieve non-admin users
            const response = await fetch(`${url}/api/nonAdminUsers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data); // Set the 'users' state with the fetched data
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    
    // Function to fetch public lists
    const fetchPublicLists = async () => {
        const token = localStorage.getItem('jwtToken');
        try {
            // Send a GET request to retrieve public lists
            const response = await fetch(`${url}/api/publicLists`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPublicLists(data); // Set the 'publicLists' state with the fetched data
        } catch (error) {
            console.error('Error fetching public lists:', error);
        }
    };

    // Function to handle user selection
    const handleUserChange = (e) => {
        setSelectedUser(e.target.value); // Update the 'selectedUser' state with the selected user
    };

    // Function to handle the submission of granting admin privileges
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        try {
            // Send a PATCH request to grant admin privileges to the selected user
            await fetch(`${url}/api/admin/grantAdmin`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: selectedUser, grant: true })
            });
            fetchUsers(); // Fetch updated user data after granting admin privileges
        } catch (error) {
            console.error('Error updating admin status:', error);
        }
    };

    // Function to toggle review visibility
    const toggleReviewVisibility = async (listName, reviewId) => {
        const token = localStorage.getItem('jwtToken');
        try {
            // Send a PATCH request to toggle the visibility of a review
            await fetch(`${url}/api/secure/savedLists/${listName}/review/${reviewId}/visibility`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPublicLists(); // Fetch updated public lists data after toggling review visibility
        } catch (error) {
            console.error('Error toggling review visibility:', error);
        }
    };
    
    // Function to toggle user deactivation
    const toggleUserDeactivation = async (username, isDeactivated) => {
        const token = localStorage.getItem('jwtToken');
        try {
            // Send a PATCH request to toggle the deactivation status of a user
            await fetch(`${url}/api/users/${username}/deactivate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deactivate: !isDeactivated })
            });
            
            // Optimistic update to reflect user deactivation status
            setUsers(users.map(user => 
                user.username === username ? { ...user, isDeactivated: !isDeactivated } : user
            ));
        } catch (error) {
            console.error('Error toggling user deactivation:', error);
        }
    };
    
    // JSX for the admin panel component
    return (
        <div style={styles.container}>
            {/* Admin Panel Section */}
            <div style={styles.adminPanel}>
                <h2 style={styles.heading}>Admin Panel</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <label>
                        Select User to Grant Admin Privileges:
                        <select style={styles.select} value={selectedUser} onChange={handleUserChange}>
                            <option value="">Select a User</option>
                            {users.map(user => (
                                <option key={user.username} value={user.username}>{user.username}</option>
                            ))}
                        </select>
                    </label>
                    <button type="submit" style={styles.button}>Grant Admin</button>
                </form>
            </div>
    
            {/* Public Lists Section */}
            <div style={styles.listContainer}>
                {publicLists.map(list => (
                    <div key={list.listName} style={styles.list}>
                        <h3>{list.listName}</h3>
                        {list.reviews.map(review => (
                            <div key={`${list.listName}-${review.id}`} style={styles.review}>
                                <p>{review.comment} - {review.username}</p>
                                <button
                                    style={styles.toggleButton}
                                    onClick={() => toggleReviewVisibility(list.listName, review.id)}
                                >
                                    {review.hidden ? 'Unhide' : 'Hide'}
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
    
            {/* User Management Section */}
            <div style={styles.userList}>
                <h3>User Management</h3>
                {users.map(user => (
                    <div key={user.username} style={styles.userItem}>
                        <span>{user.username} - {user.email}</span>
                        <button
                            style={user.isDeactivated ? styles.activateButton : styles.deactivateButton}
                            onClick={() => toggleUserDeactivation(user.username, user.isDeactivated)}
                        >
                            {user.isDeactivated ? 'Activate' : 'Deactivate'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles for the components
const styles = {
    // Styling for the main container
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f4f6f8', // Light grey background for a subtle look
        fontFamily: 'Arial, sans-serif',
    },
    // Styling for the admin panel section
    adminPanel: {
        border: '1px solid #d3d3d3',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
    },
    // Styling for the admin panel heading
    heading: {
        color: '#2c3e50', // Dark blue for contrast
        marginBottom: '20px',
        textAlign: 'center', // Centered title
    },
    // Styling for the admin panel form
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    // Styling for the user selection dropdown
    select: {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ced4da', // Light grey border for inputs
        backgroundColor: '#e9ecef', // Light grey background for inputs
    },
    // Styling for the admin button
    button: {
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff', // Consistent blue for primary buttons
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold', // Bold text for buttons
    },
    // Styling for the public lists container
    listContainer: {
        width: '80%',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    // Styling for individual public lists
    list: {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    // Styling for individual reviews within public lists
    review: {
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // Styling for the toggle review visibility button
    toggleButton: {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#f39c12', // Orange for toggle buttons
        color: 'white',
        cursor: 'pointer',
    },
    // Styling for the user management section
    userList: {
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa', // Light grey for user list section
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '80%',
    },
    // Styling for individual user items
    userItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #eee',
        fontSize: '16px',
    },
    // Styling for the activate button
    activateButton: {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#28a745', // Green for activate buttons
        color: 'white',
        cursor: 'pointer',
    },
    // Styling for the deactivate button
    deactivateButton: {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#dc3545', // Red for deactivate buttons
        color: 'white',
        cursor: 'pointer',
    },
};

export default AdminPanel;
