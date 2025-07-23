interface CyberUFVLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function CyberUFVLogo({ className = '', size = 'md' }: CyberUFVLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto', 
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* UFV Shield/Logo */}
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800 rounded-lg border-2 border-green-400 shadow-lg mr-3`}>
        <div className="text-white font-bold text-center px-2 py-1">
          <div className="text-xs leading-none">UFV</div>
          <div className="text-[10px] leading-none opacity-90">CYBER</div>
        </div>
      </div>
      
      {/* Text Logo */}
      <div className="text-white">
        <div className="font-bold text-lg leading-none">
          <span className="text-green-400">Cyber</span>
          <span className="text-white">UFV</span>
        </div>
        <div className="text-xs text-green-300 opacity-90 leading-none">
          Cybersecurity Club
        </div>
      </div>
    </div>
  );
}
