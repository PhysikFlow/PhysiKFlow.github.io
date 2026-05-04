# PhysiKCam Setup Guide

This guide explains how to configure the complete PhysiKCam integration with Firebase and local server.

## 🚀 Quick Start

### 1. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name your project (e.g., "physikcam")

2. **Enable Realtime Database**
   - In Firebase Console, go to "Realtime Database"
   - Click "Create Database"
   - Choose "Start in test mode" (for development)
   - Select a location near you

3. **Get Firebase Config**
   - Go to Project Settings → General → Your apps
   - Click "Web app" to get configuration
   - Copy the config object

4. **Update PWA Configuration**
   Open `script.js` and replace the Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### 2. Local Server Setup

1. **Install Python** (if not installed)
   - Download from [python.org](https://python.org)
   - Version 3.7 or higher

2. **Start the Server**
   ```bash
   cd PhysikCam
   python server.py
   ```
   Or with custom port:
   ```bash
   python server.py 8080
   ```

3. **Update PWA Server URL**
   Open `script.js` and update `UPLOAD_CONFIG`:
   ```javascript
   const UPLOAD_CONFIG = {
     localUrl: 'http://YOUR_PC_IP:3000',  // Update YOUR_PC_IP
     tunnelUrl: 'https://your-tunnel.cloudflare.com',  // Configure later
     authToken: 'SECRET_TOKEN_123',  // Change to secure token
     timeout: 3000
   };
   ```

### 3. Network Configuration

#### Find Your PC IP Address
```bash
# Windows
ipconfig
# Look for "IPv4 Address" under your active network

# Mac/Linux
ifconfig | grep "inet "
```

#### Test Local Connection
1. Start the Python server
2. On your phone, open browser and go to:
   `http://YOUR_PC_IP:3000/health`
3. Should see: `{"status": "ok", ...}`

## 🔐 Security Configuration

### 1. Change Authentication Token
In both `server.py` and `script.js`, update:
```python
AUTH_TOKEN = "your_secure_token_here"
```
```javascript
authToken: "your_secure_token_here"
```

### 2. Firewall Settings
Make sure port 3000 (or your chosen port) is open for local network access.

## 🌐 Cloudflare Tunnel Setup (Optional)

For when mobile and PC are on different networks:

1. **Install Cloudflared**
   ```bash
   # Windows
   winget install --id Cloudflare.cloudflared
   
   # Mac
   brew install cloudflared
   ```

2. **Create Tunnel**
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create physikcam
   cloudflared tunnel route dns physikcam your-domain.com
   ```

3. **Configure Tunnel**
   Create `config.yml`:
   ```yaml
   tunnel: physikcam
   credentials-file: ~/.cloudflared/physikcam.json
   
   ingress:
     - hostname: your-domain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

4. **Run Tunnel**
   ```bash
   cloudflared tunnel run physikcam
   ```

5. **Update PWA**
   ```javascript
   tunnelUrl: 'https://your-domain.com'
   ```

## 📱 Testing the Complete Flow

### 1. Add Test Payment to Firebase
```javascript
// In Firebase Console → Realtime Database → Data
{
  "payments": {
    "test123": {
      "personName": "João Silva",
      "plan": "Plano Mensal",
      "paymentMethod": "PIX",
      "amount": 120,
      "status": "pending_proof",
      "createdAt": 1698765432100
    }
  }
}
```

### 2. Test PWA
1. Open `http://localhost:8000` on your phone
2. Should see "João Silva" in the wheel selector
3. Select the name
4. Take a photo or select from gallery
5. Confirm the details
6. Image should upload to PC server

### 3. Verify Results
- Check server console for upload logs
- Check `receipts/` folder for saved images
- Check Firebase for status update to "proof_received"

## 🔧 Troubleshooting

### Common Issues

**"Firebase connection error"**
- Check Firebase config in script.js
- Verify Realtime Database rules allow access

**"Upload failed"**
- Check server is running
- Verify IP address in UPLOAD_CONFIG
- Check authentication token matches

**"Can't find local server"**
- Verify devices are on same network
- Check firewall settings
- Test with browser health check

**"Network switching problems"**
- Configure Cloudflare Tunnel
- Update tunnelUrl in UPLOAD_CONFIG

### Debug Mode

Add console logging to see what's happening:
```javascript
// In script.js, add to uploadImageToServer
console.log('Upload URL:', uploadUrl);
console.log('Is local server available:', isLocal);
```

## 📁 File Structure

```
PhysikCam/
├── index.html          # PWA main page
├── script.js           # PWA logic with Firebase integration
├── style.css           # PWA styling
├── server.py           # Local image upload server
├── receipts/           # Uploaded images (created automatically)
├── manifest.webmanifest # PWA manifest
├── sw.js              # Service worker
└── README-SETUP.md    # This guide
```

## 🎯 Production Checklist

- [ ] Update Firebase config with real project details
- [ ] Change default authentication tokens
- [ ] Configure Cloudflare Tunnel for cross-network support
- [ ] Set up proper Firebase security rules
- [ ] Test on actual mobile devices
- [ ] Verify image quality and file sizes
- [ ] Set up monitoring for server uptime
- [ ] Configure backup for receipt images

## 📞 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check server console for upload logs
3. Verify network connectivity
4. Test with simple files first

The system is designed to be robust with automatic fallback between local and tunnel connections.
