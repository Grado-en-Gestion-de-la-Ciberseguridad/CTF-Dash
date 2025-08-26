'use client'

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Star, Gift, Trophy, Skull, Heart } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function SecretAgentPage() {
  const [agentCode, setAgentCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discoveredMissions, setDiscoveredMissions] = useState<string[]>([]);
  const [currentMission, setCurrentMission] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [claimStatus, setClaimStatus] = useState<Record<string, 'pending' | 'claimed' | 'duplicate' | 'error'>>({});
  const { user, isTeam } = useAuth();

  const agentMissions = {
    'AGENT_007': {
      title: 'Operation Double Agent',
      description: 'You\'ve been recruited as a double agent. Your mission: gather intelligence on Dr. Morgan.',
      reward: 'Secret phrase: "LICENSED_TO_HACK" (+125 points)',
      secretPhrase: 'LICENSED_TO_HACK',
      points: 125,
      clue: 'Check the faculty lounge at midnight. Password is hidden in the coffee machine manual.'
    },
    'GHOST_PROTOCOL': {
      title: 'Mission Impossible',
      description: 'This message will self-destruct in 30 seconds. Find the USB device hidden in the library.',
      reward: 'Secret phrase: "IMPOSSIBLE_IS_NOTHING" (+175 points)',
      secretPhrase: 'IMPOSSIBLE_IS_NOTHING', 
      points: 175,
      clue: 'The USB is taped under table 42 in the reference section. Contains encrypted coordinates.'
    },
    'MATRIX_RELOADED': {
      title: 'Red Pill or Blue Pill?',
      description: 'Neo, you\'ve been living in a simulation. Time to wake up and see the real campus network.',
      reward: 'Secret phrase: "THERE_IS_NO_SPOON" (+200 points)',
      secretPhrase: 'THERE_IS_NO_SPOON',
      points: 200,
      clue: 'Follow the white rabbit. The truth is hidden in subnet 192.168.42.0/24'
    }
  };

  const handleCodeSubmit = () => {
    const mission = agentMissions[agentCode.toUpperCase() as keyof typeof agentMissions];
    if (mission) {
      setCurrentMission(agentCode.toUpperCase());
      setIsAuthenticated(true);
      if (!discoveredMissions.includes(agentCode.toUpperCase())) {
        setDiscoveredMissions(prev => [...prev, agentCode.toUpperCase()]);
        setPoints(prev => prev + mission.points);
        // Attempt to persist submission for team users
        const challengeId = `egg/agent/${mission.secretPhrase}`;
        if (isTeam && user?.teamId) {
          setClaimStatus((prev) => ({ ...prev, [challengeId]: 'pending' }));
          fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId: user.teamId,
              challengeId,
              answer: mission.secretPhrase,
              status: 'correct',
              points: mission.points,
              penalty: 0,
            }),
          }).then(async (res) => {
            if (res.status === 409) {
              setClaimStatus((prev) => ({ ...prev, [challengeId]: 'duplicate' }));
            } else if (res.ok) {
              setClaimStatus((prev) => ({ ...prev, [challengeId]: 'claimed' }));
            } else {
              setClaimStatus((prev) => ({ ...prev, [challengeId]: 'error' }));
            }
          }).catch(() => {
            setClaimStatus((prev) => ({ ...prev, [challengeId]: 'error' }));
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Eye className="w-12 h-12 text-red-500 mr-4" />
            <h1 className="text-4xl font-bold">🕵️ SECRET AGENT BRIEFING</h1>
            <EyeOff className="w-12 h-12 text-red-500 ml-4" />
          </div>
          <p className="text-red-300 text-lg">CLASSIFIED - EYES ONLY</p>
          <p className="text-gray-300">Access Level: TOP SECRET</p>
        </div>

        {!isAuthenticated ? (
          <div className="bg-black/80 border border-red-500/50 rounded-lg p-8">
            <div className="text-center mb-6">
              <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-red-400 mb-4">AGENT IDENTIFICATION REQUIRED</h2>
              <p className="text-gray-300 mb-6">
                Enter your agent code to access classified missions.
                <br />
                <span className="text-yellow-400 text-sm">
                  💡 Hint: Famous secret agents have numeric codes...
                </span>
              </p>
            </div>
            
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="text"
                value={agentCode}
                onChange={(e) => setAgentCode(e.target.value)}
                placeholder="Enter agent code (e.g., AGENT_007)"
                className="flex-1 bg-gray-800 border border-red-500/50 rounded px-4 py-2 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleCodeSubmit()}
              />
              <button
                onClick={handleCodeSubmit}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition-colors"
              >
                ACCESS
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
              <p>🎯 Try codes like: AGENT_007, GHOST_PROTOCOL, MATRIX_RELOADED</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mission Briefing */}
            {currentMission && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-bold text-red-400">
                    {agentMissions[currentMission as keyof typeof agentMissions].title}
                  </h2>
                </div>
                <p className="text-gray-300 mb-4">
                  {agentMissions[currentMission as keyof typeof agentMissions].description}
                </p>
                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-4 mb-4">
                  <p className="text-yellow-300">
                    <strong>🎁 Reward:</strong> {agentMissions[currentMission as keyof typeof agentMissions].reward}
                  </p>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/50 rounded p-4">
                  <p className="text-blue-300">
                    <strong>🔍 Intelligence:</strong> {agentMissions[currentMission as keyof typeof agentMissions].clue}
                  </p>
                </div>
              </div>
            )}

            {/* Discovered Missions */}
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Completed Missions ({discoveredMissions.length}/3)
              </h3>
              {discoveredMissions.map(mission => (
                <div key={mission} className="bg-gray-800/50 rounded p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{mission}</span>
                    <span className="text-green-400">✓ COMPLETED</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Secret Phrase: &quot;{agentMissions[mission as keyof typeof agentMissions].secretPhrase}&quot;
                    {(() => {
                      const phrase = agentMissions[mission as keyof typeof agentMissions].secretPhrase;
                      const status = claimStatus[`egg/agent/${phrase}`];
                      if (!isTeam) return <span className="ml-2 text-xs text-gray-400"> login as team to claim</span>;
                      if (status === 'pending') return <span className="ml-2 text-xs text-gray-400"> … crediting</span>;
                      if (status === 'claimed') return <span className="ml-2 text-xs text-green-400"> ✔ credited</span>;
                      if (status === 'duplicate') return <span className="ml-2 text-xs text-green-400"> ✔ already credited</span>;
                      if (status === 'error') return <span className="ml-2 text-xs text-red-400"> error</span>;
                      return null;
                    })()}
                  </p>
                </div>
              ))}
              {discoveredMissions.length === 0 && (
                <p className="text-gray-400">No missions completed yet. Try different agent codes!</p>
              )}
            </div>

            {/* Points Summary */}
            <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-6 text-center">
              <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-400">Total Agent Points: {points}</h3>
              <p className="text-gray-300">Tell staff these secret phrases for bonus points!</p>
            </div>
          </div>
        )}

        {/* Footer Warning */}
        <div className="mt-8 text-center text-xs text-red-400">
          <p>⚠️ WARNING: This briefing contains classified information.</p>
          <p>Unauthorized access is punishable by immediate termination.</p>
          <p className="mt-2 text-gray-500">🎮 This is a game. Please don&apos;t actually try to hack anything!</p>
        </div>
      </div>
    </div>
  );
}
