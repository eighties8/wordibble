import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { length } = req.query;
  
  if (!length || (length !== '5' && length !== '6' && length !== '7')) {
    return res.status(400).json({ error: 'Invalid word length. Must be 5, 6, or 7.' });
  }

  try {
    // Read the clues file from lib/data directory
    const filePath = path.join(process.cwd(), 'lib', 'data', `clues${length}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const clues = JSON.parse(fileContent);
    
    res.status(200).json(clues);
  } catch (error) {
    console.error('Error reading clues file:', error);
    res.status(500).json({ error: 'Failed to load clues' });
  }
}
