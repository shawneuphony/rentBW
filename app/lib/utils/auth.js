// lib/auth.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user) {
  // Ensure the ID is a string
  const tokenPayload = {
    id: String(user.id),  // Convert to string to be safe
    email: user.email,
    role: user.role
  };
  
  console.log('🔑 Generating token for:', tokenPayload);
  
  return jwt.sign(
    tokenPayload,
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return null;
  }
}