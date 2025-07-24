'use client'

import { useState, useEffect } from 'react';
import { Coffee, Wifi, MessageSquare, Users, Clock, Zap } from 'lucide-react';

export default function HackerCafePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMessage, setCurrentMessage] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{id: number, user: string, message: string, time: string}>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Rotating hacker quotes/messages
  const hackerMessages = [
    "The best way to learn about security is to break it. - Unknown",
    "There are only 10 types of people: those who understand binary and those who don't.",
    "Security is not a product, but a process. - Bruce Schneier", 
    "In cybersecurity, the weakest link is usually between the chair and keyboard.",
    "Hackers don't break security, they demonstrate that it was already broken.",
    "The cloud is just someone else's computer. - Unknown",
    "Trust, but verify. Then verify again. - Russian Proverb (Modified)",
    "A computer without proper security is like a bank vault with the door wide open."
  ];

  useEffect(() => {
    // Simulated chat messages from "other hackers"
    const initialChatMessages = [
      { id: 1, user: "NeoMatrix", message: "Anyone find the hidden terminal yet? 🕵️", time: "14:32" },
      { id: 2, user: "CyberNinja", message: "Dr. Morgan's social media is suspicious AF", time: "14:35" },
      { id: 3, user: "QuantumHack", message: "Check the network logs around 2:47 AM", time: "14:38" },
      { id: 4, user: "GhostInShell", message: "Found something interesting in .bash_history 👀", time: "14:42" },
      { id: 5, user: "CodeBreaker", message: "Anyone else notice the USB in the lab?", time: "14:45" },
      { id: 6, user: "BinaryBeast", message: "The Konami code works on the main page! 🎮", time: "14:48" },
      { id: 7, user: "EliteHacker", message: "Coffee break? This crypto challenge is killing me ☕", time: "14:52" }
    ];

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Rotate messages every 5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % hackerMessages.length);
    }, 5000);

    // Initialize chat only once
    if (chatMessages.length === 0) {
      setChatMessages(initialChatMessages);
    }

    // Add random messages periodically
    const chatInterval = setInterval(() => {
      const randomMessages = [
        { user: "Anonymous", message: "Remember: always encrypt your communications 🔐", time: new Date().toLocaleTimeString().slice(0, 5) },
        { user: "SystemAdmin", message: "Pro tip: use Burp Suite for web app testing", time: new Date().toLocaleTimeString().slice(0, 5) },
        { user: "InfoSecGuru", message: "The answer is always 42... or is it? 🤔", time: new Date().toLocaleTimeString().slice(0, 5) },
        { user: "EthicalHacker", message: "White hat > black hat, always! 🎩", time: new Date().toLocaleTimeString().slice(0, 5) },
        { user: "CryptoPunk", message: "Hash functions are like coffee - they should be strong!", time: new Date().toLocaleTimeString().slice(0, 5) }
      ];
      
      const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      setChatMessages(prev => [...prev.slice(-10), { 
        id: Date.now(), 
        ...randomMsg 
      }]);
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(messageInterval);
      clearInterval(chatInterval);
    };
  }, [hackerMessages.length, chatMessages.length]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: "You",
        message: newMessage,
        time: new Date().toLocaleTimeString().slice(0, 5)
      };
      setChatMessages(prev => [...prev.slice(-10), message]);
      setNewMessage('');

      // Auto-reply with CTF hints
      setTimeout(() => {
        const replies = [
          "Nice! Check the resources page for more clues 📚",
          "Have you tried the terminal yet? Lots of secrets there! 💻",
          "Don't forget to scan QR codes around the venue 📱",
          "The agent briefing room has some interesting missions 🕵️",
          "Remember: every error message is a clue in disguise 🔍"
        ];
        const reply = {
          id: Date.now() + 1,
          user: "CTF_Assistant",
          message: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString().slice(0, 5)
        };
        setChatMessages(prev => [...prev.slice(-10), reply]);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-900 to-amber-900 text-white">
      {/* Header */}
      <div className="bg-black/80 border-b border-amber-500/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8 text-amber-400 animate-bounce" />
            <div>
              <h1 className="text-2xl font-bold text-amber-400">☕ The Hacker Café</h1>
              <p className="text-amber-300 text-sm">Where code meets coffee</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">47 online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">
        {/* Left Column - Menu & Quotes */}
        <div className="space-y-6">
          {/* Daily Quote */}
          <div className="bg-black/60 border border-amber-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Hacker Wisdom
            </h3>
            <div className="bg-amber-900/30 rounded p-4 min-h-20">
              <p className="text-amber-100 italic transition-all duration-500">
                &quot;{hackerMessages[currentMessage]}&quot;
              </p>
            </div>
            <div className="mt-2 text-xs text-amber-400">
              Quote {currentMessage + 1} of {hackerMessages.length} • Updates every 5s
            </div>
          </div>

          {/* Café Menu */}
          <div className="bg-black/60 border border-amber-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4">☕ Digital Menu</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-200">Espresso (Double Shot)</span>
                <span className="text-green-400">$3.14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">Binary Brew</span>
                <span className="text-green-400">$4.04</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">SQL Injection (Latte)</span>
                <span className="text-green-400">$5.67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">Buffer Overflow Cappuccino</span>
                <span className="text-green-400">$6.28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">Zero-Day Cold Brew</span>
                <span className="text-green-400">$7.77</span>
              </div>
              <hr className="border-amber-500/30 my-2" />
              <div className="flex justify-between font-bold">
                <span className="text-amber-200">Free WiFi Password:</span>
                <span className="text-cyan-400">CTF2024!</span>
              </div>
            </div>
          </div>

          {/* Hidden Rewards */}
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">🎁 Café Rewards</h4>
            <p className="text-sm text-purple-300 mb-2">
              Found the hidden café? You&apos;re a true explorer!
            </p>
            <div className="bg-purple-800/30 rounded p-2">
              <p className="text-cyan-400 font-mono text-sm">
                Secret phrase: &quot;COFFEE_FUELED_HACKER&quot;
              </p>
              <p className="text-purple-300 text-xs">
                +75 bonus points! ☕
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column - Chat */}
        <div className="md:col-span-2">
          <div className="bg-black/60 border border-amber-500/50 rounded-lg p-6 h-[600px] flex flex-col">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Hacker Chat Room
            </h3>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 bg-gray-900/50 rounded p-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className="group">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-semibold text-sm ${
                      msg.user === 'You' ? 'text-cyan-400' :
                      msg.user === 'CTF_Assistant' ? 'text-green-400' :
                      'text-amber-300'
                    }`}>
                      {msg.user}
                    </span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-gray-200 text-sm ml-2">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your CTF progress..."
                className="flex-1 bg-gray-800 border border-amber-500/50 rounded px-3 py-2 text-white text-sm placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Send
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              💡 Share your findings and get hints from other participants!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/80 border-t border-amber-500/30 p-4 text-center">
        <p className="text-amber-300 text-sm">
          🕰️ Open 24/7 • 📍 Located at <code>/cafe</code> • 
          ☕ Fueling hackers since 2024
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Disclaimer: No actual coffee served. Caffeine intake is your responsibility! 😄
        </p>
      </div>
    </div>
  );
}
