from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from classifier import classify_issue
from send_email import forward_issue_email
import json
import os
from datetime import datetime

app = Flask(__name__)
AUDIT_FILE = "admin_pannel/whatsapp_audit.json"

def save_to_audit_log(entry):
    try:
        with open(AUDIT_FILE, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []

    # Generate unique ID: "issue_<number>_whatsapp"
    whatsapp_count = sum(1 for item in data if item.get("source") == "whatsapp") + 1
    entry["id"] = f"issue_{whatsapp_count}_whatsapp"

    data.append(entry)
    with open(AUDIT_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    incoming_msg = request.values.get("Body", "").strip()
    from_number = request.values.get("From", "")

    category = classify_issue(incoming_msg)

    log_entry = {
        
        "source": "whatsapp",
        "from": from_number,
        "body": incoming_msg,
        "category": category,
        "timestamp": datetime.now().isoformat()
    }
    save_to_audit_log(log_entry)

    resp = MessagingResponse()
    reply = f"✅ Your issue has been classified as: *{category}*.\nWe will get back to you shortly."
    resp.message(reply)
    return str(resp)

if __name__ == "__main__":
    app.run(debug=True, port=5001)