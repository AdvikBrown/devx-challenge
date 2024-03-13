import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

const mySecretKey = "DEVX_PROJECT";

interface User {
  email: string;
  sessionHash: string;
  lastActiveDate?: Date;
  password?: string;
  otp?: number;
}

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const users: User[] = [];

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.post('/login', (req, res) => {
  const { email } = req.body;
  const result = {};
  let user = users.find(u => u.email === email);

  if (!user) {
    const sessionHash = uuidv4();
    user = { email, sessionHash };
    users.push(user);
    result["message"] = "User created successfully";
    result["session"] = sessionHash;
    result['challenge'] = 'set-password';
    logger.info('New user created', { email });
    return res.json(result);
  }
  if (!user.password) {
    result["session"] = user.sessionHash;
    result['challenge'] = 'set-password';
    return res.json(result);
  }

  const inactiveThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (user.lastActiveDate < inactiveThreshold) {
    const oneTimePassword = Math.floor(100000 + Math.random() * 900000);
    user.otp = oneTimePassword;
    logger.info('Generated OTP', { email, otp: oneTimePassword });
    result["session"] = user.sessionHash;;
    result['challenge'] = 'validate-email';
    return res.json(result);
  }

  result["session"] = user.sessionHash;
  result['challenge'] = 'ask-password';

  return res.json(result);
});

app.post('/set_password', (req, res) => {
  const { session, newPassword } = req.body;
  const user = users.find(u => u.sessionHash === session);
  try {
    user.password = newPassword;
    const token = jwt.sign({ session }, 'secret', { expiresIn: '1h' });
    user.lastActiveDate = new Date();
    logger.info('Password set successfully', { email: user.email });
    return res.json({ status: 'OK', jwtToken: token, message: 'Password set successfully' });
  } catch (err) {
    logger.error('Error setting password', { error: err.message });
    return res.status(404).json({ error: 'error' });
  }
});

app.post('/confirm_password', (req, res) => {
  const { session, password } = req.body;

  const user = users.find(u => u.sessionHash === session);

  if (user) {
    if (user.password) {
      if (user.password === password) {
        const jwtToken = jwt.sign({ session }, mySecretKey, { expiresIn: '1h' });
        user.lastActiveDate = new Date();
        logger.info('User logged in successfully', { email: user.email });
        return res.json({ status: 'OK', jwtToken });
      } else {
        logger.info('Invalid password', { email: user.email });
        return res.json({ error: 'Password does not match' });
      }
    } else {
      return res.json({ session, challenge: 'set-password' });
    }
  } else {
    logger.info('User not found');
    return res.json({ error: 'User not found' });
  }
});

app.post('/otp', (req, res) => {
  const { session, secret } = req.body;
  const user = users.find(u => u.sessionHash === session);

  if (user) {
    const otp = Number(secret);
    if (user.otp === otp) {
      const jwtToken = jwt.sign({ session }, mySecretKey, { expiresIn: '1h' });
      user.lastActiveDate = new Date();
      logger.info('User logged in successfully with OTP', { email: user.email });
      return res.json({ status: 'OK', jwtToken, message: "Successfully validated your email! " });
    }
    logger.info('Invalid OTP', { email: user.email });
    return res.json({ error: 'Invalid Number' });

  } else {
    logger.info('User not found');
    return res.json({ error: 'User not found' });
  }
});

app.listen(port, host, () => {
  logger.info(`Server is running on http://${host}:${port}`);
});
