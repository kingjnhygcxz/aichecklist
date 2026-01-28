import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { safeRedirect } from '@/lib/security';
import { useLocation } from 'wouter';

export function SimpleAuth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      
      if (response.ok) {
        const userData = await response.json();
        
        if (userData.sessionId) {
          localStorage.setItem('sessionId', userData.sessionId);
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.username}!`,
          });
          
          setTimeout(() => {
            safeRedirect('/');
          }, 500);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '8px',
        border: '1px solid #333',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#22c55e', fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>
          AICHECKLIST
        </h1>
        <p style={{ color: '#999', marginBottom: '32px', textAlign: 'center' }}>
          Sign in to your account
        </p>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0a0a0b',
                border: '1px solid #333',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0a0a0b',
                border: '1px solid #333',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ color: '#666', marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          Test account: client1@aichecklist.com / client1234
        </p>
      </div>
    </div>
  );
}