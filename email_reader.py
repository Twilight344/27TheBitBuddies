import imaplib
import email
from email.header import decode_header
import time
import json
import os
from classifier import classify_issue
from send_email import forward_issue_email

EMAIL = "darshil.sisodiya1@gmail.com"
PASSWORD = "zxmy rpag xxtl gicz"
IMAP_SERVER = "imap.gmail.com"
LAST_UID_FILE = "last_email_uid.txt"
AUDIT_FILE = "admin_pannel/email_audit.json"

# Timestamp to prevent old emails before script start
SCRIPT_START_TIME = time.time()

def get_last_seen_uid():
    if os.path.exists(LAST_UID_FILE):
        with open(LAST_UID_FILE, "r") as f:
            return f.read().strip()
    return None

def update_last_seen_uid(uid):
    with open(LAST_UID_FILE, "w") as f:
        f.write(str(uid))

def save_to_audit_log(issue_data):
    try:
        with open(AUDIT_FILE, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []

    # Generate a unique ID: issue_<number>_<source>
    issue_count = len(data) + 1
    source = issue_data.get("source", "email")
    issue_data["id"] = f"issue_{issue_count}_{source}"

    data.append(issue_data)
    with open(AUDIT_FILE, "w") as f:
        json.dump(data, f, indent=4)

def read_emails():
    last_uid = get_last_seen_uid()

    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(EMAIL, PASSWORD)
    mail.select("inbox")

    result, data = mail.uid("search", None, "ALL")
    if result != "OK":
        print("❌ Failed to fetch emails.")
        return

    email_uids = data[0].split()
    new_emails = []

    for uid in email_uids:
        uid_str = uid.decode()
        if last_uid and int(uid_str) <= int(last_uid):
            continue  # Already processed
        new_emails.append(uid_str)

    if not new_emails:
        print("📭 No new emails.")
        return

    for uid in new_emails:
        res, msg_data = mail.uid('fetch', uid, '(RFC822)')
        if res != 'OK':
            continue

        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)

        # Compare timestamp
        email_timestamp = email.utils.mktime_tz(email.utils.parsedate_tz(msg['Date']))
        if email_timestamp < SCRIPT_START_TIME:
            continue  # Skip older emails

        subject = decode_header(msg["Subject"])[0][0]
        if isinstance(subject, bytes):
            subject = subject.decode()
        from_ = msg.get("From")

        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain" and not part.get("Content-Disposition"):
                    body = part.get_payload(decode=True).decode(errors='ignore')
                    break
        else:
            body = msg.get_payload(decode=True).decode(errors='ignore')

        combined_text = f"{subject} {body}"
        category = classify_issue(combined_text)
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
        cat = category_emails[category]
        print(f"📩 Email from {from_} classified as {category}")

        issue = {
            "source": "email",
            "from": from_,
            "subject": subject,
            "body": body,
            "category": category,
            "email":cat
        }

        save_to_audit_log(issue)
        forward_issue_email(subject, body, category)
        update_last_seen_uid(uid)  # Store UID after successful processing

    mail.logout()

if __name__ == "__main__":
    while True:
        try:
            read_emails()
        except Exception as e:
            print(f"❌ Error reading emails: {e}")
        time.sleep(10)