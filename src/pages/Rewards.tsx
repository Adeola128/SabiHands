import React, { useState } from 'react';
import { Wallet, Phone, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import './Rewards.css';

const POINTS_TO_NAIRA_RATE = 10;
const MAX_PAYOUT_NGN = 700;

export const Rewards: React.FC = () => {
  // Mock balance for now (in a real app, you would fetch this from Supabase)
  const [pointsBalance, setPointsBalance] = useState(5000); 
  
  const [rewardType, setRewardType] = useState<'cash' | 'airtime'>('cash');
  const [amountNgn, setAmountNgn] = useState<number>(100);
  const [accountDetails, setAccountDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pointsCost = amountNgn * POINTS_TO_NAIRA_RATE;
  const isOverLimit = amountNgn > MAX_PAYOUT_NGN;
  const isInsufficientPoints = pointsCost > pointsBalance;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit || isInsufficientPoints) return;
    
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to redeem points.');
        setIsProcessing(false);
        return;
      }

      // Call the Paga Payout Edge Function
      const { data, error } = await supabase.functions.invoke('paga-payout', {
        body: { 
          user_id: session.user.id,
          reward_type: rewardType,
          points_cost: pointsCost,
          destination_account: accountDetails
        }
      });

      if (error || (data && data.error)) {
        throw new Error(error?.message || data?.error || 'Transaction failed');
      }

      // Success
      setPointsBalance(prev => prev - pointsCost);
      toast.success(`Successfully redeemed ${pointsCost} points for ₦${amountNgn}!`);
      setAccountDetails('');
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to process payout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <h1>Your Rewards Dashboard</h1>
        <p>Convert your hard-earned impact points into real rewards.</p>
      </div>

      <div className="balance-card">
        <Wallet size={48} color="#4a90e2" className="balance-icon" />
        <div className="balance-info">
          <h2>{pointsBalance.toLocaleString()}</h2>
          <p>Available Points</p>
        </div>
        <div className="naira-equivalent">
          <span>≈ ₦{(pointsBalance / POINTS_TO_NAIRA_RATE).toLocaleString()}</span>
        </div>
      </div>

      <div className="redemption-section">
        <h3>Redeem Points</h3>
        
        <div className="reward-type-selector">
          <button 
            type="button"
            className={`type-btn ${rewardType === 'cash' ? 'active' : ''}`}
            onClick={() => setRewardType('cash')}
          >
            <Banknote size={20} />
            <span>Cashback</span>
          </button>
          <button 
            type="button"
            className={`type-btn ${rewardType === 'airtime' ? 'active' : ''}`}
            onClick={() => setRewardType('airtime')}
          >
            <Phone size={20} />
            <span>Airtime</span>
          </button>
        </div>

        <form onSubmit={handleRedeem} className="redemption-form">
          <div className="form-group">
            <label>Amount (₦)</label>
            <input 
              type="number" 
              min="50"
              max={MAX_PAYOUT_NGN}
              value={amountNgn}
              onChange={(e) => setAmountNgn(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label>{rewardType === 'cash' ? 'Paga / Bank Account Details' : 'Phone Number'}</label>
            <input 
              type="text" 
              placeholder={rewardType === 'cash' ? 'Account Number' : '080...'}
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              required
            />
          </div>

          <div className="cost-summary">
            <span>Points required:</span>
            <span className={`cost ${isInsufficientPoints ? 'error-text' : ''}`}>
              {pointsCost.toLocaleString()} pts
            </span>
          </div>

          {isOverLimit && (
            <div className="alert-box error">
              <AlertCircle size={18} />
              <span>Maximum payout limit is ₦{MAX_PAYOUT_NGN} per request.</span>
            </div>
          )}

          {isInsufficientPoints && (
            <div className="alert-box error">
              <AlertCircle size={18} />
              <span>You don't have enough points for this transaction.</span>
            </div>
          )}

          <button 
            type="submit" 
            className="redeem-btn"
            disabled={isOverLimit || isInsufficientPoints || isProcessing || amountNgn <= 0 || !accountDetails}
          >
            {isProcessing ? (
              <><Loader2 size={18} className="spin" /> Processing...</>
            ) : (
              `Redeem ₦${amountNgn}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
