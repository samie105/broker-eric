import nodemailer from "nodemailer"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const emailDataString = formData.get("emailData")
    const emailData = JSON.parse(emailDataString)

    // Handle file attachments
    const attachments = []
    const attachmentFiles = []

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("attachment_") && value instanceof File) {
        const file = value
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Save file temporarily (in production, use cloud storage)
        const filename = `${Date.now()}-${file.name}`
        const filepath = path.join(process.cwd(), "tmp", filename)
        await writeFile(filepath, buffer)

        attachments.push({
          filename: file.name,
          path: filepath,
          contentType: file.type,
        })

        attachmentFiles.push(filepath)
      }
    }

    await sendEmail({ ...emailData, attachments })

    // Clean up temporary files
    // In production, implement proper cleanup

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}

async function sendEmail(emailData) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ericastacy52@gmail.com",
      pass: "yiay aadh pupe bdgc",
    },
  })

  const emailTemplate = generateEmailTemplate(emailData)

  // Process attachments
  const attachments =
    emailData.attachments?.map((attachment) => {
      // If it's a Cloudinary attachment
      if (typeof attachment === "object" && attachment.url) {
        return {
          filename: attachment.name,
          path: attachment.url,
          contentType: attachment.type,
        }
      }
      // If it's a file path (from previous implementation)
      return attachment
    }) || []

  await transporter.sendMail({
    from: `${emailData.sendingAs} <support@thekapitalnexus.com>`,
    to: emailData.recipientEmail,
    subject: emailData.subject,
    html: emailTemplate,
    attachments: attachments,
  })
}

function generateEmailTemplate(emailData) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailData.subject}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        
        .email-wrapper {
            background-color: #f8fafc;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            letter-spacing: -0.5px;
        }
        
        .email-header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
            letter-spacing: 0.5px;
        }
        
        .email-body {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        
        .greeting {
            font-size: 20px;
            color: #1e293b;
            margin-bottom: 24px;
            font-weight: 600;
        }
        
        .content {
            font-size: 16px;
            line-height: 1.8;
            color: #334155;
        }
        
        .content p {
            margin-bottom: 16px;
        }
        
        .content h1, .content h2, .content h3 {
            color: #1e293b;
            margin: 28px 0 16px 0;
            font-weight: 600;
            line-height: 1.3;
        }
        
        .content h1 { font-size: 24px; }
        .content h2 { font-size: 20px; }
        .content h3 { font-size: 18px; }
        
        .content ul, .content ol {
            margin: 16px 0;
            padding-left: 24px;
        }
        
        .content li {
            margin-bottom: 8px;
        }
        
        .content blockquote {
            border-left: 4px solid #6366f1;
            padding: 12px 20px;
            margin: 24px 0;
            background-color: #f8fafc;
            border-radius: 0 4px 4px 0;
        }
        
        .content blockquote p {
            font-style: italic;
            color: #475569;
            margin: 0;
        }
        
        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            font-size: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .content table thead {
            background-color: #f1f5f9;
        }
        
        .content table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            border: 1px solid #e2e8f0;
        }
        
        .content table td {
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            color: #334155;
        }
        
        .content table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        .content a {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1px solid rgba(79, 70, 229, 0.2);
            transition: border-color 0.2s;
        }
        
        .content a:hover {
            border-color: rgba(79, 70, 229, 0.6);
        }
        
        .content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .signature {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        .signature-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 16px;
        }
        
        .signature-title {
            color: #64748b;
            font-size: 14px;
        }
        
        .email-footer {
            background-color: #f1f5f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-logo {
            margin-bottom: 16px;
        }
        
        .footer-logo img {
            height: 40px;
            width: auto;
        }
        
        .footer-content {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .company-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 16px;
            margin-bottom: 8px;
            display: block;
        }
        
        .footer-links {
            margin-top: 20px;
        }
        
        .footer-links a {
            display: inline-block;
            margin: 0 8px;
            color: #4f46e5;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #4f46e5;
            text-decoration: none;
        }
        
        .copyright {
            margin-top: 20px;
            font-size: 12px;
            color: #94a3b8;
        }
        
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .email-container {
                border-radius: 4px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .greeting {
                font-size: 18px;
            }
            
            .content {
                font-size: 15px;
            }
            
            .email-footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="email-header">
                <h1>${emailData.subject}</h1>
                <div class="subtitle">From ${emailData.sendingAs}</div>
            </div>
            
            <div class="email-body">
                ${emailData.recipientName ? `<div class="greeting">Hello ${emailData.recipientName},</div>` : ""}
                
                <div class="content">
                    ${emailData.content}
                </div>
                
                <div class="signature">
                    <p>Best regards,</p>
                    <p class="signature-name">${emailData.sendingAs}</p>
                    <p class="signature-title">Capital Nexus</p>
                </div>
            </div>
            
            <div class="email-footer">
                <div class="footer-logo">
                    <!-- You can add your logo here -->
                    <strong class="company-name">Capital Nexus</strong>
                </div>
                
                <div class="footer-content">
                    This email was sent from our professional email service.
                </div>
                
                <div class="footer-links">
                    <a href="https://thekapitalnexus.com">Website</a> |
                    <a href="https://thekapitalnexus.com/support">Support</a> |
                    <a href="https://thekapitalnexus.com/contact">Contact</a>
                </div>
                
                <div class="copyright">
                    &copy; ${new Date().getFullYear()} Capital Nexus. All rights reserved.
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
}
