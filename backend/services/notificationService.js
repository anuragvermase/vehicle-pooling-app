import admin from 'firebase-admin';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Nodemailer
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendPushNotification = async (userId, notification) => {
  try {
    // Get user's FCM tokens from database
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      logger.warn(`No FCM tokens found for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png'
      },
      data: {
        type: notification.type || 'general',
        action: notification.action || '',
        ...notification.data
      },
      tokens: user.fcmTokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    // Remove invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(user.fcmTokens[idx]);
        }
      });
      
      // Remove failed tokens from user record
      user.fcmTokens = user.fcmTokens.filter(token => !failedTokens.includes(token));
      await user.save();
    }

    logger.info(`Push notification sent to user ${userId}: ${response.successCount} successful, ${response.failureCount} failed`);
    
    return response;
  } catch (error) {
    logger.error('Send push notification error:', error);
    throw error;
  }
};

export const sendSMS = async (phoneNumber, message) => {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    logger.info(`SMS sent to ${phoneNumber}: ${result.sid}`);
    return result;
  } catch (error) {
    logger.error('Send SMS error:', error);
    throw error;
  }
};

export const sendEmail = async (to, subject, htmlContent, textContent) => {
  try {
    const mailOptions = {
      from: `"RideShare Pro" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent
    };

    const result = await emailTransporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error('Send email error:', error);
    throw error;
  }
};

export const sendRideBookingNotification = async (driverId, bookingDetails) => {
  try {
    const driver = await User.findById(driverId);
    if (!driver) return;

    // Push notification
    if (driver.preferences.notifications.push) {
      await sendPushNotification(driverId, {
        title: 'New Ride Booking! 🎉',
        body: `${bookingDetails.passengerName} booked ${bookingDetails.seatsBooked} seat(s) for your ride from ${bookingDetails.from} to ${bookingDetails.to}`,
        type: 'booking',
        data: {
          bookingId: bookingDetails.bookingId,
          rideId: bookingDetails.rideId
        }
      });
    }

    // SMS notification
    if (driver.preferences.notifications.sms) {
      const smsMessage = `New booking! ${bookingDetails.passengerName} booked your ride from ${bookingDetails.from} to ${bookingDetails.to}. Total: ₹${bookingDetails.totalAmount}. Check your app for details.`;
      await sendSMS(driver.phone, smsMessage);
    }

    // Email notification
    if (driver.preferences.notifications.email) {
      const emailSubject = 'New Ride Booking - RideShare Pro';
      const emailHtml = `
        <h2>New Ride Booking!</h2>
        <p>Great news! You have a new booking for your ride.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Passenger:</strong> ${bookingDetails.passengerName}</p>
          <p><strong>Route:</strong> ${bookingDetails.from} → ${bookingDetails.to}</p>
          <p><strong>Seats:</strong> ${bookingDetails.seatsBooked}</p>
          <p><strong>Amount:</strong> ₹${bookingDetails.totalAmount}</p>
          <p><strong>Date:</strong> ${new Date(bookingDetails.departureTime).toLocaleDateString()}</p>
        </div>
        <p>Please check your app for more details and passenger contact information.</p>
        <p>Happy riding!</p>
      `;
      
      await sendEmail(driver.email, emailSubject, emailHtml);
    }
  } catch (error) {
    logger.error('Send ride booking notification error:', error);
  }
};

export const sendRideCancellationNotification = async (userId, cancellationDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Push notification
    await sendPushNotification(userId, {
      title: 'Ride Cancelled ⚠',
      body: `Your ride from ${cancellationDetails.from} to ${cancellationDetails.to} has been cancelled. ${cancellationDetails.refundAmount > 0 ? `Refund of ₹${cancellationDetails.refundAmount} will be processed.` : ''}`,
      type: 'cancellation',
      data: {
        rideId: cancellationDetails.rideId,
        bookingId: cancellationDetails.bookingId
      }
    });

    // SMS for important cancellations
    if (cancellationDetails.refundAmount > 0) {
      const smsMessage = `Your ride has been cancelled. Refund of ₹${cancellationDetails.refundAmount} will be processed within 3-5 business days.`;
      await sendSMS(user.phone, smsMessage);
    }
  } catch (error) {
    logger.error('Send ride cancellation notification error:', error);
  }
};

export const sendPaymentNotification = async (userId, paymentDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const isPaymentReceived = paymentDetails.type === 'received';
    
    await sendPushNotification(userId, {
      title: isPaymentReceived ? 'Payment Received! 💰' : 'Payment Successful! ✅',
      body: isPaymentReceived 
        ? `You received ₹${paymentDetails.amount} from ${paymentDetails.fromUser}`
        : `Payment of ₹${paymentDetails.amount} was successful`,
      type: 'payment',
      data: {
        paymentId: paymentDetails.paymentId,
        amount: paymentDetails.amount
      }
    });
  } catch (error) {
    logger.error('Send payment notification error:', error);
  }
};

export const sendEmergencyAlert = async (emergencyDetails) => {
  try {
    // Send to emergency contacts
    for (const contact of emergencyDetails.emergencyContacts) {
      const smsMessage = `EMERGENCY ALERT: ${emergencyDetails.userName} has triggered an emergency alert. Location: ${emergencyDetails.location.address}. Please contact them immediately or call emergency services.`;
      await sendSMS(contact.phone, smsMessage);
    }

    // Send to ride participants
    if (emergencyDetails.rideParticipants) {
      for (const participant of emergencyDetails.rideParticipants) {
        await sendPushNotification(participant.userId, {
          title: 'Emergency Alert! 🚨',
          body: `${emergencyDetails.userName} has triggered an emergency alert in your ride.`,
          type: 'emergency',
          data: {
            emergencyId: emergencyDetails.emergencyId,
            rideId: emergencyDetails.rideId
          }
        });
      }
    }

    logger.warn(`Emergency alert sent for user ${emergencyDetails.userId}`);
  } catch (error) {
    logger.error('Send emergency alert error:', error);
  }
};

export const sendRideReminder = async (userId, rideDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.preferences.notifications.push) return;

    await sendPushNotification(userId, {
      title: 'Ride Reminder 🚗',
      body: `Your ride from ${rideDetails.from} to ${rideDetails.to} starts in 30 minutes.`,
      type: 'reminder',
      data: {
        rideId: rideDetails.rideId,
        bookingId: rideDetails.bookingId
      }
    });
  } catch (error) {
    logger.error('Send ride reminder error:', error);
  }
};