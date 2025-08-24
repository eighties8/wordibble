import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { length } = req.query;
  
  if (!length || (length !== '5' && length !== '6')) {
    return res.status(400).json({ error: 'Invalid word length. Must be 5 or 6.' });
  }

  try {
    // Read the dictionary file from lib directory
    const filePath = path.join(process.cwd(), 'lib', `dictionary${length}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const words = JSON.parse(fileContent);
    
    res.status(200).json(words);
  } catch (error) {
    console.error('Error reading dictionary file:', error);
    res.status(500).json({ error: 'Failed to load dictionary' });
  }
}
