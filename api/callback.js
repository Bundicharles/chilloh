import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    console.log('📩 M-Pesa Callback:', JSON.stringify(data, null, 2));

    const callback = data?.Body?.stkCallback;

    if (!callback) {
      return res.status(400).json({ error: 'Invalid callback format' });
    }

    const metadata = callback.CallbackMetadata?.Item || [];

    const getItem = (name) =>
      metadata.find((i) => i.Name === name)?.Value || null;

    const payload = {
      merchant_request_id: callback.MerchantRequestID,
      checkout_request_id: callback.CheckoutRequestID,
      result_code: callback.ResultCode,
      result_desc: callback.ResultDesc,
      amount: getItem('Amount'),
      mpesa_receipt: getItem('MpesaReceiptNumber'),
      phone: getItem('PhoneNumber'),
      transaction_date: getItem('TransactionDate'),
      raw: data
    };

    const { error } = await supabase
      .from('mpesa_callbacks')
      .insert(payload);

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    return res.status(200).json({
      message: 'Callback saved to Supabase',
      success: true
    });

  } catch (err) {
    console.error('❌ Callback handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}