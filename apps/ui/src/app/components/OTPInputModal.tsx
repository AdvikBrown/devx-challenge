// OTPInputModal.tsx
import React, { useState } from 'react';
import { Modal, TextField, Button, Box } from '@mui/material';

interface OTPInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitOTP: (otp: string) => void;
}

const OTPInputModal: React.FC<OTPInputModalProps> = ({ open, onClose, onSubmitOTP }) => {
  const [otp, setOTP] = useState('');

  const handleChangeOTP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Ensure input is numeric and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOTP(value);
    }
  };

  const handleSubmitOTP = () => {
    if (otp.length === 6) {
      // Send OTP to server
      onSubmitOTP(otp);

    } else {
      alert('Please enter a 6-digit OTP.');
    }
  };

  return (
    <Modal 
    open={open} 
    onClose={onClose} 
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Box sx={{ width: 400, bgcolor: 'background.paper', p: 2 }}>
        <h2>Enter 6-Digit OTP</h2>
        <TextField
          label="OTP"
          variant="outlined"
          fullWidth
          value={otp}
          onChange={handleChangeOTP}
          inputProps={{ maxLength: 6 }}
        />
        <Button variant="contained" onClick={handleSubmitOTP} sx={{ mt: 2 }}>
          Submit OTP
        </Button>
      </Box>
    </Modal>
  );
};

export default OTPInputModal;
