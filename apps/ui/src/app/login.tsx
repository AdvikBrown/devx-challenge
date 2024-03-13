// imports
import React, { useState } from 'react';
import httpCommon from './httpCommon';
import { Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import 'react-toastify/dist/ReactToastify.css';

import OTPInputModal from './components/OTPInputModal';
import PasswordModal from './components/PasswordInputModal';


const Login: React.FC = () => {
  // State Management
  const [email, setEmail] = useState('');
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showConfirmPasswordModal, setShowConfirmPasswordModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [token, setToken] = useState('');

  // Helper Functions
  const getSession = () => {
    const session = localStorage.getItem('session');
    if (!session) {
      toast.error("Can not get session.");
      return;
    }
    return session;
  };

  const validateEmail = (value: string) => {
    // Regular expression for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      toast.error('Invalid email address');
      return false;
    }
    return true;
  };

  // Event Handlers
  const handleLogin = async () => {
    try {
      if (!validateEmail(email)) return;

      const response = await httpCommon.post('/login', { email });

      localStorage.setItem("session", response.data.session);
      if (response.data.challenge === 'ask-password') {
        setShowConfirmPasswordModal(true);
        return;
      }
      if (response.data.challenge === 'set-password') {
        setShowSetPasswordModal(true);
        return;
      }
      if (response.data.challenge === 'validate-email') {
        setShowOTPModal(true);
        return;
      }
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleNewPasswordConfirmation = async (password) => {
    setShowSetPasswordModal(false);
    try {
      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64);
      const session = getSession();
      const response = await httpCommon.post('/set_password', { session, newPassword: hashedPassword });

      if (response.data.status === 'OK') {
        toast.success("Logged in. Confirm your jwtToken in console.");
        const jwtToken = response.data.jwtToken;
        localStorage.setItem("token", jwtToken);
        console.log(jwtToken);
      } else
        toast.error(response.data.error);
    } catch (error) {
      toast.error('Error occurred while setting a new password.');
    }
  };

  const handleConfirmPasswordConfirmation = async (password) => {
    setShowConfirmPasswordModal(false);
    try {
      const session = getSession();
      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64);
      const response = await httpCommon.post('/confirm_password', { session, password: hashedPassword });

      if (response.data.status === 'OK') {
        toast.success("Logged in. Confirm your jwtToken in console.");
        const jwtToken = response.data.jwtToken;
        localStorage.setItem("token", jwtToken);
        console.log(jwtToken);
      } else
        toast.error(response.data.error);
    } catch (error) {
      toast.error('Error occurred while confirming the new password.');
    }
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
  };

  const handleSubmitOTP = async (otp: string) => {
    console.log('Submitting OTP:', otp);
    const session = getSession();
    const response = await httpCommon.post('/otp', { session, secret: otp });
    if (response.data.status === 'OK') {
      toast.success("Logged in. Confirm your jwtToken in console.");
      const jwtToken = response.data.jwtToken;
      localStorage.setItem("token", jwtToken);
      console.log(jwtToken);
      setShowOTPModal(false);
    } else
      toast.error(response.data.error);
  };

  // Return JSX
  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Login Page</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="d-grid">
                <button onClick={handleLogin} className="btn btn-primary mb-3">Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PasswordModal open={showSetPasswordModal} onClose={() => setShowSetPasswordModal(false)} onSubmit={handleNewPasswordConfirmation} title="Set New Password"/>
      <PasswordModal open={showConfirmPasswordModal} onClose={() => setShowConfirmPasswordModal(false)} onSubmit={handleConfirmPasswordConfirmation} title="Confirm your Password"/>

      <OTPInputModal open={showOTPModal} onClose={handleCloseOTPModal} onSubmitOTP={handleSubmitOTP} />
    </div>
  );
};

export default Login;
