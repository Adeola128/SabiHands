import React, { useState } from 'react';
import { Gift, Phone, Banknote, Ticket, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './VariableRewardReveal.css';

interface RewardData {
  type: string;
  name: string;
  pointsAmount?: number;
  ngnAmount?: number;
}

interface VariableRewardRevealProps {
  isLoading?: boolean;
  reward?: RewardData | null;
  onClaim: () => void;
  triggerText?: string;
  triggerAction?: () => void;
}

export const VariableRewardReveal: React.FC<VariableRewardRevealProps> = ({ 
  isLoading, 
  reward, 
  onClaim,
  triggerText = "Tap to open your Mega Mystery Box!",
  triggerAction
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    if (isLoading) return;
    if (reward) {
      setIsRevealed(true);
    } else if (triggerAction) {
      triggerAction();
    }
  };

  const getRewardIcon = () => {
    switch (reward?.type) {
      case 'airtime': return <Phone size={64} color="#4CAF50" />;
      case 'cash': return <Banknote size={64} color="#2E7D32" />;
      case 'subscription': return <Ticket size={64} color="#E91E63" />;
      default: return <Gift size={64} color="#f5a623" />;
    }
  };

  const getRewardText = () => {
    switch (reward?.type) {
      case 'airtime': return `You won ₦${reward.ngnAmount} Airtime!`;
      case 'cash': return `You won ₦${reward.ngnAmount} Cashback!`;
      case 'subscription': return `You won a ${reward.name}!`;
      default: return `+${reward?.pointsAmount} Bonus Points!`;
    }
  };

  return (
    <div className="reward-reveal-container">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div 
            key="mystery-box"
            className="mystery-box clickable"
            onClick={handleReveal}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="box-icon">
              {isLoading ? <Loader2 size={64} color="#4a90e2" className="spin" /> : <Gift size={64} color="#f5a623" />}
            </div>
            <h3>Mega Mystery Box!</h3>
            <p className="tap-hint">{isLoading ? 'Opening...' : triggerText}</p>
          </motion.div>
        ) : (
          <motion.div 
            key="revealed-reward"
            className="revealed-reward"
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="reward-icon-burst">
              {getRewardIcon()}
            </div>
            <h2>Amazing!</h2>
            <div className="bonus-amount highlight">{getRewardText()}</div>
            <button className="claim-btn" onClick={onClaim}>
              Claim Reward
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
