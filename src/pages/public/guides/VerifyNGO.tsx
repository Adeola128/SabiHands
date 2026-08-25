import React from 'react';
import GuideLayout from '../../../layouts/GuideLayout';

const VerifyNGO: React.FC = () => {
  return (
    <GuideLayout
      title="How to find legitimate NGO volunteer opportunities"
      description="Learn how to verify NGOs, avoid scams, and find legitimate organizations making a real impact in Nigeria."
      slug="verify-ngo"
    >
      <p>
        Volunteering is a noble pursuit, but unfortunately, the NGO sector in Nigeria (like in many parts of the world) is not immune to bad actors. Some "organizations" exist solely to collect grants without doing real impact work, while others exploit well-meaning volunteers for free labor without providing any actual community benefit.
      </p>
      <p>
        If you are going to dedicate your time and energy to a cause, you need to ensure the organization is legitimate. Here is a practical guide to verifying NGOs and finding safe, impactful volunteer opportunities.
      </p>

      <h2>1. Check for CAC Registration</h2>
      <p>
        The most basic baseline for any legitimate Non-Governmental Organization in Nigeria is registration with the Corporate Affairs Commission (CAC). They should be registered as an Incorporated Trustee (NGO). 
      </p>
      <p>
        If an organization claims to be a registered NGO, you can ask for their CAC RC number. Legitimate organizations are usually proud to display this on their website footer or "About Us" page. If they are evasive about their legal status, treat it as a red flag.
      </p>

      <h2>2. Look for a Digital Footprint and Transparency</h2>
      <p>
        A legitimate NGO should have a transparent digital presence. This doesn't mean they need a million-dollar website, but you should be able to find:
      </p>
      <ul>
        <li>Clear mission and vision statements.</li>
        <li>Names and profiles of their founders or board of trustees.</li>
        <li>Photographic or video evidence of past projects (not just stock photos).</li>
        <li>Impact reports or newsletters detailing what they have achieved.</li>
      </ul>

      <h2>3. Beware of "Pay-to-Volunteer" Schemes</h2>
      <p>
        While "voluntourism" (where people pay to travel abroad and volunteer) is common globally, local volunteering in Nigeria should almost never cost you money. 
      </p>
      <p>
        If an organization asks you to pay an "application fee," "training fee," or "registration fee" just for the privilege of volunteering your time, it is highly likely to be a scam. Legitimate NGOs value your time as a contribution; they do not charge you to give it.
      </p>

      <h2>4. Speak to Past Volunteers</h2>
      <p>
        The best indicator of an organization's legitimacy is how they treat their volunteers. Try to find people who have volunteered with them in the past. Did they feel safe? Was the work actually impactful? Did the organization provide the necessary logistics (like water or transport stipends if promised)? 
      </p>

      <h2>5. Use a Trusted Vetting Platform like Ralvo</h2>
      <p>
        Doing all this background research yourself can be exhausting. This is exactly why we built <strong>Ralvo</strong>.
      </p>
      <p>
        On Ralvo, organizations must go through a strict verification process before they are allowed to post volunteer opportunities. We check their legal status, review their digital footprint, and require identity verification for their administrators. 
      </p>
      <p>
        When you see a gig posted on Ralvo, you can apply with peace of mind knowing the organization has been vetted. Furthermore, because all check-ins and hours are tracked through the platform, organizations are held accountable for treating their volunteers fairly and issuing the promised certificates.
      </p>
    </GuideLayout>
  );
};

export default VerifyNGO;
