import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join('/tmp', 'mpesa_callback.json');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'No callback data found yet' });
  }

  const data = fs.readFileSync(filePath, 'utf-8');
  return res.status(200).json(JSON.parse(data));
}