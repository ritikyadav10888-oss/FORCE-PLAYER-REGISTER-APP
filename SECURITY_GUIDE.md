# Security Enhancement Guide for Force App

## 🔐 Current Security Implementation

### ✅ What's Already Secure:
1. **Password Hashing**: Using bcrypt with 10 salt rounds
2. **JWT Authentication**: 7-day expiry tokens
3. **Password Comparison**: Secure bcrypt.compare()
4. **Email Normalization**: Converting to lowercase

---

## 🛡️ Recommended Security Enhancements

### 1. **Increase Bcrypt Salt Rounds**
**Current**: 10 rounds
**Recommended**: 12-14 rounds

**Why**: Higher salt rounds = more secure against brute force attacks
- 10 rounds = ~10 hashes/second
- 12 rounds = ~2-3 hashes/second (4x slower to crack)
- 14 rounds = ~0.5 hashes/second (20x slower to crack)

**Implementation**:
```javascript
// In server.js, line 98 and 177
// Change from:
userData.password = await bcrypt.hash(userData.password, 10);

// To:
userData.password = await bcrypt.hash(userData.password, 12);
```

---

### 2. **Add Password Strength Validation**
**Current**: No password strength requirements
**Recommended**: Enforce strong passwords

**Rules**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Implementation**:
```javascript
// Add this function in server.js
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
};

// Use in register endpoint (before line 98):
const passwordCheck = validatePassword(userData.password);
if (!passwordCheck.valid) {
    return res.status(400).json({ error: passwordCheck.message });
}
```

---

### 3. **Secure JWT Secret**
**Current**: Hardcoded fallback secret
**Recommended**: Strong, random secret from environment

**Implementation**:
```javascript
// In .env file:
JWT_SECRET=your_very_long_random_secret_key_here_min_32_chars

// Generate strong secret:
// Run in terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 4. **Add Rate Limiting**
**Purpose**: Prevent brute force attacks on login

**Installation**:
```bash
npm install express-rate-limit
```

**Implementation**:
```javascript
const rateLimit = require('express-rate-limit');

// Add after line 25 in server.js
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply to login route:
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    // ... existing code
});
```

---

### 5. **Add Account Lockout**
**Purpose**: Lock account after multiple failed login attempts

**Implementation**:
```javascript
// Add to User schema:
loginAttempts: { type: Number, default: 0 },
lockUntil: { type: Date },

// In login endpoint (after line 122):
if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({ 
        error: `Account locked. Try again in ${minutesLeft} minutes.` 
    });
}

// After failed password (line 129):
if (!isMatch) {
    user.loginAttempts += 1;
    
    if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        await user.save();
        return res.status(423).json({ 
            error: 'Account locked due to multiple failed attempts. Try again in 30 minutes.' 
        });
    }
    
    await user.save();
    return res.status(401).json({ 
        error: `Invalid credentials. ${5 - user.loginAttempts} attempts remaining.` 
    });
}

// Reset attempts on successful login (after line 132):
user.loginAttempts = 0;
user.lockUntil = undefined;
await user.save();
```

---

### 6. **Secure Session Management**
**Current**: JWT stored in client
**Recommended**: Add token blacklist for logout

**Implementation**:
```javascript
// Create a simple in-memory blacklist (or use Redis for production)
const tokenBlacklist = new Set();

// Logout endpoint:
app.post('/api/auth/logout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        tokenBlacklist.add(token);
    }
    res.json({ message: 'Logged out successfully' });
});

// Middleware to check blacklist:
const checkBlacklist = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && tokenBlacklist.has(token)) {
        return res.status(401).json({ error: 'Token has been revoked' });
    }
    next();
};
```

---

### 7. **Prevent Timing Attacks**
**Current**: Different response times for "user not found" vs "wrong password"
**Recommended**: Constant-time responses

**Implementation**:
```javascript
// In login endpoint, replace lines 120-129 with:
const user = await User.findOne({ email });

// Always hash the password even if user doesn't exist
const passwordToCompare = user ? user.password : await bcrypt.hash('dummy', 12);
const isMatch = await bcrypt.compare(password, passwordToCompare);

if (!user || !isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
}
```

---

### 8. **Add HTTPS Enforcement**
**Purpose**: Encrypt data in transit

**Implementation**:
```javascript
// Add after line 25:
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});
```

---

### 9. **Sanitize User Input**
**Purpose**: Prevent NoSQL injection

**Installation**:
```bash
npm install express-mongo-sanitize
```

**Implementation**:
```javascript
const mongoSanitize = require('express-mongo-sanitize');

// Add after line 25:
app.use(mongoSanitize());
```

---

### 10. **Add Security Headers**
**Purpose**: Protect against common web vulnerabilities

**Installation**:
```bash
npm install helmet
```

**Implementation**:
```javascript
const helmet = require('helmet');

// Add after line 25:
app.use(helmet());
```

---

## 🎯 Priority Implementation Order

### **High Priority** (Implement Now):
1. ✅ Increase bcrypt salt rounds to 12
2. ✅ Add password strength validation
3. ✅ Secure JWT secret in .env
4. ✅ Add rate limiting on login
5. ✅ Add account lockout mechanism

### **Medium Priority** (Implement Soon):
6. Add token blacklist for logout
7. Prevent timing attacks
8. Add input sanitization

### **Low Priority** (Production):
9. HTTPS enforcement
10. Security headers (helmet)

---

## 📋 Quick Implementation Checklist

- [ ] Change bcrypt salt rounds from 10 to 12
- [ ] Add password validation function
- [ ] Update .env with strong JWT_SECRET
- [ ] Install and configure express-rate-limit
- [ ] Add loginAttempts and lockUntil to User schema
- [ ] Implement account lockout logic
- [ ] Install express-mongo-sanitize
- [ ] Install helmet
- [ ] Test all security features

---

## 🔍 Testing Your Security

### Test Password Strength:
```bash
# Should FAIL:
- "password123"
- "Password"
- "12345678"

# Should PASS:
- "MyP@ssw0rd!"
- "Secure#2024"
- "F0rce@App!"
```

### Test Rate Limiting:
```bash
# Try logging in 6 times with wrong password
# 6th attempt should be blocked
```

### Test Account Lockout:
```bash
# Try logging in 5 times with wrong password
# Account should be locked for 30 minutes
```

---

## 🚨 Security Best Practices

1. **Never log passwords** (even in development)
2. **Always use HTTPS** in production
3. **Rotate JWT secrets** periodically
4. **Monitor failed login attempts**
5. **Keep dependencies updated**
6. **Use environment variables** for all secrets
7. **Implement 2FA** for sensitive accounts (future)
8. **Regular security audits**

---

## 📞 Need Help?

If you encounter any issues implementing these security features, let me know which specific enhancement you'd like help with!
