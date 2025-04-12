import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL = "darshil.sisodiya1@gmail.com"
PASSWORD = "zxmy rpag xxtl gicz"


category_emails = {
    "Payment Issue": "darshil.sisodiya@gmail.com",
    "Login Problem": "rdpuneeth57@gamil.com",
    "Account Management": "dpunith5731@gmail.com",
    "Technical Glitch": "parzival5731@gmail.com",
    "Order Related": "darshilsisodiya6@gmail.com",
    "Access & Permissions": "monicaalot@gmail.com",
    "Product Inquiry": "darshil.sisodiya0@gmail.com",
    "Feedback & Suggestions": "lilyy5927@gmail.com",
    "Complaint": "vinutha.h.vinutha.h@gmail.com",
    "Billing Issue": "yooformee@gmail.com"
}

def forward_issue_email(subject, body, category):
    to_email = category_emails.get(category, "darshil.sisodiya@gmail.com")

    msg = MIMEMultipart()
    msg['From'] = EMAIL
    msg['To'] = to_email
    msg['Subject'] = f"[Forwarded Issue] {subject}"

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"✅ Forwarded to {to_email}")
    except Exception as e:
        print(f"❌ Email sending failed: {e}")

