// api/stk_initiate.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone and amount are required' });
  }

  // Validate and format phone number
  let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('254')) {
    // Already correct
  } else {
    return res.status(400).json({ error: 'Invalid phone number format. Use 254XXXXXXXXX or +254XXXXXXXXX' });
  }
  if (formattedPhone.length !== 12) {
    return res.status(400).json({ error: 'Phone number must be 12 digits starting with 254' });
  }

  // Validate amount
  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive integer' });
  }

  // Sandbox credentials
  const consumerKey = "Eh64RXurzaOaQwhGwmUtctIZAE4sCbhXlZtPaXC8sdAC1LDH";
  const consumerSecret = "Gt1dK1Q0TwoieFdmIgmoJG11saYpyqTOOyPqsHJWnH80v2E2A9u4DKg0HQu73uIn";
  const BusinessShortCode = "174379";
  const Passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const Timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const Password = Buffer.from(BusinessShortCode + Passkey + Timestamp).toString("base64");
  const CallBackURL = "https://chilloh-w8ve.vercel.app/donate.html/api/callback"; // Local callback for testing

  try {
    // Get access token
    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(consumerKey + ":" + consumerSecret).toString("base64"),
        },
      }
    );

    const tokenText = await tokenRes.text(); // Get raw response first
    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (err) {
      console.error('Access token response is not valid JSON:', tokenText);
      return res.status(500).json({ error: 'Failed to parse access token', raw: tokenText });
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return res.status(500).json({ error: 'Access token missing', raw: tokenText });
    }

    // Initiate STK Push
    const stkPayload = {
      BusinessShortCode,
      Password,
      Timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: parsedAmount,
      PartyA: formattedPhone,
      PartyB: BusinessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL,
      AccountReference: "2255",
      TransactionDesc: "Test Payment",
    };

    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const rawResponse = await stkRes.text();
    let stkData;
    try {
      stkData = JSON.parse(rawResponse);
    } catch (err) {
      console.error('STK push response is not valid JSON:', rawResponse);
      return res.status(500).json({ error: 'Invalid response from M-Pesa', raw: rawResponse });
    }

    return res.status(200).json(stkData);

  } catch (error) {
    console.error('STK initiation error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}