// PasswordModal.tsx
import React, { useState } from 'react';
import { Modal, Button, TextField, Box } from '@mui/material';

interface PasswordModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (otp: string) => void;
    title: string;
}
  

const PasswordModal: React.FC<PasswordModalProps> = ({ open, onClose, onSubmit, title }) => {
  const [password, setPassword] = useState('');
  const handleSubmit = () => {
      onSubmit(password);
  };
  return (
    <Modal open={open} onClose={onClose}  
    style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Box sx={{ width: 400, bgcolor: 'background.paper', p: 2 }}>
        <h2>{title}</h2>
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" onClick={onClose} sx={{ mr: 1 }}>
            Close
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PasswordModal;
