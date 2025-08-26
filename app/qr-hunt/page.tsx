'use client'

import { useState } from 'react';
import { QrCode, Camera, Gift, Eye, Star } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function QRHuntPage() {
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [claimStatus, setClaimStatus] = useState<Record<string, 'pending' | 'claimed' | 'duplicate' | 'error'>>({});
  const { user, isTeam } = useAuth();

  // Hidden QR codes and their rewards
  const qrCodes = {
    'CTF_POSTER_QR': {
      location: 'Main poster in entrance',
      phrase: 'SCAN_TO_WIN',
      points: 25,
      hint: 'Check the main CTF event poster'
    },
    'BATHROOM_MIRROR_QR': {
      location: 'Hidden behind bathroom mirror',
      phrase: 'REFLECTION_HACKER',
      points: 75,
      hint: 'Sometimes the best hiding spots are where you least expect...'
    },
    'VENDING_MACHINE_QR': {
      location: 'Under vending machine B4',
      phrase: 'SNACK_OVERFLOW',
      points: 50,
      hint: 'Hunger drives hackers to dark places'
    },
    'LIBRARY_BOOK_QR': {
      location: 'Page 404 of "Network Security" book',
      phrase: 'PAGE_NOT_FOUND',
      points: 100,
      hint: 'Error 404: Security not found'
    },
    'JANITOR_CLOSET_QR': {
      location: 'Behind cleaning supplies',
      phrase: 'CLEAN_HACK',
      points: 125,
      hint: 'Even hackers need to clean up their traces'
    }
  };

  const handleCodeSubmit = () => {
    const code = qrCodes[currentCode.toUpperCase() as keyof typeof qrCodes];
    if (code && !scannedCodes.includes(currentCode.toUpperCase())) {
      setScannedCodes(prev => [...prev, currentCode.toUpperCase()]);
      // Try to persist for team users
      const challengeId = `egg/qr/${currentCode.toUpperCase()}`;
      if (isTeam && user?.teamId) {
        setClaimStatus((prev) => ({ ...prev, [challengeId]: 'pending' }));
        fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: user.teamId,
            challengeId,
            answer: code.phrase,
            status: 'correct',
            points: code.points,
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
      setCurrentCode('');
    }
  };

  const totalPoints = scannedCodes.reduce((sum, code) => {
    const qr = qrCodes[code as keyof typeof qrCodes];
    return sum + (qr?.points || 0);
  }, 0);

  // Award bonus achievements based on progress
  const totalQrCount = Object.keys(qrCodes).length;
  const maybeAwardBonus = (id: string, answer: string, points: number) => {
    if (!isTeam || !user?.teamId) return;
    if (claimStatus[id] === 'claimed' || claimStatus[id] === 'duplicate' || claimStatus[id] === 'pending') return;
    setClaimStatus((prev) => ({ ...prev, [id]: 'pending' }));
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: user.teamId,
        challengeId: id,
        answer,
        status: 'correct',
        points,
        penalty: 0,
      }),
    }).then((res) => {
      if (res.status === 409) setClaimStatus((prev) => ({ ...prev, [id]: 'duplicate' }));
      else if (res.ok) setClaimStatus((prev) => ({ ...prev, [id]: 'claimed' }));
      else setClaimStatus((prev) => ({ ...prev, [id]: 'error' }));
    }).catch(() => setClaimStatus((prev) => ({ ...prev, [id]: 'error' })));
  };

  if (scannedCodes.length >= 3) {
    maybeAwardBonus('egg/qr/bonus/explorer', 'QR_CODE_HUNTER', 50);
  }
  if (scannedCodes.length === totalQrCount && totalQrCount > 0) {
    maybeAwardBonus('egg/qr/bonus/master', 'TREASURE_MASTER_2024', 100);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <QrCode className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold mb-2">🔍 QR CODE TREASURE HUNT</h1>
          <p className="text-cyan-300 text-lg">Hidden codes are scattered around the venue!</p>
          <p className="text-gray-300">Find them, scan them, win points!</p>
        </div>

        {/* Scanner Simulation */}
        <div className="bg-black/60 border border-cyan-500/50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold">QR Code Scanner</h2>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              placeholder="Enter QR code data here..."
              className="flex-1 bg-gray-800 border border-cyan-500/50 rounded px-4 py-2 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleCodeSubmit()}
            />
            <button
              onClick={handleCodeSubmit}
              className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded font-bold transition-colors"
            >
              SCAN
            </button>
          </div>
          
          <p className="text-sm text-gray-400 mt-2">
            💡 Tip: QR codes are hidden in various locations around the venue. Some are easier to find than others!
          </p>
        </div>

        {/* Progress */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Discovered QR Codes ({scannedCodes.length}/{Object.keys(qrCodes).length})
            </h3>
              {scannedCodes.map(code => {
              const qr = qrCodes[code as keyof typeof qrCodes];
              return (
                <div key={code} className="bg-gray-800/50 rounded p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{qr.location}</span>
                    <span className="text-green-400">+{qr.points} pts</span>
                  </div>
                  <p className="text-sm text-cyan-300">
                    Secret phrase: &quot;{qr.phrase}&quot;
                      {(() => {
                        const status = claimStatus[`egg/qr/${code}`];
                        if (!isTeam) return <span className="ml-2 text-xs text-gray-400"> login as team to claim</span>;
                        if (status === 'pending') return <span className="ml-2 text-xs text-gray-400"> … crediting</span>;
                        if (status === 'claimed') return <span className="ml-2 text-xs text-green-400"> ✔ credited</span>;
                        if (status === 'duplicate') return <span className="ml-2 text-xs text-green-400"> ✔ already credited</span>;
                        if (status === 'error') return <span className="ml-2 text-xs text-red-400"> error</span>;
                        return null;
                      })()}
                  </p>
                </div>
              );
            })}
            {scannedCodes.length === 0 && (
              <p className="text-gray-400">No QR codes found yet. Start exploring!</p>
            )}
          </div>

          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Treasure Hunt Rewards
            </h3>
            <div className="space-y-3">
              <div className="text-center bg-yellow-900/30 rounded p-4">
                <p className="text-2xl font-bold text-yellow-400">{totalPoints} Points</p>
                <p className="text-yellow-300">Total Earned</p>
              </div>
              
              {scannedCodes.length >= 3 && (
                <div className="bg-blue-900/30 rounded p-3 text-center">
                  <p className="text-blue-300 font-bold">🏆 BONUS ACHIEVED!</p>
                  <p className="text-sm">Explorer Badge: +50 extra points!</p>
                  <p className="text-cyan-400">&quot;QR_CODE_HUNTER&quot;</p>
                </div>
              )}
              
              {scannedCodes.length === Object.keys(qrCodes).length && (
                <div className="bg-gold-900/30 rounded p-3 text-center animate-pulse">
                  <p className="text-yellow-300 font-bold">🌟 LEGENDARY!</p>
                  <p className="text-sm">Master Treasure Hunter: +100 extra points!</p>
                  <p className="text-yellow-400">&quot;TREASURE_MASTER_2024&quot;</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Hints */}
        <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Location Hints
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(qrCodes).map(([code, data]) => (
              <div 
                key={code} 
                className={`p-3 rounded border ${
                  scannedCodes.includes(code) 
                    ? 'bg-green-800/30 border-green-500/50' 
                    : 'bg-gray-800/30 border-gray-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">
                    {scannedCodes.includes(code) ? '✅' : '🔍'} {data.location}
                  </span>
                  <span className="text-sm text-gray-400">{data.points} pts</span>
                </div>
                <p className="text-sm text-gray-300">{data.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>📱 Use your phone&apos;s camera app or QR scanner to read the codes</p>
          <p>📝 Then enter the data from the QR code into the scanner above</p>
          <p>🏆 Tell staff your secret phrases for bonus points!</p>
        </div>
      </div>
    </div>
  );
}
