'use client'

import { useState, useEffect } from 'react';
import { Users, Phone, Mail, MapPin, Coffee, Camera, Lock, Unlock, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function SocialEngineeringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [discoveredSecret, setDiscoveredSecret] = useState(false);
  const [points, setPoints] = useState(0);
  const [accessLevel, setAccessLevel] = useState('Guest');
  const [claimStatus, setClaimStatus] = useState<'idle' | 'pending' | 'claimed' | 'duplicate' | 'error'>('idle');
  const { user, isTeam } = useAuth();

  const employees = [
    {
      id: 'emp001',
      name: 'Dr. Sarah Morgan',
      title: 'Head of Cybersecurity',
      department: 'IT Security',
      email: 's.morgan@university.edu',
      phone: '+1 (555) 123-4567',
      office: 'Building A, Room 204',
      bio: 'Coffee enthusiast ☕ | Cat lover 🐱 | Password123! is NOT secure!',
      interests: ['Penetration Testing', 'Coffee Roasting', 'Photography'],
      socialMedia: '@dr_sarah_sec',
      weaknesses: 'Always uses pet names in passwords',
      secretInfo: 'Her cat is named "Whiskers2019" - probably her password pattern!'
    },
    {
      id: 'emp002',
      name: 'Mike Thompson',
      title: 'Network Administrator',
      department: 'IT Operations',
      email: 'm.thompson@university.edu',
      phone: '+1 (555) 234-5678',
      office: 'Server Room B12',
      bio: 'Tech geek | Star Wars fan | "May the Force be with your firewall"',
      interests: ['Gaming', 'Sci-Fi Movies', 'Hardware Modding'],
      socialMedia: '@mike_starwars',
      weaknesses: 'Uses Star Wars references everywhere',
      secretInfo: 'Birthday: May 4th (Star Wars Day) - definitely uses "MayTheFourth2024"'
    },
    {
      id: 'emp003',
      name: 'Jessica Chen',
      title: 'Database Administrator',
      department: 'Data Management',
      email: 'j.chen@university.edu',
      phone: '+1 (555) 345-6789',
      office: 'Building C, Room 301',
      bio: 'Data wizard 🧙‍♀️ | Marathon runner 🏃‍♀️ | Pizza = Life 🍕',
      interests: ['Running', 'Data Analytics', 'Italian Cuisine'],
      socialMedia: '@jess_runs_data',
      weaknesses: 'Posts about her runs with GPS data',
      secretInfo: 'Just posted about her 26.2 mile run - probably "Marathon26.2" as password'
    },
    {
      id: 'emp004',
      name: 'Robert Davis',
      title: 'Security Guard',
      department: 'Physical Security',
      email: 'r.davis@university.edu',
      phone: '+1 (555) 456-7890',
      office: 'Main Security Desk',
      bio: 'Keeping campus safe since 1995 🛡️ | Proud grandpa of 3',
      interests: ['Fishing', 'Classic Cars', 'Family Time'],
      socialMedia: '@grandpa_bob_sec',
      weaknesses: 'Overshares about grandchildren',
      secretInfo: 'Has 3 grandkids: Emma, Jake, and Lily. Probably "EmmaJakeLily" password!'
    },
    {
      id: 'emp005',
      name: 'Lisa Park',
      title: 'HR Manager',
      department: 'Human Resources',
      email: 'l.park@university.edu',
      phone: '+1 (555) 567-8901',
      office: 'HR Building, Room 105',
      bio: 'People person 😊 | Yoga instructor | Green tea addict 🍵',
      interests: ['Yoga', 'Meditation', 'Sustainable Living'],
      socialMedia: '@lisa_zen_hr',
      weaknesses: 'Very trusting, helps everyone',
      secretInfo: 'Posts yoga class schedules - probably uses "Namaste2024" or similar'
    },
    {
      id: 'emp006',
      name: 'Alex Rodriguez',
      title: 'Junior Developer',
      department: 'Software Development',
      email: 'a.rodriguez@university.edu',
      phone: '+1 (555) 678-9012',
      office: 'Dev Lab, Room 220',
      bio: 'Code ninja 🥷 | Gaming enthusiast | Coffee-powered debugging',
      interests: ['Video Games', 'Anime', 'Esports'],
      socialMedia: '@alex_codes_games',
      weaknesses: 'Uses gaming references in everything',
      secretInfo: 'Favorite game is "Cyberpunk2077" - probably his password too!'
    }
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeClick = (empId: string) => {
    setSelectedEmployee(empId);
    if (empId === 'emp001' && !discoveredSecret) {
      setDiscoveredSecret(true);
      setPoints(150);
      setAccessLevel('Social Engineer');
      // Attempt to persist for team users
      const challengeId = 'egg/social/HUMAN_IS_THE_WEAKNESS';
      if (isTeam && user?.teamId) {
        setClaimStatus('pending');
        fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: user.teamId,
            challengeId,
            answer: 'HUMAN_IS_THE_WEAKNESS',
            status: 'correct',
            points: 150,
            penalty: 0,
          }),
        }).then(async (res) => {
          if (res.status === 409) setClaimStatus('duplicate');
          else if (res.ok) setClaimStatus('claimed');
          else setClaimStatus('error');
        }).catch(() => setClaimStatus('error'));
      }
    }
  };

  const getSecretPhrase = () => {
    if (discoveredSecret) {
      return "HUMAN_IS_THE_WEAKNESS";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-12 h-12 text-blue-400 mr-4" />
            <h1 className="text-4xl font-bold">🕵️ EMPLOYEE DIRECTORY</h1>
            <AlertTriangle className="w-12 h-12 text-yellow-500 ml-4 animate-pulse" />
          </div>
          <p className="text-blue-300 text-lg">CONFIDENTIAL - INTERNAL USE ONLY</p>
          <p className="text-gray-300">Social Engineering Training Module</p>
          <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-red-300 text-sm">
              ⚠️ <strong>WARNING:</strong> This directory appears to have been compromised. 
              Employee personal information may be exposed!
            </p>
          </div>
        </div>

        {/* Access Level & Points */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-gray-800/50 rounded-lg px-4 py-2">
            <span className="text-gray-400">Access Level: </span>
            <span className={`font-bold ${accessLevel === 'Guest' ? 'text-yellow-400' : 'text-red-400'}`}>
              {accessLevel}
            </span>
          </div>
          {points > 0 && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg px-4 py-2">
              <span className="text-green-400 font-bold">+{points} Points Earned!</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => handleEmployeeClick(employee.id)}
              className={`bg-gray-800/80 border border-gray-600 rounded-lg p-6 cursor-pointer transition-all hover:border-blue-500 hover:bg-gray-700/80 ${
                selectedEmployee === employee.id ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{employee.name}</h3>
                  <p className="text-blue-300 text-sm">{employee.title}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-2" />
                  {employee.email}
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-2" />
                  {employee.phone}
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  {employee.office}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-gray-400 text-sm">{employee.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Employee Details */}
        {selectedEmployee && (
          <div className="bg-gray-800/90 border border-gray-600 rounded-lg p-6 mb-8">
            {(() => {
              const employee = employees.find(emp => emp.id === selectedEmployee);
              if (!employee) return null;
              
              return (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Camera className="w-6 h-6 mr-2 text-blue-400" />
                    Detailed Profile: {employee.name}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">Professional Info</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Department:</strong> {employee.department}</p>
                        <p><strong>Social Media:</strong> {employee.socialMedia}</p>
                        <p><strong>Interests:</strong> {employee.interests.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-4">
                        <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Security Vulnerability
                        </h4>
                        <p className="text-yellow-300 text-sm">{employee.weaknesses}</p>
                      </div>
                      
                      <div className="bg-red-900/30 border border-red-500/50 rounded p-4">
                        <h4 className="text-red-400 font-semibold mb-2 flex items-center">
                          <Unlock className="w-4 h-4 mr-2" />
                          Leaked Intelligence
                        </h4>
                        <p className="text-red-300 text-sm">{employee.secretInfo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Secret Phrase Display */}
        {discoveredSecret && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 text-center mb-8">
            <Lock className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-400 mb-2">Social Engineering Complete!</h3>
            <p className="text-white text-lg mb-4">
              You&apos;ve successfully gathered intelligence on Dr. Morgan.
            </p>
            <div className="bg-black/50 rounded p-4 mb-4">
              <p className="text-green-300 font-mono text-lg">
                Secret Phrase: &quot;{getSecretPhrase()}&quot;
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Tell this to staff for +150 bonus points!
                {isTeam ? (
                  <span className="ml-2 text-xs">
                    {claimStatus === 'pending' && '… crediting'}
                    {claimStatus === 'claimed' && '✔ credited'}
                    {claimStatus === 'duplicate' && '✔ already credited'}
                    {claimStatus === 'error' && ' error'}
                  </span>
                ) : (
                  <span className="ml-2 text-xs"> login as team to claim</span>
                )}
              </p>
            </div>
            <p className="text-gray-300 text-sm">
              🎯 You discovered how personal information can be used against targets!
            </p>
          </div>
        )}

        {/* Educational Footer */}
        <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-purple-400 mb-4">🛡️ Social Engineering Defense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">What You Learned:</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Personal info can reveal password patterns</li>
                <li>• Social media posts expose vulnerabilities</li>
                <li>• Oversharing creates security risks</li>
                <li>• Human psychology is often the weakest link</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Defense Strategies:</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Limit personal information sharing</li>
                <li>• Use complex, unrelated passwords</li>
                <li>• Be suspicious of unusual requests</li>
                <li>• Verify identity before sharing data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Game Warning */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🎮 This is a cybersecurity training simulation.</p>
          <p>All employee data is fictional. Please respect real privacy!</p>
        </div>
      </div>
    </div>
  );
}
