const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CRITICAL: CORS must be before routes
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname), { index: false }));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'start.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/features', (req, res) => {
  res.sendFile(path.join(__dirname, 'features.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/start', (req, res) => {
  res.sendFile(path.join(__dirname, 'start.html'));
});

app.get('/pages', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages-index.html'));
});

app.get('/sitemap', (req, res) => {
  res.sendFile(path.join(__dirname, 'sitemap.html'));
});

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'jb1270628@gmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Contact form endpoint
app.post('/api/send-contact', async (req, res) => {
  try {
    console.log('\n📨 New contact form submission received');
    console.log('Request body:', req.body);

    const { from_name, from_email, phone, hospital, subject, message } = req.body;

    // Validate form data
    if (!from_name || !from_email || !subject || !message) {
      console.warn('⚠️ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: name, email, subject, and message are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      console.warn('⚠️ Validation failed: Invalid email format');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Create professional HTML email
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #17a2b8, #0d9488); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #17a2b8; }
        .label { font-weight: bold; color: #17a2b8; }
        .footer { background: #f0f0f0; padding: 15px; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>
 New Contact Form Submission - Sanjivani</h2>
        </div>
        
        <div class="content">
            <div class="field">
                <span class="label">Name:</span><br>
                ${from_name}
            </div>
            
            <div class="field">
                <span class="label">Email:</span><br>
                <a href="mailto:${from_email}">${from_email}</a>
            </div>
            
            ${phone ? `<div class="field">
                <span class="label">Phone:</span><br>
                ${phone}
            </div>` : ''}
            
            ${hospital ? `<div class="field">
                <span class="label">Hospital/Organization:</span><br>
                ${hospital}
            </div>` : ''}
            
            <div class="field">
                <span class="label">Subject:</span><br>
                ${subject}
            </div>
            
            <div class="field">
                <span class="label">Message:</span><br>
                ${message.replace(/\n/g, '<br>')}
            </div>
        </div>
        
        <div class="footer">
            <p>Email sent from Sanjivani Contact Form</p>
            <p>Reply directly to this email to contact the sender</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'jb1270628@gmail.com',
      to: 'jb1270628@gmail.com',
      replyTo: from_email,
      subject: `[Sanjivani] ${subject} - from ${from_name}`,
      html: emailContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
    console.log('Message ID:', info.messageId);

    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully. We will contact you within 24 hours.',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error in /api/send-contact:', error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to send email. Please try again or contact support directly.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 404 handler - try to serve HTML files
app.use((req, res) => {
  // Try to serve HTML file if path doesn't have an extension
  if (!req.path.includes('.')) {
    const filePath = path.join(__dirname, `${req.path}.html`);
    try {
      res.sendFile(filePath);
      return;
    } catch (err) {
      // File doesn't exist, continue to 404
    }
  }
  
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Sanjivani Backend Server Started`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER || 'jb1270628@gmail.com'}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  console.log(`${'='.repeat(60)}\n`);
});
