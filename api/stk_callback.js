const items = callback.CallbackMetadata?.Item || [];

const getValue = (name) =>
  items.find(i => i.Name === name)?.Value ?? null;

const record = {
  merchant_request_id: callback.MerchantRequestID,
  checkout_request_id: callback.CheckoutRequestID,
  result_code: callback.ResultCode,
  result_desc: callback.ResultDesc,

  amount: getValue("Amount"),
  receipt_number: getValue("MpesaReceiptNumber"),
  phone_number: getValue("PhoneNumber"),
  transaction_date: getValue("TransactionDate"),

  raw_metadata: callback.CallbackMetadata
};