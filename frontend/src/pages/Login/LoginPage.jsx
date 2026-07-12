import { useState, useRef } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CinematicHero from './components/CinematicHero';
import LoginForm from './components/LoginForm';
import DemoAccessGrid from './components/DemoAccessGrid';
import { authService } from '../../services/authService';
import './LoginPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const submitButtonRef = useRef(null);
  const navigate = useNavigate();

  const handleSelectAccount = (email, password) => {
    setForm({
      ...form,
      email,
      password,
    });
    setError('');
    setStatusMessage('');

    // Smoothly focus the submit button after autofilling
    if (submitButtonRef.current) {
      submitButtonRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    // 1. Check blank fields
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Validate password length
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(form.email, form.password);
      setLoading(false);
      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        setError(response.message);
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred during submission.');
    }
  };

  return (
    <div className="login-viewport">
      {/* Left side Cinematic Hero Panel (60% width) */}
      <CinematicHero />

      {/* Right side Authentication Panel (40% width) */}
      <div className="auth-panel" role="main" style={{ position: 'relative' }}>
        
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            padding: '8px 16px',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>

        <div className="auth-container">
          {/* Form Header */}
          <div className="auth-form-header">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h2 className="auth-title">Sign in to TransitOps</h2>
            <p className="auth-subtitle">
              Continue to your intelligent transport operations command center.
            </p>
          </div>

          {/* Status Message (Pending integration) */}
          {statusMessage && (
            <div className="status-banner info" role="status">
              <span className="status-banner-text">{statusMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <LoginForm
            form={form}
            setForm={setForm}
            error={error}
            loading={loading}
            showPw={showPw}
            setShowPw={setShowPw}
            handleSubmit={handleSubmit}
            submitButtonRef={submitButtonRef}
          />

          {/* 2x2 Demo Access Cards Section */}
          <DemoAccessGrid
            selectedEmail={form.email}
            onSelectAccount={handleSelectAccount}
          />

          {/* Security footer */}
          <div className="auth-footer">
            <Lock size={12} className="footer-lock-icon" />
            <span>Your data is secure with enterprise-grade protection.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
