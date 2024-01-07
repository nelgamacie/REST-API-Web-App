"use client";
import { useState } from 'react';

const url = "http://localhost:5001";

export default function RegistrationPage() {
    // Define state variables to store form data and registration message
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [registrationMessage, setRegistrationMessage] = useState('');

    // Event handler to update form data when input fields change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Event handler to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // Send a POST request to the registration endpoint
            const response = await fetch(`${url}/api/register`, {
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

            // Parse the response data
            const data = await response.json();
            
            // Check if registration was successful
            if (response.ok) {
                // Display a success message
                setRegistrationMessage('Registration successful. Please check your email to verify your account.');
            } else {
                // Display an error message
                alert(data.message);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <div style={styles.registrationContainer}>
            {/* Title for the registration page */}
            <h1 style={styles.title}>Registration</h1>
            <form onSubmit={handleSubmit}>
                {/* Input fields for email, username, password, and confirm password */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
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
                    <label style={styles.label}>Username</label>
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
                    <label style={styles.label}>Password</label>
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
                    <label style={styles.label}>Confirm Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                    />
                </div>
                {/* Submit button */}
                <button type="submit" style={styles.submitButton}>Register</button>
            </form>

            {/* Display registration message if available */}
            {registrationMessage && (
                <div style={styles.messageSection}>
                    <p>{registrationMessage}</p>
                </div>
            )}
        </div>
    );
}

// Styles for the registration page
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
        color: 'white', // Set the title color to white
    },
    formGroup: {
        marginBottom: '15px',
        width: '100%', // Ensure full width
        maxWidth: '400px', // Max width for form controls
    },
    label: {
        color: 'white', // Set label color to white
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
        color: 'white', // Set the text color to white
    }
};

export const config = { runtime: 'client' };
