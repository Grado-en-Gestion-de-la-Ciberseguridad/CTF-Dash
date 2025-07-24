# Evidence Log - Digital Forensics

## Case Number: CTF-2024-001
**Investigator:** Cyber Defense Team  
**Date Created:** March 16, 2024  
**Last Updated:** March 20, 2024

---

## Evidence Items

### Item 001 - Suspicious Email
- **Type:** Digital Evidence
- **Source:** Faculty Inbox
- **Date Collected:** March 16, 2024
- **Description:** Phishing email with malicious attachment
- **Hash:** sha256:a1b2c3d4e5f6789...
- **Location:** `/evidence/emails/phishing-001.eml`

### Item 002 - Network Logs
- **Type:** System Logs
- **Source:** Firewall System
- **Date Collected:** March 16, 2024
- **Description:** Unusual outbound connections to suspicious IPs
- **Size:** 2.3 MB
- **Location:** `/evidence/logs/firewall-20240315.log`

### Item 003 - Browser History
- **Type:** Digital Artifact
- **Source:** Compromised Workstation
- **Date Collected:** March 17, 2024
- **Description:** Suspicious website visits before breach
- **Entries:** 47 suspicious entries
- **Location:** `/evidence/browser/history-dump.json`

### Item 004 - USB Device
- **Type:** Physical Evidence
- **Source:** IT Support Desk
- **Date Collected:** March 18, 2024
- **Description:** Unregistered USB found in Computer Lab
- **Serial:** USB-2024-SUS-001
- **Status:** Quarantined for analysis

### Item 005 - Social Media Posts
- **Type:** Open Source Intelligence
- **Source:** Various Platforms
- **Date Collected:** March 19, 2024
- **Description:** Suspicious posts mentioning campus
- **Platforms:** Twitter, Facebook, LinkedIn
- **Location:** `/evidence/osint/social-media-archive/`

---

## Chain of Custody

| Date | Time | Action | Personnel | Signature |
|------|------|--------|-----------|-----------|
| 2024-03-16 | 09:15 | Evidence Collected | J. Smith | JS |
| 2024-03-16 | 09:30 | Hash Verification | M. Johnson | MJ |
| 2024-03-17 | 14:20 | Analysis Started | A. Williams | AW |
| 2024-03-18 | 11:45 | Additional Evidence | K. Brown | KB |

---

## Analysis Notes

**Key Findings:**
1. Attack vector appears to be spear-phishing
2. Multiple systems compromised
3. Data exfiltration confirmed
4. Insider knowledge suspected

**Recommendations:**
- Implement additional email filtering
- Conduct security awareness training
- Review access controls
- Monitor for continued unauthorized access

---

**Classification:** CONFIDENTIAL  
**Distribution:** Authorized Personnel Only
