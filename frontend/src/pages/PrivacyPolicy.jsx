import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#74b9ff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Privacy Policy</h1>
          <p style={{ fontSize: '1rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            Last updated: January 2024
          </p>

          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
              <p style={{ marginBottom: '1rem' }}>
                We collect information you provide directly to us, such as when you create an account, book a ride, or contact us for support.
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Personal information (name, email, phone number)</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely)</li>
                <li>Location data for ride matching and navigation</li>
                <li>Usage data and app interactions</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>2. How We Use Your Information</h2>
              <p style={{ marginBottom: '1rem' }}>
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Match you with suitable ride partners</li>
                <li>Process payments and transactions</li>
                <li>Provide customer support</li>
                <li>Send important updates and notifications</li>
                <li>Improve our platform and user experience</li>
                <li>Ensure safety and security</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>3. Information Sharing</h2>
              <p style={{ marginBottom: '1rem' }}>
                We may share your information in the following circumstances:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>With other users for ride coordination (limited information only)</li>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect safety</li>
                <li>In connection with business transfers</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}>
                <strong>We never sell your personal information to third parties.</strong>
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>4. Data Security</h2>
              <p style={{ marginBottom: '1rem' }}>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure payment processing through certified providers</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>5. Your Rights and Choices</h2>
              <p style={{ marginBottom: '1rem' }}>
                You have the following rights regarding your personal information:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Access and review your personal data</li>
                <li>Update or correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Control location sharing settings</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>6. Location Information</h2>
              <p style={{ marginBottom: '1rem' }}>
                We collect location data to provide our core services. You can control location sharing through your device settings, 
                though this may limit app functionality.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>7. Data Retention</h2>
              <p style={{ marginBottom: '1rem' }}>
                We retain your information for as long as necessary to provide services and comply with legal obligations. 
                You can request deletion of your account at any time.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>8. Children's Privacy</h2>
              <p style={{ marginBottom: '1rem' }}>
                Our services are not intended for children under 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>9. Changes to This Policy</h2>
              <p style={{ marginBottom: '1rem' }}>
                We may update this privacy policy from time to time. We will notify you of any material changes through the app or email.
              </p>
            </section>

            <section>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>10. Contact Us</h2>
              <p style={{ marginBottom: '1rem' }}>
                If you have questions about this privacy policy or our privacy practices, please contact us:
              </p>
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px' }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> privacy@poolride.com</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Phone:</strong> +91 98765 43210</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Address:</strong> Bangalore, Karnataka, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;