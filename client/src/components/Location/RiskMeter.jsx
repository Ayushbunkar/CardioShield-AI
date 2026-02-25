import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
/**
 * Animated circular risk meter component
 * Displays risk probability with animated progress and color-coded themes
 * 
 * @param {Object} props
 * @param {number} props.riskProbability - Risk probability (0-100)
 * @param {string} props.riskLevel - 'HIGH', 'MEDIUM', or 'LOW'
 */
const RiskMeter = ({ riskProbability = 0, riskLevel = 'LOW' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate the value on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(riskProbability);
    }, 300);
    return () => clearTimeout(timer);
  }, [riskProbability]);

  // Color themes based on risk level
  const themes = {
    HIGH: {
      gradient: ['#7a1d1d', '#ff4d4d'],
      glowColor: 'rgba(255, 77, 77, 0.4)',
      textColor: 'text-red-500',
      bgGradient: 'from-red-900/20 to-red-500/20',
      strokeColor: '#ff4d4d',
      label: 'HIGH RISK',
      message: 'High Cardiovascular Risk Detected. Immediate medical consultation is recommended.',
      messageIcon: AlertTriangle,
      messageIconColor: 'text-amber-400',
      pulseAnimation: true
    },
    MEDIUM: {
      gradient: ['#92400e', '#ffb347'],
      glowColor: 'rgba(255, 179, 71, 0.4)',
      textColor: 'text-amber-500',
      bgGradient: 'from-amber-900/20 to-amber-500/20',
      strokeColor: '#ffb347',
      label: 'MEDIUM RISK',
      message: 'Moderate Risk Detected. Preventive screening is advised.',
      messageIcon: Info,
      messageIconColor: 'text-amber-400',
      pulseAnimation: false
    },
    LOW: {
      gradient: ['#14532d', '#28a745'],
      glowColor: 'rgba(40, 167, 69, 0.4)',
      textColor: 'text-green-500',
      bgGradient: 'from-green-900/20 to-green-500/20',
      strokeColor: '#28a745',
      label: 'LOW RISK',
      message: 'Low Risk. Maintain healthy lifestyle.',
      messageIcon: CheckCircle,
      messageIconColor: 'text-green-400',
      pulseAnimation: false
    }
  };

  const theme = themes[riskLevel] || themes.LOW;
  
  // SVG circle calculations
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedValue / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      {/* Risk Meter Circle */}
      <div className="relative">
        {/* Glow effect for high risk */}
        {theme.pulseAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 60px ${theme.glowColor}`,
            }}
            animate={{
              boxShadow: [
                `0 0 30px ${theme.glowColor}`,
                `0 0 60px ${theme.glowColor}`,
                `0 0 30px ${theme.glowColor}`
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        {/* Background circle with glassmorphism */}
        <div 
          className={`relative rounded-full p-4 backdrop-blur-xl bg-gradient-to-br ${theme.bgGradient} border border-white/10 shadow-2xl`}
          style={{ width: size + 32, height: size + 32 }}
        >
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={strokeWidth}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`riskGradient-${riskLevel}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.gradient[0]} />
                <stop offset="100%" stopColor={theme.gradient[1]} />
              </linearGradient>
            </defs>

            {/* Progress arc */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={`url(#riskGradient-${riskLevel})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-5xl font-bold ${theme.textColor}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(animatedValue)}%
            </motion.span>
            <motion.span
              className="text-gray-400 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Risk Probability
            </motion.span>
          </div>
        </div>

        {/* Pulse rings for high risk */}
        {theme.pulseAnimation && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: theme.strokeColor }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: theme.strokeColor }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            />
          </>
        )}
      </div>

      {/* Risk Label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`mt-6 px-6 py-2 rounded-full ${theme.bgGradient} backdrop-blur-sm border border-white/10`}
      >
        <span className={`font-bold text-lg ${theme.textColor}`}>
          {theme.label}
        </span>
      </motion.div>

      {/* Risk Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className={`mt-4 flex items-start gap-2 text-center max-w-md px-4 ${riskLevel === 'HIGH' ? 'text-red-300' : riskLevel === 'MEDIUM' ? 'text-amber-300' : 'text-green-300'}`}
      >
        <theme.messageIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme.messageIconColor}`} />
        <p className="text-left">{theme.message}</p>
      </motion.div>
    </motion.div>
  );
};

export default RiskMeter;
