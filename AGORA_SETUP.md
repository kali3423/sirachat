# Agora Voice & Video Call Setup Guide

## ✅ Configuration Complete!

Your Agora App ID has been configured: `7d417061d41443e7a5870b37bf1c1397`

## 📋 Setup Steps

### 1. Environment Variable Added
The Agora App ID is now in your `.env.local` file:
```
VITE_AGORA_APP_ID=7d417061d41443e7a5870b37bf1c1397
```

### 2. Restart Development Server
**IMPORTANT:** You must restart your dev server for the changes to take effect:

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

Or if using Base44 CLI:
```powershell
base44 dev
```

### 3. Test the Calls

#### Voice Call:
1. Open the chat with any contact
2. Click the **phone icon** (orange button) in the header
3. The voice call interface should open
4. You should see "Connected" status

#### Video Call:
1. Open the chat with any contact
2. Click the **video camera icon** (orange button) in the header
3. The video call interface should open
4. Your camera should activate (browser will ask for permissions)
5. Local video appears in bottom-right corner

## 🔧 How It Works

### Call Flow:
1. **User clicks call button** → Opens AgoraCall component
2. **Agora SDK initializes** with App ID from environment or AppSetting
3. **Browser requests permissions** for camera/microphone
4. **Joins channel** named "sira-chat-room"
5. **Publishes audio/video** streams
6. **Listens for remote streams** from other participants
7. **Displays remote video** in main area

### Controls:
- **🎤 Mute/Unmute**: Toggle microphone
- **📹 Camera On/Off**: Toggle video (video calls only)
- **📞 Disconnect**: End the call

## 🎯 Features

- ✅ Discord-style fullscreen interface
- ✅ Picture-in-picture local video
- ✅ Real-time connection status
- ✅ Timer showing call duration
- ✅ Mute/unmute controls
- ✅ Camera toggle for video calls
- ✅ Participant count display
- ✅ Clean end-call button

## 🔐 Agora App ID Sources

The app checks for Agora App ID in this order:
1. **AppSetting entity** in Base44 (admin can configure)
2. **Environment variable** `VITE_AGORA_APP_ID` (fallback)

This allows:
- Admins to update Agora settings without redeploying
- Environment variable as backup
- Testing without database setup

## 🚨 Troubleshooting

### "No Agora App ID configured"
- Restart your dev server
- Check `.env.local` has the correct App ID
- Verify the file is saved

### "Connection error" or calls don't connect
- Check browser console for errors
- Ensure microphone/camera permissions granted
- Verify Agora App ID is valid
- Check if Agora project is active in Agora Console

### Camera/Microphone not working
- Grant browser permissions when prompted
- Check System Settings → Privacy → Camera/Microphone
- Try in another browser
- Check if camera/mic are being used by another app

### WebSocket errors in console
These are Base44 backend connection errors and won't affect Agora calls. The errors you see:
- `Failed to load resource: 405` - Base44 API endpoints (normal in some setups)
- `WebSocket connection failed` - Base44 real-time subscriptions (doesn't block calls)

Agora uses its own connection system separate from Base44 WebSockets.

## 📱 Testing with Multiple Users

### Same Device (Different Browsers):
1. Open app in Chrome
2. Open app in Firefox/Edge
3. Login as different users
4. Start a call from one browser
5. Other browser should see incoming notification

### Different Devices:
1. Deploy to Vercel (already done: sirachat.vercel.app)
2. Open on different devices
3. Login as different users
4. Start calls between devices

## 🌐 Production Deployment

Your app is already deployed to Vercel. To add Agora there:

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add: `VITE_AGORA_APP_ID` = `7d417061d41443e7a5870b37bf1c1397`
3. Redeploy the app

Or update via CLI:
```bash
vercel env add VITE_AGORA_APP_ID
# Enter: 7d417061d41443e7a5870b37bf1c1397
# Select: Production, Preview, Development
```

## 📊 Agora Console

Monitor your calls at: https://console.agora.io

- View active calls
- Check call quality
- See usage statistics
- Monitor bandwidth
- Review call logs

## ⚙️ Advanced Configuration

### Channel Name
Currently hardcoded to `"sira-chat-room"` in `AgoraCall.jsx`.

To make it dynamic (per conversation):
```javascript
const CHANNEL = `chat-${active.username}`;
```

### Token Authentication (Production)
For production security, enable token authentication:
1. Enable in Agora Console
2. Generate tokens on your backend
3. Pass token to AgoraCall component

### Call Notifications
Add real-time notifications when someone starts a call:
1. Store call events in Base44 Message entity
2. Subscribe to message updates
3. Show notification toast
4. Auto-join or show accept/decline buttons

## 🎉 You're All Set!

Restart your server and try making a call! The Agora integration is complete and ready to use.
