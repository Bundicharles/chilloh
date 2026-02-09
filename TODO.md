# TODO: Debug STK Push Issues

- [x] Edit api/stk_initiate.js: Add phone number formatting (remove + and ensure 254 prefix), validate amount as integer, change CallBackURL to http://localhost:3000/api/callback
- [x] Edit api/callback.js: Replace fs.appendFileSync with console.log for logging
- [x] Test the changes by running the app locally and checking console logs
