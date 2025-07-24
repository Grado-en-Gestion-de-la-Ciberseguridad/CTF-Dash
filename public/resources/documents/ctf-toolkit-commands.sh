#!/bin/bash

# CTF Toolkit - Quick Reference Commands
# Use these commands to help with your investigation

echo "====================================="
echo "      CTF Investigation Toolkit      "
echo "====================================="
echo ""

# Network Investigation
echo "🌐 NETWORK ANALYSIS:"
echo "  nmap -sn 192.168.1.0/24        # Network discovery"
echo "  nmap -p- target.com             # Full port scan"
echo "  netstat -tulpn                  # Active connections"
echo "  ss -tuln                        # Socket statistics"
echo ""

# Hash Analysis
echo "🔐 HASH CRACKING:"
echo "  echo 'text' | md5sum             # Generate MD5 hash"
echo "  echo 'text' | sha256sum          # Generate SHA256 hash"
echo "  john --format=md5 hashes.txt     # Crack MD5 hashes"
echo "  hashcat -m 0 hash.txt dict.txt   # Hashcat MD5 mode"
echo ""

# File Investigation
echo "📁 FILE ANALYSIS:"
echo "  file suspicious_file             # Identify file type"
echo "  strings binary_file              # Extract readable strings"
echo "  exiftool image.jpg               # Extract metadata"
echo "  binwalk firmware.bin             # Analyze binary files"
echo ""

# Web Investigation
echo "🌍 WEB RECONNAISSANCE:"
echo "  curl -I website.com              # Get HTTP headers"
echo "  wget -r --spider website.com     # Crawl website"
echo "  dig domain.com                   # DNS lookup"
echo "  whois domain.com                 # Domain information"
echo ""

# Encoding/Decoding
echo "🔄 ENCODING TOOLS:"
echo "  echo 'text' | base64             # Base64 encode"
echo "  echo 'dGV4dA==' | base64 -d      # Base64 decode"
echo "  echo 'Hello' | tr 'A-Za-z' 'N-ZA-Mn-za-m'  # ROT13"
echo "  xxd file.bin                     # Hex dump"
echo ""

# Password Analysis
echo "🔑 PASSWORD TOOLS:"
echo "  crunch 8 8 -t @@@@@@@@           # Generate wordlist"
echo "  hydra -l user -P pass.txt ssh://target  # Brute force SSH"
echo "  john --wordlist=dict.txt hashes.txt      # Password cracking"
echo ""

# Log Analysis
echo "📊 LOG INVESTIGATION:"
echo "  grep 'error' /var/log/syslog     # Search for errors"
echo "  tail -f /var/log/access.log      # Monitor live logs"
echo "  awk '{print $1}' access.log | sort | uniq -c  # IP frequency"
echo ""

# Steganography
echo "🖼️  STEGANOGRAPHY:"
echo "  steghide extract -sf image.jpg   # Extract hidden data"
echo "  exiftool -all image.jpg          # Check image metadata"
echo "  binwalk image.png                # Look for embedded files"
echo ""

# Quick CTF Tips
echo "💡 CTF QUICK TIPS:"
echo "  • Always check file headers (magic bytes)"
echo "  • Look for hidden directories (robots.txt, .git/)"
echo "  • Try common passwords: admin, password, 123456"
echo "  • Check for SQL injection: ' OR 1=1 --"
echo "  • Base64 often ends with = or =="
echo "  • Caesar cipher: try shifts 1-25"
echo "  • Look for suspicious network traffic patterns"
echo "  • Social media can contain valuable clues"
echo ""

echo "====================================="
echo "     Good luck with your investigation!"
echo "====================================="

# Common CTF Challenge Ports
echo ""
echo "🔌 COMMON PORTS TO CHECK:"
echo "  21  - FTP     |  80  - HTTP     |  443 - HTTPS"
echo "  22  - SSH     |  23  - Telnet   |  25  - SMTP"
echo "  53  - DNS     |  110 - POP3     |  143 - IMAP"
echo "  3306- MySQL   |  5432- PostgreSQL | 1433 - MSSQL"
echo ""

# Evidence locations to check
echo "🕵️  INVESTIGATION CHECKLIST:"
echo "  □ Check social media accounts"
echo "  □ Analyze network logs"
echo "  □ Review email communications"  
echo "  □ Examine file metadata"
echo "  □ Look for hidden messages"
echo "  □ Cross-reference timestamps"
echo "  □ Verify alibis and access logs"
echo "  □ Check for encryption keys"
echo ""
