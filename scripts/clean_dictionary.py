#!/usr/bin/env python3
import json
import sys

def clean_dictionary(input_filename, output_filename):
    """Clean dictionary by removing duplicates and incorrect word lengths."""
    try:
        with open(input_filename, 'r') as f:
            words = json.load(f)
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    print(f"Original words: {len(words)}")
    
    # Remove duplicates while preserving order
    seen = set()
    cleaned_words = []
    duplicates_removed = 0
    
    for word in words:
        if word not in seen:
            seen.add(word)
            cleaned_words.append(word)
        else:
            duplicates_removed += 1
    
    print(f"Duplicates removed: {duplicates_removed}")
    
    # Remove words that aren't exactly 7 letters
    length_issues_removed = 0
    final_words = []
    
    for word in cleaned_words:
        if len(word) == 7:
            final_words.append(word)
        else:
            length_issues_removed += 1
            print(f"Removed '{word}' (has {len(word)} letters)")
    
    print(f"Length issues removed: {length_issues_removed}")
    print(f"Final words: {len(final_words)}")
    
    # Sort the words alphabetically
    final_words.sort()
    
    # Write cleaned dictionary
    try:
        with open(output_filename, 'w') as f:
            json.dump(final_words, f, indent=2)
        print(f"\nCleaned dictionary saved to: {output_filename}")
    except Exception as e:
        print(f"Error writing file: {e}")
        return
    
    # Verify the cleaned file
    print("\nVerifying cleaned file...")
    try:
        with open(output_filename, 'r') as f:
            verify_words = json.load(f)
        
        # Check for duplicates
        seen = set()
        duplicates = []
        for word in verify_words:
            if word in seen:
                duplicates.append(word)
            else:
                seen.add(word)
        
        # Check word lengths
        incorrect_length = []
        for word in verify_words:
            if len(word) != 7:
                incorrect_length.append((word, len(word)))
        
        if not duplicates and not incorrect_length:
            print("✓ Verification passed: No duplicates or length issues found")
        else:
            print("✗ Verification failed:")
            if duplicates:
                print(f"  Found {len(duplicates)} duplicates")
            if incorrect_length:
                print(f"  Found {len(incorrect_length)} length issues")
                
    except Exception as e:
        print(f"Error verifying file: {e}")

if __name__ == "__main__":
    input_file = "lib/data/dictionary7.json"
    output_file = "lib/data/dictionary7_cleaned.json"
    
    print("Cleaning dictionary7.json...")
    clean_dictionary(input_file, output_file)
    
    print(f"\nTo replace the original file, run:")
    print(f"mv {output_file} {input_file}")
