"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const url = "http://localhost:5001";

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loginMessage, setLoginMessage] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`${url}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });
    
            const data = await response.json();
            console.log('Login Response:', data); // Log the response for debugging
    
            if (response.ok) {
                localStorage.setItem('jwtToken', data.token);
    
                // Log the isAdmin value for debugging
                console.log('Is Admin:', data.isAdmin);
    
                // Redirect based on user role
                if (data.isAdmin) {
                    console.log('Redirecting to Admin Panel');
                    router.push('/Admin'); // Redirect to Admin Panel
                } else {
                    console.log('Redirecting to Authenticated User page');
                    router.push('/AuthenticatedUser'); // Redirect to List Manager
                }
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
                <button type="submit" style={styles.submitButton}>Login</button>
    
                {/* Link to the Change Password Page */}
                <div style={styles.changePasswordLink}>
                    <Link href="/ChangePassword">Change Password?</Link>
                </div>
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
        color: 'white', // Set the title color to white
    },
    formGroup: {
        marginBottom: '1rem',
        width: '100%',
        maxWidth: '400px',
    },
    label: {
        color: 'white', // Set label color to white
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
        color: 'white',
    },
    changePasswordLink: {
        marginTop: '20px',
        textAlign: 'center',
    },
};

export const config = { runtime: 'client' };
