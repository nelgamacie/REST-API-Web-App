"use client";

import { useState } from 'react';

export default function RegistrationPage() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [registrationMessage, setRegistrationMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setRegistrationMessage('Registration successful. Please check your email to verify your account.');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <div style={styles.registrationContainer}>
            <h1 style={styles.title}>Registration</h1>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
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
                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.submitButton}>Register</button>
            </form>

            {registrationMessage && (
                <div style={styles.messageSection}>
                    <p>{registrationMessage}</p>
                </div>
            )}
        </div>
    );
}

const styles = {
    registrationContainer: {
        width: '100vw', // Use viewport width
        height: '100vh', // Use viewport height to take up full screen
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        padding: '20px',
    },
    title: {
        marginBottom: '20px',
        fontSize: '32px', // Sets the size of the font
        fontWeight: 'bold', // Makes the font bold
        textAlign: 'center', // Centers the title
        marginBottom: '20px', // Adds some space below the title
        color: '#333', // Sets the font color,
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
    },
    messageSection: {
        marginTop: '20px',
        textAlign: 'center',
        maxWidth: '400px', // Match the max width for form controls
    }
   
};

export const config = { runtime: 'client' };
