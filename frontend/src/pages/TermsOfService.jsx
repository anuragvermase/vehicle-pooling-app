import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fab1a0 0%, #e17055 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#e17055', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Terms of Service</h1>
          <p style={{ fontSize: '1rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            Last updated: January 2024
          </p>

          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
              <p style={{ marginBottom: '1rem' }}>
                By accessing or using PoolRide, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                If you do not agree with any of these terms, you are prohibited from using our services.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>2. Description of Service</h2>
              <p style={{ marginBottom: '1rem' }}>
                PoolRide is a ride-sharing platform that connects drivers and passengers traveling in similar directions. 
                We facilitate connections but are not a transportation company.
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>We provide a platform for ride coordination</li>
                <li>Users arrange their own transportation</li>
                <li>We do not employ drivers or own vehicles</li>
                <li>All rides are arranged between independent users</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>3. User Responsibilities</h2>
              <p style={{ marginBottom: '1rem' }}>As a user of PoolRide, you agree to:</p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Respect other users and follow community guidelines</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Use the service only for legitimate ride-sharing purposes</li>
                <li>Not engage in any fraudulent or harmful activities</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>4. Driver Requirements</h2>
              <p style={{ marginBottom: '1rem' }}>Drivers must meet the following requirements:</p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Valid driver's license</li>
                <li>Vehicle insurance and registration</li>
                <li>Pass background verification checks</li>
                <li>Maintain vehicle safety standards</li>
                <li>Follow all traffic laws and regulations</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>5. Payment Terms</h2>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Passengers pay the agreed fare for rides</li>
                <li>PoolRide may charge service fees</li>
                <li>Payments are processed through secure third-party providers</li>
                <li>Refunds are subject to our cancellation policy</li>
                <li>All fees are clearly displayed before booking</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>6. Cancellation Policy</h2>
              <p style={{ marginBottom: '1rem' }}>
                Users may cancel rides according to the following policy:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Free cancellation up to 2 hours before departure</li>
                <li>Cancellations within 2 hours may incur fees</li>
                <li>No-shows may result in full charge</li>
                <li>Emergency cancellations are handled case-by-case</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>7. Safety and Liability</h2>
              <p style={{ marginBottom: '1rem' }}>
                While we provide safety features, users participate at their own risk:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>PoolRide is not liable for accidents or incidents during rides</li>
                <li>Users are responsible for their own safety</li>
                <li>Report safety concerns immediately</li>
                <li>Drivers must maintain appropriate insurance coverage</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>8. Prohibited Conduct</h2>
              <p style={{ marginBottom: '1rem' }}>The following activities are strictly prohibited:</p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Harassment or discrimination of any kind</li>
                <li>Fraudulent activities or misrepresentation</li>
                <li>Using the platform for illegal purposes</li>
                <li>Interfering with the operation of the service</li>
                <li>Violating intellectual property rights</li>
              </ul>
            </section>

                        <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>9. Account Termination</h2>
              <p style={{ marginBottom: '1rem' }}>
                We reserve the right to terminate or suspend accounts for violations of these terms:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Immediate termination for serious violations</li>
                <li>Warning system for minor infractions</li>
                <li>Users may delete their accounts at any time</li>
                <li>Data retention according to our privacy policy</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>10. Intellectual Property</h2>
              <p style={{ marginBottom: '1rem' }}>
                All content and technology on PoolRide is our property or licensed to us:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>PoolRide trademark and logo are protected</li>
                <li>App design and functionality are proprietary</li>
                <li>Users retain rights to their personal content</li>
                <li>Respect third-party intellectual property rights</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>11. Disclaimers</h2>
              <p style={{ marginBottom: '1rem' }}>
                PoolRide is provided "as is" without warranties of any kind:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>No guarantee of service availability</li>
                <li>No warranty of ride availability or quality</li>
                <li>Users assume responsibility for ride decisions</li>
                <li>Technology may have occasional interruptions</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>12. Limitation of Liability</h2>
              <p style={{ marginBottom: '1rem' }}>
                Our liability is limited to the maximum extent permitted by law:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>Not liable for indirect or consequential damages</li>
                <li>Maximum liability limited to service fees paid</li>
                <li>No liability for user-to-user interactions</li>
                <li>Force majeure events are excluded</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>13. Dispute Resolution</h2>
              <p style={{ marginBottom: '1rem' }}>
                Disputes will be resolved through the following process:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>First attempt resolution through customer support</li>
                <li>Mediation for unresolved issues</li>
                <li>Arbitration as final binding resolution</li>
                <li>Jurisdiction: Bangalore, Karnataka, India</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>14. Changes to Terms</h2>
              <p style={{ marginBottom: '1rem' }}>
                We may update these terms from time to time. Material changes will be communicated through:
              </p>
              <ul style={{ paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li>In-app notifications</li>
                <li>Email notifications to registered users</li>
                <li>Website announcements</li>
                <li>Continued use constitutes acceptance of new terms</li>
              </ul>
            </section>

            <section>
              <h2 style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>15. Contact Information</h2>
              <p style={{ marginBottom: '1rem' }}>
                For questions about these Terms of Service, please contact us:
              </p>
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px' }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> legal@poolride.com</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Phone:</strong> +91 98765 43210</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Address:</strong> PoolRide Legal Department</p>
                <p style={{ margin: '0.5rem 0' }}>Bangalore, Karnataka, India 560001</p>
              </div>
            </section>

            <div style={{ background: 'linear-gradient(135deg, #e17055, #fab1a0)', padding: '2rem', borderRadius: '15px', marginTop: '3rem', textAlign: 'center', color: 'white' }}>
              <h3 style={{ marginBottom: '1rem' }}>Agreement Acknowledgment</h3>
              <p style={{ marginBottom: '0', opacity: 0.9 }}>
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