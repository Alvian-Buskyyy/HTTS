const nodemailer = require('nodemailer');

// Konfigurasi transporter email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'halaltraceability@gmail.com', // Akan diset di .env
      pass: process.env.EMAIL_PASS || 'qmrd cpeg frpu zusi'     // App password Gmail
    }
  });
};

// Generate OTP 6 digit
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Kirim OTP ke email
const sendOTPEmail = async (recipientEmail, otp, transactionId, transactionType = 'Transaksi Penjualan') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@halal-traceability.com',
      to: recipientEmail,
      subject: `[HALAL TRACEABILITY] Kode OTP Verifikasi Transaksi`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🐄 HALAL TRACEABILITY</h1>
              <p style="color: #666; margin: 5px 0;">Sistem Ketertelusuran Halal</p>
            </div>
            
            <h2 style="color: #1f2937; text-align: center;">Kode OTP Verifikasi Transaksi</h2>
            
            <div style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #1e40af; font-weight: bold;">ID Transaksi:</p>
              <p style="margin: 5px 0; font-family: monospace; font-size: 14px; color: #374151;">${transactionId}</p>
              
              <p style="margin: 20px 0 10px; color: #1e40af; font-weight: bold;">Kode OTP Anda:</p>
              <div style="font-size: 36px; font-weight: bold; color: #1e40af; font-family: monospace; letter-spacing: 8px; margin: 10px 0;">
                ${otp}
              </div>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">Berlaku selama 10 menit</p>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Penting:</strong> Jangan bagikan kode OTP ini kepada siapa pun. 
                Admin tidak akan pernah meminta kode OTP melalui telepon atau chat.
              </p>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <h3 style="color: #374151; margin-top: 0;">Cara menggunakan OTP:</h3>
              <ol style="color: #6b7280; line-height: 1.6;">
                <li>Masukkan kode OTP di halaman verifikasi transaksi</li>
                <li>Kedua pihak (penjual dan pembeli) harus memasukkan kode yang sama</li>
                <li>Setelah verifikasi berhasil, transaksi akan tercatat di blockchain</li>
                <li>Kepemilikan sapi akan otomatis berpindah</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Email otomatis dari Sistem Halal Traceability<br>
                Mohon jangan membalas email ini
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Kirim notifikasi transaksi berhasil diverifikasi
const sendTransactionSuccessEmail = async (recipientEmail, transactionId, details = {}) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@halal-traceability.com',
      to: recipientEmail,
      subject: `[HALAL TRACEABILITY] Transaksi Berhasil Diverifikasi`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">✅ TRANSAKSI BERHASIL</h1>
              <p style="color: #666; margin: 5px 0;">HALAL TRACEABILITY SYSTEM</p>
            </div>
            
            <div style="background-color: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h2 style="color: #065f46; margin: 0 0 10px;">Transaksi Telah Diverifikasi</h2>
              <p style="margin: 0; color: #047857; font-family: monospace;">${transactionId}</p>
            </div>
            
            ${details.cid ? `
            <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;">
                <strong>🔗 Blockchain CID:</strong><br>
                <span style="font-family: monospace; font-size: 12px; word-break: break-all;">${details.cid}</span>
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Transaksi telah tercatat secara permanen di blockchain<br>
                Sistem Halal Traceability - ${new Date().toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Success notification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending success email:', error);
    return { success: false, error: error.message };
  }
};

// Kirim notifikasi transaksi dibatalkan
const sendTransactionCancelEmail = async (recipientEmail, transactionId, details = {}) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@halal-traceability.com',
      to: recipientEmail,
      subject: `[HALAL TRACEABILITY] Transaksi Dibatalkan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0;">⚠️ TRANSAKSI DIBATALKAN</h1>
              <p style="color: #666; margin: 5px 0;">HALAL TRACEABILITY SYSTEM</p>
            </div>
            
            <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h2 style="color: #991b1b; margin: 0 0 10px;">Transaksi Telah Dibatalkan</h2>
              <p style="margin: 0; color: #7f1d1d; font-family: monospace;">${transactionId}</p>
            </div>
            
            ${details.reason ? `
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Alasan:</strong> ${details.reason}
              </p>
            </div>
            ` : ''}
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;">
                <strong>ℹ️ Informasi:</strong><br>
                Transaksi dari ${details.penjualType || 'Penjual'} ke ${details.pembeliType || 'Pembeli'} telah dibatalkan.<br>
                Status kepemilikan sapi tetap pada pemilik semula.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Notifikasi pembatalan transaksi<br>
                Sistem Halal Traceability - ${new Date().toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Cancellation notification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendTransactionSuccessEmail,
  sendTransactionCancelEmail
};
