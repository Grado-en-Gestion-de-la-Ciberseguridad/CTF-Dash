# CTF Dashboard

A cybersecurity Capture the Flag (CTF) event dashboard built with Next.js and TypeScript.

## 🎯 Event Theme

**Campus Security Breach CTF** - A hacker has infiltrated campus security systems and stolen sensitive documents. Teams must work through various security challenges to recover the stolen data and secure the systems.

## � Challenge Categories

- **Security Awareness** - Social engineering and security best practices
- **Password Security** - Credential attacks and defense mechanisms  
- **OSINT Investigation** - Open source intelligence gathering
- **Cryptography Lab** - Encryption, decryption, and cryptanalysis

## ⚡ Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd CTF_Dash

# Install dependencies
npm install

# Initialize database and create default users
npm run db:init

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

## 🔐 Default Login Credentials

### Administrator Access

- **Username:** `ctf_admin`
- **Password:** `SecureAdmin2025!`
- **Role:** Full administrative access

### Staff Access  

- **Username:** `staff1`
- **Password:** `StaffPass123!`
- **Role:** Team management and challenge oversight

### Team Registration

Teams can register themselves at `/teams` with:

- Unique team name
- Secure password
- Team member names

> ⚠️ **Security Note:** Change default passwords immediately after deployment!

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, SQLite Database
- **Authentication:** bcrypt password hashing, JWT sessions
- **Real-time:** WebSocket connections for live updates
- **Mobile:** Fully responsive design for all devices

## 📱 Features

- **Team Management** - Registration, authentication, member tracking
- **Challenge System** - Multi-category challenges with flag submission
- **Real-time Leaderboard** - Live scoring and team rankings  
- **Submission Tracking** - Detailed logs of all attempts
- **Penalty System** - Wrong answer penalties with score deduction
- **Admin Panel** - Team oversight and challenge management
- **Public Stats** - Real-time dashboard for event monitoring
- **Mobile Responsive** - Optimized for phones and tablets

## 🚀 Deployment

For detailed deployment instructions including production setup, Docker configuration, and security considerations, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Production Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
CTF_Dash/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── challenges/        # Challenge pages
│   ├── components/        # Reusable components
│   ├── teams/            # Team management
│   ├── stats/            # Public statistics
│   └── login/            # Authentication
├── data/                  # SQLite database
├── public/               # Static assets
├── scripts/              # Database scripts
└── docs/                 # Documentation
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production  
npm run build

# Run production build
npm start

# Initialize/reset database
npm run db:init

# Run tests
npm test
```

## 🎮 How to Play

1. **Team Registration:** Register your team at `/teams`
2. **Login:** Use your team credentials to access challenges
3. **Solve Challenges:** Navigate through different security categories
4. **Submit Flags:** Enter discovered flags in the correct format
5. **Track Progress:** Monitor your score on the leaderboard
6. **Win Points:** Correct submissions earn points, wrong answers incur penalties

## 🏅 Scoring System

- **Correct Flag:** +100 points (base score varies by challenge)
- **Wrong Answer:** -10 points penalty
- **Multiple Wrong Answers:** Increasing penalties (-15, -20 points)
- **Bonus Points:** Available for first solves and speed bonuses
- **Final Score:** Total points minus all penalties

## 🔍 Challenge Format

Flags follow the format: `CTF{flag_content_here}`

Example: `CTF{w3lc0m3_t0_cyb3r_s3cur1ty}`

## 🛡️ Security Features

- **Password Hashing:** bcrypt with salt rounds
- **Duplicate Prevention:** Database constraints prevent multiple correct submissions
- **Input Validation:** Server-side validation of all submissions
- **Rate Limiting:** Protection against brute force attempts
- **Secure Sessions:** JWT-based authentication
- **SQL Injection Protection:** Parameterized queries throughout

## 📊 Monitoring

- **Real-time Stats:** Live submission tracking and team progress
- **Admin Dashboard:** Team management and challenge oversight
- **Public Leaderboard:** Transparent scoring for all participants
- **Submission Logs:** Detailed audit trail of all attempts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:

1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
2. Review application logs for error details
3. Verify database connectivity and permissions
4. Ensure all environment variables are configured

---

**Built with ❤️ for cybersecurity education and competitive learning**
