// test-sms-webhook.js
import axios from "axios";

// 🔧 CONFIG — EDIT THESE TO MATCH YOUR SETUP
const WEBHOOK_URL = 'http://10.92.53.243:5000/api/sms/webhook/sms'; // 👈 Change to your server URL
const LAST_3_DIGITS = '057'; // 👈 Change to match a real user's phone (e.g., 254712345057 → last3 = 057)
const AMOUNT = 200; // 👈 Must be 200, 1000, or 2000
const TX_ID = Date.now().toString().slice(-11); // Unique TxId
//thx now help me to change the page into kinyarwanda becouse users can be rwanda


// Generate realistic timestamp (now)
const now = new Date();
const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

// 📨 Build realistic MTN MobileMoney SMS text
const smsText = `*161*TxId:${TX_ID}*R*You have received ${AMOUNT} RWF from Test User (*********${LAST_3_DIGITS}) on your mobile money account at ${timestamp}. Your new balance:5000 RWF.Thank you for using MTN MobileMoney.`;

const payload = {
  from: 'm-money', // Matches your SMS Forwarder "Sender" filter
  text: smsText
};

console.log('📤 Sending test SMS to:', WEBHOOK_URL);
console.log('📱 SMS Text:', smsText);
console.log('🔍 Looking for user with phone ending in:', LAST_3_DIGITS);
console.log('💰 Amount:', AMOUNT);

// Send POST request
axios
  .post(WEBHOOK_URL, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('✅ Response:', response.data);
  })
  .catch(error => {
    if (error.response) {
      console.error('❌ Server responded with error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ No response from server — is it running?');
    } else {
      console.error('❌ Request error:', error.message);
    }
  });