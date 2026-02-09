export default async function handler(req, res) {
  if (req.method === "POST") {
    const mpesaResponse = req.body;

    // Log the response to console
    console.log("M-Pesa Callback Response:", JSON.stringify(mpesaResponse, null, 2));

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Confirmation Received Successfully",
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
