import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'white',
      margin: 0,
      padding: 0,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Simple Header */}
      <div style={{
        width: '100%',
        background: '#f8f9fa',
        padding: '1rem 2rem',
        borderBottom: '1px solid #dee2e6'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>PoolRide</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div style={{
        width: '100%',
        padding: '2rem',
        maxWidth: 'none'
      }}>
        <div style={{
          width: '100%',
          padding: '0'
        }}>
          
          {/* Title */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            borderBottom: '2px solid #333',
            paddingBottom: '1rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: 'bold'
            }}>
              Privacy Policy
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              margin: 0
            }}>
              Last updated: January 2024
            </p>
          </div>

          {/* Table of Contents */}
          <div style={{
            marginBottom: '2rem',
            padding: '1rem',
            border: '1px solid #ddd'
          }}>
            <h3 style={{
              color: '#333',
              marginBottom: '1rem',
              fontSize: '1.2rem'
            }}>
              Table of Contents
            </h3>
            <ol style={{
              margin: 0,
              paddingLeft: '1.5rem',
              lineHeight: '1.6'
            }}>
              <li>Information We Collect</li>
              <li>How We Use Your Information</li>
              <li>Information Sharing</li>
              <li>Data Security</li>
              <li>Your Rights and Choices</li>
              <li>Location Information</li>
              <li>Data Retention</li>
              <li>Children's Privacy</li>
              <li>Changes to This Policy</li>
              <li>Contact Us</li>
            </ol>
          </div>

          {/* Document Sections */}
          <div style={{ 
            fontSize: '1rem', 
            lineHeight: '1.6', 
            color: '#333' 
          }}>
            
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                1. Information We Collect
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We collect information you provide directly to us, such as when you create an account, book a ride, or contact us for support.
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Personal information (name, email, phone number)</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely)</li>
                <li>Location data for ride matching and navigation</li>
                <li>Usage data and app interactions</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                2. How We Use Your Information
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Match you with suitable ride partners</li>
                <li>Process payments and transactions</li>
                <li>Provide customer support</li>
                <li>Send important updates and notifications</li>
                <li>Improve our platform and user experience</li>
                <li>Ensure safety and security</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                3. Information Sharing
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We may share your information in the following circumstances:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>With other users for ride coordination (limited information only)</li>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect safety</li>
                <li>In connection with business transfers</li>
              </ul>
              <p style={{ 
                fontWeight: 'bold',
                padding: '1rem',
                border: '1px solid #ddd',
                background: '#f8f9fa',
                margin: 0
              }}>
                We never sell your personal information to third parties.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                4. Data Security
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure payment processing through certified providers</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                5. Your Rights and Choices
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                You have the following rights regarding your personal information:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Access and review your personal data</li>
                <li>Update or correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Control location sharing settings</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                6. Location Information
              </h2>
              <p style={{ marginBottom: '0' }}>
                We collect location data to provide our core services. You can control location sharing through your device settings,
                though this may limit app functionality.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                7. Data Retention
              </h2>
              <p style={{ marginBottom: '0' }}>
                We retain your information for as long as necessary to provide services and comply with legal obligations.
                You can request deletion of your account at any time.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                8. Children's Privacy
              </h2>
              <p style={{ marginBottom: '0' }}>
                Our services are not intended for children under 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                9. Changes to This Policy
              </h2>
              <p style={{ marginBottom: '0' }}>
                We may update this privacy policy from time to time. We will notify you of any material changes through the app or email.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                10. Contact Us
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                If you have questions about this privacy policy or our privacy practices, please contact us:
              </p>
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                background: '#f8f9fa'
              }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Email:</strong> privacy@poolride.com</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Phone:</strong> +91 98765 43210</p>
                <p style={{ margin: 0 }}><strong>Address:</strong> Bangalore, Karnataka, India</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;