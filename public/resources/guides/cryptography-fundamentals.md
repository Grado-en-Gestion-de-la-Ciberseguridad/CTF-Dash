# Cryptography Fundamentals

## Basic Encryption Types

### Symmetric Encryption
Uses the same key for encryption and decryption.

**Examples:**
- AES (Advanced Encryption Standard)
- DES (Data Encryption Standard)
- 3DES (Triple DES)

### Asymmetric Encryption
Uses a pair of keys: public and private.

**Examples:**
- RSA
- ECC (Elliptic Curve Cryptography)
- Diffie-Hellman

## Classical Ciphers

### Caesar Cipher
Shifts letters by a fixed number.
- Key: Shift value (0-25)
- Example: A → D (shift of 3)

### Substitution Cipher
Replaces each letter with another letter.
- Monoalphabetic: One-to-one mapping
- Polyalphabetic: Multiple mappings

### Vigenère Cipher
Uses a keyword to shift letters variably.
- Keyword repeats throughout the text
- More secure than Caesar cipher

### Rail Fence Cipher
Writes text in a zigzag pattern across multiple rails.

## Modern Cryptography Concepts

### Hashing
One-way function that produces a fixed-size output.
- **MD5**: 128 bits (deprecated)
- **SHA-1**: 160 bits (deprecated)
- **SHA-256**: 256 bits (current standard)

### Digital Signatures
Proves authenticity and integrity of messages.

### Key Exchange
Secure method to share encryption keys.

## Common CTF Cipher Types

### Base64 Encoding
Not encryption, but encoding for data transmission.
```
Hello → SGVsbG8=
```

### ROT13
Special case of Caesar cipher with shift of 13.
```
Hello → Uryyb
```

### Morse Code
Uses dots and dashes to represent letters.
```
HELLO → .... . .-.. .-.. ---
```

### Binary/ASCII
Text represented as binary numbers.
```
A → 01000001 (65 in decimal)
```

## Cryptanalysis Techniques

### Frequency Analysis
Analyzing letter frequency to break substitution ciphers.

### Known Plaintext Attack
Using known parts of the plaintext to find the key.

### Brute Force Attack
Trying all possible keys systematically.

### Dictionary Attack
Using common words or phrases as keys.

## Tools for CTF Cryptography

### Online Tools
- CyberChef: Swiss army knife for encoding/decoding
- dCode: Cipher identifier and solver
- Cryptii: Modern crypto tool

### Command Line Tools
- OpenSSL: Cryptographic library
- hashcat: Hash cracking
- John the Ripper: Password cracking

### Programming Libraries
- Python: `cryptography`, `pycrypto`
- JavaScript: `crypto-js`
- Java: `javax.crypto`

## CTF Tips

1. **Identify the cipher type first**
   - Look for patterns in the ciphertext
   - Check for common encodings (Base64, Hex)

2. **Try simple ciphers first**
   - Caesar, ROT13, Atbash
   - Base64, Hex, Binary

3. **Analyze the context**
   - Challenge description often gives hints
   - File names and formats matter

4. **Use frequency analysis**
   - For longer texts with substitution ciphers
   - Most common letters in English: E, T, A, O, I, N

5. **Look for key indicators**
   - Repeated patterns
   - String lengths
   - Character sets used

Remember: Modern cryptography is mathematically complex, but CTF challenges often use classical or weakened versions for educational purposes!
