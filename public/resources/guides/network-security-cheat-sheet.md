# Network Security Cheat Sheet

## Common Ports and Services

### Well-Known Ports (0-1023)
- **20/21**: FTP (File Transfer Protocol)
- **22**: SSH (Secure Shell)
- **23**: Telnet
- **25**: SMTP (Simple Mail Transfer Protocol)
- **53**: DNS (Domain Name System)
- **80**: HTTP (HyperText Transfer Protocol)
- **110**: POP3 (Post Office Protocol)
- **143**: IMAP (Internet Message Access Protocol)
- **443**: HTTPS (HTTP Secure)
- **993**: IMAPS (IMAP Secure)
- **995**: POP3S (POP3 Secure)

### Registered Ports (1024-49151)
- **1433**: Microsoft SQL Server
- **1521**: Oracle Database
- **3306**: MySQL Database
- **3389**: RDP (Remote Desktop Protocol)
- **5432**: PostgreSQL Database
- **5900**: VNC (Virtual Network Computing)

## Network Scanning Commands

### Nmap (Network Mapper)
```bash
# Basic host discovery
nmap -sn 192.168.1.0/24

# Port scan
nmap -p 80,443,22 target.com

# Service version detection
nmap -sV target.com

# OS detection
nmap -O target.com
```

### Netstat
```bash
# Show all connections
netstat -an

# Show listening ports
netstat -ln

# Show process names
netstat -p
```

## Firewall Basics

### iptables (Linux)
```bash
# List rules
iptables -L

# Allow incoming SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Block specific IP
iptables -A INPUT -s 192.168.1.100 -j DROP
```

### Windows Firewall
```cmd
# Show firewall status
netsh advfirewall show allprofiles

# Allow program through firewall
netsh advfirewall firewall add rule name="MyApp" program="C:\path\to\app.exe" action=allow
```

## Security Tools

### Wireshark
Network protocol analyzer for packet capture and analysis.

### Metasploit
Penetration testing framework for security research.

### Burp Suite
Web application security testing tool.

### John the Ripper
Password cracking tool.

## Common Attack Vectors

### Network Attacks
- **DDoS**: Distributed Denial of Service
- **MITM**: Man-in-the-Middle attacks
- **Port Scanning**: Reconnaissance technique
- **Packet Sniffing**: Intercepting network traffic

### Web Application Attacks
- **SQL Injection**: Database manipulation
- **XSS**: Cross-Site Scripting
- **CSRF**: Cross-Site Request Forgery
- **Directory Traversal**: File system access

## Security Best Practices

1. **Network Segmentation**
   - Separate critical systems
   - Use VLANs and firewalls

2. **Access Control**
   - Principle of least privilege
   - Multi-factor authentication

3. **Monitoring**
   - Network traffic analysis
   - Intrusion detection systems

4. **Regular Updates**
   - Patch management
   - Security updates

5. **Backup and Recovery**
   - Regular backups
   - Disaster recovery plans

## CTF Network Challenges

### Common Techniques
- **Port knocking**: Hidden service sequences
- **Banner grabbing**: Service identification
- **Protocol analysis**: Understanding communications
- **Traffic analysis**: Finding patterns in data

### Tools for CTF
- **nc (netcat)**: Network Swiss Army knife
- **tcpdump**: Command-line packet analyzer
- **dig**: DNS lookup tool
- **curl**: HTTP client

Remember: Always use these tools ethically and only on systems you own or have permission to test!
