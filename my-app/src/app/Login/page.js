// src/app/login/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loginMessage, setLoginMessage] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
   
        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
            });
   
            const data = await response.json();
            if (response.ok) {
                // Store the JWT token in localStorage
                localStorage.setItem('jwtToken', data.token);
   
                // Redirect to the List Manager page
                router.push('/AuthenticatedUser'); // Replace '/listManager' with the actual route to your List Manager page
            } else {
                setLoginMessage('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Network error:', error);
            setLoginMessage('Network error: ' + error.message);
        }
    };
   

    return (
        <div style={styles.loginContainer}>
            <h1 style={styles.title}>Login</h1>
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
                <button type="submit" style={styles.submitButton}>Login</button>
            </form>

            {loginMessage && (
                <div style={styles.messageSection}>
                    <p>{loginMessage}</p>
                </div>
            )}
        </div>
    );
}

const styles = {
    loginContainer: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '20px 0',
    },
    formGroup: {
        marginBottom: '1rem',
        width: '100%',
        maxWidth: '400px',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    submitButton: {
        width: '100%',
        maxWidth: '400px',
        padding: '10px',
        margin: '10px 0',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#0070f3',
        color: 'white',
        cursor: 'pointer',
    },
    messageSection: {
        marginTop: '20px',
        textAlign: 'center',
    },
};

export const config = { runtime: 'client' };
