import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
              Terms of Service
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
              <li>Acceptance of Terms</li>
              <li>Description of Service</li>
              <li>User Responsibilities</li>
              <li>Driver Requirements</li>
              <li>Payment Terms</li>
              <li>Cancellation Policy</li>
              <li>Safety and Liability</li>
              <li>Prohibited Conduct</li>
              <li>Account Termination</li>
              <li>Intellectual Property</li>
              <li>Disclaimers</li>
              <li>Limitation of Liability</li>
              <li>Dispute Resolution</li>
              <li>Changes to Terms</li>
              <li>Contact Information</li>
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
                1. Acceptance of Terms
              </h2>
              <p style={{ marginBottom: '0' }}>
                By accessing or using PoolRide, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                If you do not agree with any of these terms, you are prohibited from using our services.
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
                2. Description of Service
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                PoolRide is a ride-sharing platform that connects drivers and passengers traveling in similar directions.
                We facilitate connections but are not a transportation company.
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>We provide a platform for ride coordination</li>
                <li>Users arrange their own transportation</li>
                <li>We do not employ drivers or own vehicles</li>
                <li>All rides are arranged between independent users</li>
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
                3. User Responsibilities
              </h2>
              <p style={{ marginBottom: '1rem' }}>As a user of PoolRide, you agree to:</p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Respect other users and follow community guidelines</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Use the service only for legitimate ride-sharing purposes</li>
                <li>Not engage in any fraudulent or harmful activities</li>
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
                4. Driver Requirements
              </h2>
              <p style={{ marginBottom: '1rem' }}>Drivers must meet the following requirements:</p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Valid driver's license</li>
                <li>Vehicle insurance and registration</li>
                <li>Pass background verification checks</li>
                <li>Maintain vehicle safety standards</li>
                <li>Follow all traffic laws and regulations</li>
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
                5. Payment Terms
              </h2>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Passengers pay the agreed fare for rides</li>
                <li>PoolRide may charge service fees</li>
                <li>Payments are processed through secure third-party providers</li>
                <li>Refunds are subject to our cancellation policy</li>
                <li>All fees are clearly displayed before booking</li>
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
                6. Cancellation Policy
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Users may cancel rides according to the following policy:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Free cancellation up to 2 hours before departure</li>
                <li>Cancellations within 2 hours may incur fees</li>
                <li>No-shows may result in full charge</li>
                <li>Emergency cancellations are handled case-by-case</li>
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
                7. Safety and Liability
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                While we provide safety features, users participate at their own risk:
              </p>
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                background: '#fff3cd'
              }}>
                <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                  <li>PoolRide is not liable for accidents or incidents during rides</li>
                  <li>Users are responsible for their own safety</li>
                  <li>Report safety concerns immediately</li>
                  <li>Drivers must maintain appropriate insurance coverage</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                8. Prohibited Conduct
              </h2>
              <p style={{ marginBottom: '1rem' }}>The following activities are strictly prohibited:</p>
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                background: '#f8d7da'
              }}>
                <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                  <li>Harassment or discrimination of any kind</li>
                  <li>Fraudulent activities or misrepresentation</li>
                  <li>Using the platform for illegal purposes</li>
                  <li>Interfering with the operation of the service</li>
                  <li>Violating intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#333',
                fontSize: '1.4rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #ddd',
                paddingBottom: '0.5rem'
              }}>
                9. Account Termination
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We reserve the right to terminate or suspend accounts for violations of these terms:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Immediate termination for serious violations</li>
                <li>Warning system for minor infractions</li>
                <li>Users may delete their accounts at any time</li>
                <li>Data retention according to our privacy policy</li>
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
                10. Intellectual Property
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                All content and technology on PoolRide is our property or licensed to us:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>PoolRide trademark and logo are protected</li>
                <li>App design and functionality are proprietary</li>
                <li>Users retain rights to their personal content</li>
                <li>Respect third-party intellectual property rights</li>
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
                11. Disclaimers
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                PoolRide is provided "as is" without warranties of any kind:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>No guarantee of service availability</li>
                <li>No warranty of ride availability or quality</li>
                <li>Users assume responsibility for ride decisions</li>
                <li>Technology may have occasional interruptions</li>
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
                12. Limitation of Liability
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Our liability is limited to the maximum extent permitted by law:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>Not liable for indirect or consequential damages</li>
                <li>Maximum liability limited to service fees paid</li>
                <li>No liability for user-to-user interactions</li>
                <li>Force majeure events are excluded</li>
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
                13. Dispute Resolution
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Disputes will be resolved through the following process:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>First attempt resolution through customer support</li>
                <li>Mediation for unresolved issues</li>
                <li>Arbitration as final binding resolution</li>
                <li>Jurisdiction: Bangalore, Karnataka, India</li>
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
                14. Changes to Terms
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We may update these terms from time to time. Material changes will be communicated through:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '0' }}>
                <li>In-app notifications</li>
                <li>Email notifications to registered users</li>
                <li>Website announcements</li>
                <li>Continued use constitutes acceptance of new terms</li>
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
                15. Contact Information
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                For questions about these Terms of Service, please contact us:
              </p>
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                background: '#f8f9fa'
              }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Email:</strong> legal@poolride.com</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Phone:</strong> +91 98765 43210</p>
                <p style={{ margin: 0 }}><strong>Address:</strong> PoolRide Legal Department, Bangalore, Karnataka, India 560001</p>
              </div>
            </section>

            {/* Agreement Acknowledgment */}
            <div style={{
              border: '2px solid #333',
              padding: '2rem',
              textAlign: 'center',
              marginTop: '2rem',
              background: '#f8f9fa'
            }}>
              <h3 style={{
                marginBottom: '1rem',
                fontSize: '1.4rem',
                color: '#333'
              }}>
                Agreement Acknowledgment
              </h3>
              <p style={{
                marginBottom: '0',
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#333'
              }}>
                By using PoolRide, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;