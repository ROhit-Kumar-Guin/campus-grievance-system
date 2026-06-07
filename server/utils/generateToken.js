import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign(
    // Payload — data stored inside the token
    { id: userId, role },
    // Secret key from .env
    process.env.JWT_SECRET,
    // Options
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

export default generateToken;