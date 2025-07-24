# Password Security Reference

## Common Password Attacks

### Dictionary Attacks
Using common passwords and words from dictionaries to guess passwords.

### Brute Force Attacks
Systematically trying all possible combinations until the correct one is found.

### Rainbow Table Attacks
Using precomputed hash tables to crack password hashes quickly.

## Hash Functions

### MD5
- 128-bit hash function
- Cryptographically broken
- Still used for checksums

### SHA-1
- 160-bit hash function
- Deprecated for cryptographic use
- Being phased out

### SHA-256
- 256-bit hash function
- Currently secure
- Widely used

## Password Cracking Tools

### John the Ripper
Popular password cracking tool with multiple attack modes.

### Hashcat
Advanced password recovery tool supporting many hash types.

### Hydra
Network logon cracker supporting many protocols.

## Best Practices

1. Use long, complex passwords
2. Enable two-factor authentication
3. Use unique passwords for each account
4. Consider using a password manager
5. Regularly update passwords

## Example Hashes

```
MD5: 5d41402abc4b2a76b9719d911017c592 (hello)
SHA-1: aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d (hello)
SHA-256: 2cf24dba4f21d4288077ce78d95c0d7a4be6e7f5e0a8be1a1a3b5e0c0e6f8a7e (hello)
```

Remember: Never use these weak passwords in real systems!
