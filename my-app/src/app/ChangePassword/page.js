// src/app/change-password/page.js
"use client";

import { useState } from 'react';
const url = "http://localhost:5001";

export default function ChangePasswordPage() {
    const [formData, setFormData] = useState({
        username: '',
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [changePasswordMessage, setChangePasswordMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmNewPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${url}/api/changePassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setChangePasswordMessage('Password changed successfully.');
            } else {
                setChangePasswordMessage('Failed to change password: ' + data.message);
            }
        } catch (error) {
            console.error('Network error:', error);
            setChangePasswordMessage('Network error: ' + error.message);
        }
    };

    return (
        <div style={styles.changePasswordContainer}>
            <h1 style={styles.title}>Change Password</h1>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label>Username</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Old Password</label>
                    <input 
                        type="password" 
                        name="oldPassword" 
                        value={formData.oldPassword} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>New Password</label>
                    <input 
                        type="password" 
                        name="newPassword" 
                        value={formData.newPassword} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Confirm New Password</label>
                    <input 
                        type="password" 
                        name="confirmNewPassword" 
                        value={formData.confirmNewPassword} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.submitButton}>Change Password</button>
            </form>

            {changePasswordMessage && (
                <div style={styles.messageSection}>
                    <p>{changePasswordMessage}</p>
                </div>
            )}
        </div>
    );
}
const styles = {
    changePasswordContainer: {
        width: '100vw', // Use viewport width
        height: '100vh', // Use viewport height to take up full screen
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        padding: '20px',
        boxSizing: 'border-box', // Ensures padding doesn't increase size
        backgroundColor: '#f4f4f4' // Background color (optional)
    },
    title: {
        marginBottom: '20px',
        fontSize: '32px', // Sets the size of the font
        fontWeight: 'bold', // Makes the font bold
        textAlign: 'center', // Centers the title
        color: '#333', // Sets the font color
    },
    formGroup: {
        marginBottom: '15px',
        width: '100%', // Ensure full width
        maxWidth: '400px', // Max width for form controls
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px' // Slightly larger font for readability
    },
    submitButton: {
        width: '100%', // Full width
        maxWidth: '400px', // Max width for the button
        padding: '10px',
        margin: '0 auto', // Center the button
        display: 'block', // Block level for margin auto to work
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#0070f3',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px' // Matches input font size
    },
    messageSection: {
        marginTop: '20px',
        textAlign: 'center',
        maxWidth: '400px', // Match the max width for form controls
        fontSize: '14px', // Slightly smaller font for messages
        color: '#333' // Message text color
    }
};

export const config = { runtime: 'client' };
