import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const JoinTeam: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    const handleJoin = async () => {
      if (!token) {
        toast.error('Invalid invite link.');
        navigate('/');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        localStorage.setItem('pending_team_invite_token', token);
        toast.error('Please log in or sign up to accept this invitation.');
        navigate('/login');
        return;
      }

      try {
        // Fetch invite securely
        // Note: organization_members needs a policy allowing read by token, or we use an edge function.
        // Wait, the user doesn't have an organization yet. So they can't select from organization_members due to RLS unless they are already in the org.
        // We can create a policy: SELECT on organization_members USING (invite_token = current_setting('request.jwt.claim.token', true)::uuid) ? No.
        // Actually, let's just make the user able to update the row if the token matches, by creating an edge function, OR just let them call an RPC.
        // Since we didn't make an RPC, an Edge Function `accept-org-invite` is better, but wait, updating `organization_members` with token is easy with RLS:
        // CREATE POLICY "Allow accept invite by token" ON organization_members FOR UPDATE USING (invite_token::text = current_setting('request.headers')::json->>'x-invite-token'); -- Too complex.
        
        // Let's use an RPC or just an edge function? The user doesn't have permissions to update organization_members if they are not in the org yet.
        // Let's create `accept-org-invite` edge function.
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-org-invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ token })
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to accept invite");
        
        toast.success("You've successfully joined the team!");
        localStorage.removeItem('pending_team_invite_token');
        navigate('/dashboard/org');
      } catch (err: any) {
        toast.error(err.message);
        navigate('/');
      }
    };

    handleJoin();
  }, [token, navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ margin: '0 auto 16px', width: '32px', height: '32px', border: '3px solid var(--purple-100)', borderTopColor: 'var(--purple-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: '18px', color: 'var(--ink)' }}>Processing Invitation...</h2>
      </div>
    </div>
  );
};

export default JoinTeam;
