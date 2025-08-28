#!/usr/bin/env python3
import json

def verify_dictionary(filename):
    """Verify dictionary for duplicates and word lengths."""
    try:
        with open(filename, 'r') as f:
            words = json.load(f)
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    print(f"Total words: {len(words)}")
    
    # Check for duplicates
    seen = set()
    duplicates = []
    for word in words:
        if word in seen:
            duplicates.append(word)
        else:
            seen.add(word)
    
    if duplicates:
        print(f"Found {len(duplicates)} duplicate words:")
        for word in duplicates:
            print(f"  {word}")
    else:
        print("No duplicate words found.")
    
    # Check word lengths
    incorrect_length = []
    for word in words:
        if len(word) != 7:
            incorrect_length.append((word, len(word)))
    
    if incorrect_length:
        print(f"Found {len(incorrect_length)} words with incorrect length:")
        for word, length in incorrect_length:
            print(f"  '{word}' has {length} letters")
    else:
        print("All words are exactly 7 letters long.")
    
    # Show some examples
    print(f"\nFirst 10 words: {words[:10]}")
    print(f"Last 10 words: {words[-10:]}")

if __name__ == "__main__":
    verify_dictionary("lib/data/dictionary7.json")
