import React from 'react';
import { Medal, MapPin } from 'lucide-react';
import './MicroLeaderboard.css';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface MicroLeaderboardProps {
  region: string;
  category: string;
  users: LeaderboardUser[];
}

export const MicroLeaderboard: React.FC<MicroLeaderboardProps> = ({ region, category, users }) => {
  return (
    <div className="micro-leaderboard">
      <div className="leaderboard-header">
        <h3>Local Heroes</h3>
        <p className="context">
          <MapPin size={14} /> Top volunteers for <strong>{category}</strong> in <strong>{region}</strong>
        </p>
      </div>

      <div className="leaderboard-list">
        {users.map((user) => (
          <div key={user.id} className={`leaderboard-row ${user.isCurrentUser ? 'current-user' : ''}`}>
            <div className="rank">
              {user.rank === 1 ? <Medal color="#FFD700" size={24} /> : 
               user.rank === 2 ? <Medal color="#C0C0C0" size={24} /> : 
               user.rank === 3 ? <Medal color="#CD7F32" size={24} /> : 
               <span className="rank-num">#{user.rank}</span>}
            </div>
            <div className="user-info">
              <span className="name">{user.name} {user.isCurrentUser && '(You)'}</span>
            </div>
            <div className="points-col">
              <span className="points">{user.points} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
