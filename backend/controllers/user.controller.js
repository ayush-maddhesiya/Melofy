// authController.js

import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Clerk } from '@clerk/clerk-sdk-node';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import { validationResult } from 'express-validator';

// Configure environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLERK_API_KEY = process.env.CLERK_API_KEY;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// Initialize auth clients
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
sgMail.setApiKey(SENDGRID_API_KEY);
const clerk = new Clerk({ apiKey: CLERK_API_KEY });

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */


exports.registerController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username is taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create user in Clerk (if using Clerk)
    const clerkUser = await clerk.users.createUser({
      emailAddress: email,
      password,
      username,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user in our database
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      authMethod: 'local',
      authProviderId: clerkUser.id // Store Clerk ID for reference
    });

    await user.save();

    // Generate JWT tokens
    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password (only for local auth users)
    if (user.authMethod === 'local') {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      return res.status(400).json({ 
        message: `This account uses ${user.authMethod} authentication. Please login using that method.` 
      });
    }

    // Generate tokens
    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Update user's last login time
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Google OAuth login/register
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.oauthGoogleController = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    // Generate a username based on the email (normalize it)
    let username = email.split('@')[0];
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Check if username exists, if so, make it unique
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        // Append random digits to make username unique
        username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
      }
      
      // Create user in Clerk
      const clerkUser = await clerk.users.createUser({
        emailAddress: email,
        username,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        externalId: googleId,
      });
      
      // Create new user in our database
      user = new User({
        username,
        email,
        profileImage: picture,
        authMethod: 'google',
        authProviderId: googleId,
        role: 'user'
      });
      
      await user.save();
    } else if (user.authMethod !== 'google') {
      // If user exists but used a different auth method before
      return res.status(400).json({
        message: `This email is already registered using ${user.authMethod} authentication.`
      });
    }
    
    // Generate tokens
    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Update user's last login time
    user.lastLogin = Date.now();
    await user.save();
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
};

/**
 * @desc    GitHub OAuth login/register
 * @route   POST /api/auth/github
 * @access  Public
 */
exports.oauthGithubController = async (req, res) => {
  const { code } = req.body;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description });
    }
    
    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });
    
    const githubUserData = await userResponse.json();
    
    // Get user's email (GitHub may not provide email in user data)
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });
    
    const emails = await emailsResponse.json();
    const primaryEmail = emails.find(email => email.primary)?.email || emails[0]?.email;
    
    if (!primaryEmail) {
      return res.status(400).json({ message: 'Unable to get email from GitHub' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email: primaryEmail });
    
    if (!user) {
      // Generate username based on GitHub username
      let username = githubUserData.login;
      
      // Check if username exists, if so, make it unique
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
      }
      
      // Create user in Clerk
      const clerkUser = await clerk.users.createUser({
        emailAddress: primaryEmail,
        username,
        firstName: githubUserData.name ? githubUserData.name.split(' ')[0] : '',
        lastName: githubUserData.name ? githubUserData.name.split(' ').slice(1).join(' ') : '',
        externalId: githubUserData.id.toString(),
      });
      
      // Create new user in our database
      user = new User({
        username,
        email: primaryEmail,
        profileImage: githubUserData.avatar_url,
        authMethod: 'github',
        authProviderId: githubUserData.id.toString(),
        role: 'user'
      });
      
      await user.save();
    } else if (user.authMethod !== 'github') {
      // If user exists but used a different auth method before
      return res.status(400).json({
        message: `This email is already registered using ${user.authMethod} authentication.`
      });
    }
    
    // Generate tokens
    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Update user's last login time
    user.lastLogin = Date.now();
    await user.save();
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ message: 'Server error during GitHub authentication' });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public (with refresh token cookie)
 */
exports.refreshTokenController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);
    
    res.json({
      success: true,
      token: newAccessToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear the invalid refresh token cookie
    res.clearCookie('refreshToken');
    
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logoutController = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * @desc    Send password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, we still return success even if email doesn't exist
      return res.json({ success: true, message: 'Password reset email sent if account exists' });
    }
    
    // Only local auth users can reset password
    if (user.authMethod !== 'local') {
      return res.status(400).json({
        message: `This account uses ${user.authMethod} authentication. Password reset is not applicable.`
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    
    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Save to user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Send email
    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Melofy - Password Reset',
      html: `
        <h1>You requested a password reset</h1>
        <p>Please go to this link to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    await sgMail.send(msg);
    
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // If we fail after setting the token, clear it
    if (error.code !== 'ENOENT') {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }
    
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPasswordController = async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  
  try {
    // Hash the token from params to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Find user with this token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // Send confirmation email
    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Melofy - Password Reset Success',
      html: `
        <h1>Password Reset Successful</h1>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    };
    
    await sgMail.send(msg);
    
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

/**
 * @desc    Verify email address
 * @route   GET /api/auth/verify-email/:verificationToken
 * @access  Public
 */
exports.verifyEmailController = async (req, res) => {
  const { verificationToken } = req.params;
  
  try {
    // Hash the token from params to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Set email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    
    await user.save();
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
exports.resendVerificationController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = Date.now() + 86400000; // 24 hours
    
    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    // Save to user document
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpire = verificationExpiry;
    await user.save();
    
    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    // Send email
    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Melofy - Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>This link is valid for 24 hours.</p>
      `
    };
    
    await sgMail.send(msg);
    
    res.json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending verification email' });
  }
};

/**
 * @desc    Change password (for logged in users)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePasswordController = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only local auth users can change password
    if (user.authMethod !== 'local') {
      return res.status(400).json({
        message: `This account uses ${user.authMethod} authentication. Password change is not applicable.`
      });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    // Send notification email
    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Melofy - Password Changed',
      html: `
        <h1>Password Change Notification</h1>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    };
    
    await sgMail.send(msg);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

// Helper functions for token generation
function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// Export all controllers
module.exports = {
  registerController: exports.registerController,
  loginController: exports.loginController,
  oauthGoogleController: exports.oauthGoogleController,
  oauthGithubController: exports.oauthGithubController,
  refreshTokenController: exports.refreshTokenController,
  logoutController: exports.logoutController,
  forgotPasswordController: exports.forgotPasswordController,
  resetPasswordController: exports.resetPasswordController,
  verifyEmailController: exports.verifyEmailController,
  resendVerificationController: exports.resendVerificationController,
  changePasswordController: exports.changePasswordController
};