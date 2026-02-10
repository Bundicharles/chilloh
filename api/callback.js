import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🔥 MPESA CALLBACK HIT");
  console.log(JSON.stringify(req.body, null, 2));

  const callback =
    req.body?.Body?.stkCallback;

  if (!callback) {
    return res.status(400).json({ error: "Invalid callback structure" });
  }

  const record = {
    merchant_request_id: callback.MerchantRequestID,
    checkout_request_id: callback.CheckoutRequestID,
    result_code: callback.ResultCode,
    result_desc: callback.ResultDesc,
    metadata: callback.CallbackMetadata || null
  };

  const { error } = await supabase
    .from('mpesa_callbacks')
    .insert([record]);

  if (error) {
    console.error("DB INSERT ERROR:", error);
  }

  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Callback received successfully"
  });
}