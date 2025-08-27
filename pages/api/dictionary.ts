import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {

  
  const { length } = req.query;
  
  if (!length || (length !== '5' && length !== '6' && length !== '7')) {

    return res.status(400).json({ error: 'Invalid word length. Must be 5, 6, or 7.' });
  }

  try {
    // Read the dictionary file from lib/data directory
    const filePath = path.join(process.cwd(), 'lib', 'data', `dictionary${length}.json`);

    
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return res.status(404).json({ error: 'Dictionary file not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const words = JSON.parse(fileContent);
    

    res.status(200).json(words);
  } catch (error) {
    console.error('Error reading dictionary file:', error);
    res.status(500).json({ error: 'Failed to load dictionary' });
  }
}
