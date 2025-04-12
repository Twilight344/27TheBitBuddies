# 27TheBitBuddies

# Query Routing System via Email and WhatsApp

This project is a centralized query management system that receives queries through *email* and *WhatsApp*, routes them to the appropriate departments, and logs all interactions for auditing purposes.
---
## 🚀 Features
- 📥 Receives emails using IMAP (via imaplib)
- 💬 Receives WhatsApp messages using Twilio API
- 📨 Routes messages to the appropriate department
- 📁 Stores all data in local JSON files
- 🧾 Audit dashboard for hosts/admins to view complete query history
- 🌐 Uses ngrok for tunneling local Flask app to public internet
---
## 🛠 Tech Stack

| Tool/Library   | Purpose                                 |
|----------------|-----------------------------------------|
| Python + Flask | Backend server and API endpoints        |
| IMAPLIB        | To read incoming emails                 |
| Twilio         | For WhatsApp integration                |
| Ngrok          | To expose localhost to the internet     |
| JSON           | Data storage (can be upgraded later)    |
| HTML/CSS/JS    | Audit dashboard and UI (optional)       |

---
## 🚀 To run the project 
`cd admin_pannel`
