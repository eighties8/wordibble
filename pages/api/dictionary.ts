import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Dictionary API called:', { method: req.method, query: req.query });
  
  const { length } = req.query;
  
  if (!length || (length !== '5' && length !== '6' && length !== '7')) {
    console.log('Invalid length parameter:', length);
    return res.status(400).json({ error: 'Invalid word length. Must be 5, 6, or 7.' });
  }

  try {
    // Read the dictionary file from lib/data directory
    const filePath = path.join(process.cwd(), 'lib', 'data', `dictionary${length}.json`);
    console.log('Attempting to read file:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return res.status(404).json({ error: 'Dictionary file not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const words = JSON.parse(fileContent);
    
    console.log(`Dictionary loaded successfully: ${words.length} words for length ${length}`);
    res.status(200).json(words);
  } catch (error) {
    console.error('Error reading dictionary file:', error);
    res.status(500).json({ error: 'Failed to load dictionary' });
  }
}
