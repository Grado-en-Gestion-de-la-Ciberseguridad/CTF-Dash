'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Lock, Eye, Zap } from 'lucide-react';

interface TerminalCommand {
  command: string;
  output: string[];
  isSecret?: boolean;
  secretPhrase?: string;
  points?: number;
}

export default function HiddenTerminalPage() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ input: string; output: string[]; timestamp: string }>>([]);
  const [currentDirectory, setCurrentDirectory] = useState('/home/investigator');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discoveredSecrets, setDiscoveredSecrets] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Easter egg commands and responses
  const commands: Record<string, TerminalCommand> = {
    'help': {
      command: 'help',
      output: [
        'Available commands:',
        '  help          - Show this help message',
        '  ls            - List directory contents',
        '  cat <file>    - Display file contents', 
        '  whoami        - Display current user',
        '  pwd           - Print working directory',
        '  date          - Show current date and time',
        '  clear         - Clear terminal screen',
        '  exit          - Exit terminal session',
        '',
        'Try exploring... there might be hidden files 👀'
      ]
    },
    'ls': {
      command: 'ls',
      output: [
        'total 8',
        'drwxr-xr-x 2 investigator investigator 4096 Mar 15 14:32 .',
        'drwxr-xr-x 3 investigator investigator 4096 Mar 15 14:32 ..',
        '-rw-r--r-- 1 investigator investigator  220 Mar 15 14:32 .bash_history',
        '-rw-r--r-- 1 investigator investigator   18 Mar 15 14:32 .hidden_file',
        '-rw-r--r-- 1 investigator investigator  156 Mar 15 14:32 investigation_log.txt',
        '-rw-r--r-- 1 investigator investigator   89 Mar 15 14:32 notes.txt'
      ]
    },
    'ls -la': {
      command: 'ls -la',
      output: [
        'total 12',
        'drwxr-xr-x 2 investigator investigator 4096 Mar 15 14:32 .',
        'drwxr-xr-x 3 investigator investigator 4096 Mar 15 14:32 ..',
        '-rw-r--r-- 1 investigator investigator  220 Mar 15 14:32 .bash_history',
        '-rw------- 1 investigator investigator   42 Mar 15 14:32 .hidden_file',
        '-rw-r--r-- 1 investigator investigator   33 Mar 15 14:32 .secret_diary',
        '-rw-r--r-- 1 investigator investigator  156 Mar 15 14:32 investigation_log.txt',
        '-rw-r--r-- 1 investigator investigator   89 Mar 15 14:32 notes.txt',
        '-rwxr-xr-x 1 investigator investigator  127 Mar 15 14:32 unlock.sh'
      ]
    },
    'whoami': {
      command: 'whoami',
      output: ['investigator']
    },
    'pwd': {
      command: 'pwd',
      output: ['/home/investigator']
    },
    'date': {
      command: 'date',
      output: [new Date().toString()]
    },
    'cat notes.txt': {
      command: 'cat notes.txt',
      output: [
        'Investigation Notes:',
        '- Check social media accounts for suspicious activity',
        '- Dr. Morgan seems to be working late hours frequently',
        '- There might be something hidden in the system logs...',
        '- Remember: konami code might unlock something special 🎮'
      ]
    },
    'cat investigation_log.txt': {
      command: 'cat investigation_log.txt',
      output: [
        '=== INVESTIGATION LOG ===',
        '[14:32] Started investigation into security breach',
        '[14:45] Found suspicious GitHub repository',
        '[15:12] Social media analysis reveals late-night posts',
        '[15:30] Network logs show unusual access patterns',
        '[16:00] Dr. Morgan\'s access card used after hours',
        '',
        'Note: Check /var/log/secret.log for more details'
      ]
    },
    'cat .hidden_file': {
      command: 'cat .hidden_file',
      output: [
        'The password is hidden in plain sight...',
        'Look for: THE_MATRIX_HAS_YOU',
        '',
        '🔍 Secret phrase discovered! Tell staff: "FOLLOW_THE_WHITE_RABBIT" for 50 bonus points!'
      ],
      isSecret: true,
      secretPhrase: 'FOLLOW_THE_WHITE_RABBIT',
      points: 50
    },
    'cat .secret_diary': {
      command: 'cat .secret_diary',
      output: [
        'Dr. Morgan\'s Secret Diary Entry:',
        '',
        '"The university systems are more vulnerable than they think.',
        'Tonight, I execute my plan. The documents will be mine.',
        'They\'ll never find my hideout at coordinates: 40.7128,-74.0060"',
        '',
        '🎯 Location found! Tell staff: "HIDEOUT_COORDINATES_FOUND" for 75 bonus points!'
      ],
      isSecret: true,
      secretPhrase: 'HIDEOUT_COORDINATES_FOUND',
      points: 75
    },
    './unlock.sh': {
      command: './unlock.sh',
      output: [
        'Running unlock script...',
        'Checking permissions...',
        'Access granted!',
        '',
        '🔓 SYSTEM UNLOCKED! Advanced commands now available.',
        'Try: sudo -l, netstat, ps aux',
        '',
        '🏆 Master hacker! Tell staff: "I_AM_THE_ONE" for 100 bonus points!'
      ],
      isSecret: true,
      secretPhrase: 'I_AM_THE_ONE',
      points: 100
    },
    'sudo -l': {
      command: 'sudo -l',
      output: [
        'User investigator may run the following commands on this host:',
        '    (ALL) NOPASSWD: /bin/cat /var/log/*',
        '    (ALL) NOPASSWD: /usr/bin/netstat',
        '    (ALL) NOPASSWD: /bin/ps'
      ]
    },
    'netstat -tulpn': {
      command: 'netstat -tulpn',
      output: [
        'Active Internet connections (only servers)',
        'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name',
        'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1337/sshd',
        'tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      2023/mysqld',
        'tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1984/apache2',
        'tcp        0      0 0.0.0.0:1337            0.0.0.0:*               LISTEN      2024/backdoor',
        'tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      2025/secret_server',
        '',
        '⚠️  Suspicious services detected! Backdoor on port 1337!'
      ]
    },
    'ps aux': {
      command: 'ps aux',
      output: [
        'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        'root           1  0.0  0.1  15512  2048 ?        Ss   Mar15   0:01 /sbin/init',
        'alex        2023  1.2  0.8  12344  8192 ?        S    Mar15   2:15 /usr/bin/data_exfil',
        'alex        2024  0.8  0.4   8432  4096 ?        S    Mar15   1:30 ./backdoor_server',
        'alex        2025  2.1  1.2  16384 12288 ?        R    Mar15   4:22 python3 keylogger.py',
        'root        2026  0.0  0.1   4432  1024 ?        S    Mar15   0:05 /bin/cleanup_traces',
        '',
        '🚨 Malicious processes found! Dr. Morgan is definitely the hacker!'
      ]
    },
    'cat /var/log/secret.log': {
      command: 'cat /var/log/secret.log',
      output: [
        '=== SECRET OPERATION LOG ===',
        '[23:47] Initiated data extraction protocol',
        '[23:52] Bypassed security measures using social engineering',
        '[00:15] Downloaded 2,847 student records',
        '[00:32] Downloaded faculty database',
        '[01:05] Planted backdoor for future access',
        '[01:22] Cleared most traces... or did I? 😈',
        '',
        'Operation codename: DIGITAL_HEIST',
        'Next target: Government database on 2024-03-20',
        '',
        '💎 Ultimate secret! Tell staff: "OPERATION_DIGITAL_HEIST" for 150 bonus points!'
      ],
      isSecret: true,
      secretPhrase: 'OPERATION_DIGITAL_HEIST',
      points: 150
    },
    'konami': {
      command: 'konami',
      output: [
        '🎮 KONAMI CODE ACTIVATED! 🎮',
        '',
        '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️',
        '',
        'You have unlocked the secret developer mode!',
        'All system restrictions have been lifted.',
        'You are now Neo from The Matrix! 😎',
        '',
        '🌟 Legendary achievement! Tell staff: "UP_UP_DOWN_DOWN_LEFT_RIGHT_LEFT_RIGHT_B_A" for 200 bonus points!'
      ],
      isSecret: true,
      secretPhrase: 'UP_UP_DOWN_DOWN_LEFT_RIGHT_LEFT_RIGHT_B_A',
      points: 200
    },
    'matrix': {
      command: 'matrix',
      output: [
        'Wake up, Neo...',
        'The Matrix has you...',
        'Follow the white rabbit...',
        '',
        '010101010110100001100101001000000110110101100001011101000111001001101001011110000010000001101000011000010111001100100000011110010110111101110101',
        '',
        'Decrypt this binary for another secret! 🐰'
      ]
    }
  };

  // Scroll to bottom when new content is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on load and click
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const timestamp = new Date().toLocaleTimeString();

    if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    }

    if (trimmedCmd === 'exit') {
      setHistory(prev => [...prev, {
        input: cmd,
        output: ['Connection closed.', 'Goodbye, investigator! 👋'],
        timestamp
      }]);
      return;
    }

    // Special authentication check
    if (trimmedCmd === 'the_matrix_has_you') {
      setIsAuthenticated(true);
      setHistory(prev => [...prev, {
        input: cmd,
        output: [
          '🔓 AUTHENTICATION SUCCESSFUL!',
          'Welcome to the secure terminal, Agent.',
          'Advanced commands unlocked.',
          'You may now access classified files.'
        ],
        timestamp
      }]);
      return;
    }

    // Check for command in our database
    const commandData = commands[trimmedCmd] || commands[cmd.trim()];
    
    if (commandData) {
      // If it's a secret command, mark it as discovered
      if (commandData.isSecret && commandData.secretPhrase) {
        if (!discoveredSecrets.includes(commandData.secretPhrase)) {
          setDiscoveredSecrets(prev => [...prev, commandData.secretPhrase!]);
        }
      }

      setHistory(prev => [...prev, {
        input: cmd,
        output: commandData.output,
        timestamp
      }]);
    } else {
      // Unknown command
      setHistory(prev => [...prev, {
        input: cmd,
        output: [`bash: ${cmd}: command not found`, 'Try "help" for available commands'],
        timestamp
      }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput('');
    }
  };

  const getPrompt = () => {
    const user = isAuthenticated ? 'agent' : 'investigator';
    return `${user}@ctf-terminal:${currentDirectory}$`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-green-400/30 pb-2">
        <Terminal className="w-6 h-6" />
        <h1 className="text-xl font-bold">CTF Secure Terminal</h1>
        <div className="ml-auto flex items-center gap-4 text-sm">
          {isAuthenticated && (
            <div className="flex items-center gap-1 text-green-400">
              <Lock className="w-4 h-4" />
              <span>AUTHENTICATED</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>Secrets Found: {discoveredSecrets.length}</span>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      {history.length === 0 && (
        <div className="mb-4 text-green-300">
          <p>🔍 CTF Investigation Terminal v2.4.1</p>
          <p>📡 Connected to: investigator@ctf-server</p>
          <p>⚠️  Warning: This is a secure system. Unauthorized access is prohibited.</p>
          <p className="mt-2">💡 Hint: Try typing &quot;help&quot; to get started, or explore with &quot;ls&quot;</p>
          <p className="mt-1 text-yellow-400">🎯 Find hidden commands and secret phrases for bonus points!</p>
          <div className="mt-2 text-gray-400 text-sm">
            <p>Legend: 🔍 = Clue | 🎯 = Location | 🔓 = Access | 🏆 = Achievement | 💎 = Ultimate | 🌟 = Legendary</p>
          </div>
        </div>
      )}

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="bg-black border border-green-400/30 rounded-lg p-4 h-96 overflow-y-auto mb-4"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Command History */}
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-green-400">{getPrompt()}</span>
              <span>{entry.input}</span>
              <span className="text-gray-500 text-xs ml-auto">{entry.timestamp}</span>
            </div>
            {entry.output.map((line, lineIndex) => (
              <div 
                key={lineIndex} 
                className={`${line.includes('🔍') || line.includes('🎯') || line.includes('🔓') || line.includes('🏆') || line.includes('💎') || line.includes('🌟') ? 'text-cyan-400 font-bold' : 'text-green-300'}`}
              >
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Current Input Line */}
        <div className="flex items-center gap-2">
          <span className="text-green-400">{getPrompt()}</span>
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent text-green-400 outline-none flex-1 w-full border-none"
              placeholder="Enter command..."
              aria-label="Terminal command input"
              spellCheck={false}
              autoComplete="off"
            />
          </form>
          <div className="w-2 h-4 bg-green-400 animate-pulse"></div>
        </div>
      </div>

      {/* Discovered Secrets Panel */}
      {discoveredSecrets.length > 0 && (
        <div className="bg-gray-900 border border-cyan-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-cyan-400 font-bold">🎉 Secret Phrases Discovered!</h3>
          </div>
          <div className="text-sm text-gray-300">
            <p className="mb-2">📢 Tell these phrases to CTF staff members for bonus points:</p>
            {discoveredSecrets.map((secret, index) => (
              <div key={index} className="bg-gray-800 rounded p-2 mb-1 border border-cyan-400/20">
                <span className="text-cyan-400 font-bold">&quot;{secret}&quot;</span>
                <span className="text-yellow-400 ml-2">
                  {secret === 'FOLLOW_THE_WHITE_RABBIT' && '(+50 points)'}
                  {secret === 'HIDEOUT_COORDINATES_FOUND' && '(+75 points)'}
                  {secret === 'I_AM_THE_ONE' && '(+100 points)'}
                  {secret === 'OPERATION_DIGITAL_HEIST' && '(+150 points)'}
                  {secret === 'UP_UP_DOWN_DOWN_LEFT_RIGHT_LEFT_RIGHT_B_A' && '(+200 points)'}
                </span>
              </div>
            ))}
            <p className="mt-2 text-yellow-400 text-xs">💡 Screenshot this as proof!</p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500 mt-4">
        <p>💡 Pro tips: Try &quot;ls -la&quot;, check hidden files with &quot;cat .&quot;, explore different commands!</p>
        <p>🎮 Easter egg: Some classic gaming references might unlock special features...</p>
        <p>🔐 Authentication might be required for advanced access...</p>
      </div>
    </div>
  );
}
