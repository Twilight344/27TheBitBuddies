def classify_issue(text):
    text = text.lower()


    categories = {
        "Payment Issue": [
            "payment", "charged", "billing", "invoice", "refund", "transaction", "failed", "deducted",
            "overcharged", "undercharged", "fees", "late fee", "auto-debit", "unauthorized", "receipt",
            "credit", "debit", "cash", "EMI", "bank", "transfer", "gateway", "processing", "UPI", "wallet",
            "pay", "paying", "charged twice", "not credited", "money not received", "settlement", "pending",
            "gateway error", "amount", "statement", "chargeback", "dispute", "reversal", "limit", "payment error",
            "card declined", "netbanking", "deposit", "recharge", "wallet balance", "expired card", "invalid CVV"
        ],
        "Login Problem": [
            "login", "signin", "sign in", "sign in failed", "password", "forgot password", "reset", "authentication",
            "credentials", "OTP", "2FA", "code not received", "username", "email login", "security question", "locked out",
            "access denied", "can't login", "verification failed", "login failed", "password expired", "wrong password",
            "account locked", "blocked", "authorization error", "signout", "auto logout", "password mismatch", "token expired"
        ],
        "Account Management": [
            "account", "profile", "update", "change", "edit", "settings", "delete account", "close account", "register",
            "signup", "subscription", "unsubscribed", "preference", "profile photo", "personal info", "contact info", "DOB",
            "gender", "language", "timezone", "name update", "email update", "phone number", "notifications", "edit info",
            "account recovery", "merge accounts", "switch account", "alias", "privacy settings", "backup email"
        ],
        "Technical Glitch": [
            "bug", "error", "crash", "not working", "issue", "problem", "slow", "hang", "freeze", "lag", "glitch", "freeze",
            "app not loading", "screen stuck", "loading forever", "timeout", "404", "500 error", "unexpected error",
            "function not working", "login loop", "UI issue", "unresponsive", "crashes", "timeout error", "network error",
            "update bug", "infinite loop", "app stopped", "blank screen", "data not syncing", "stuck", "freeze", "fail"
        ],
        "Order Related": [
            "order", "delivery", "shipping", "tracking", "package", "cancel", "late delivery", "wrong item", "return", "replace",
            "received damaged", "order ID", "ETA", "shipment", "tracking number", "lost package", "courier", "reschedule",
            "item missing", "not delivered", "reorder", "delay", "dispatch", "fulfillment", "delayed", "partial order",
            "return policy", "cancelled automatically", "package not found", "logistics", "no updates"
        ],
        "Access & Permissions": [
            "permission", "access", "restricted", "blocked", "authorization", "admin rights", "read only", "locked feature",
            "not allowed", "role", "disabled", "cannot access", "privilege", "missing access", "access request",
            "no permission", "role-based", "insufficient rights", "need admin", "access denied", "user role", "grant access",
            "visibility issue", "unauthorized access", "permission denied", "request access", "policy restriction"
        ],
        "Product Inquiry": [
            "product", "item", "availability", "details", "info", "description", "features", "specs", "specifications", "model",
            "price", "discount", "offer", "promotion", "color", "size", "capacity", "warranty", "compare", "difference",
            "manual", "how it works", "guide", "setup", "box content", "usage", "material", "quality", "details required",
            "config", "version", "requirements", "system requirements"
        ],
        "Feedback & Suggestions": [
            "feedback", "suggestion", "recommend", "improve", "like", "dislike", "feature request", "enhancement", "idea",
            "better", "opinion", "input", "thoughts", "appreciate", "wish", "user experience", "UX", "interface", "love",
            "nice", "polish", "refinement", "design feedback", "performance improvement", "optional", "more options", "customize"
        ],
        "Complaint": [
            "complaint", "unhappy", "bad", "worst", "angry", "frustrated", "terrible", "horrible", "worried", "rude", "not acceptable",
            "hate", "disappointed", "annoyed", "poor", "disgusted", "unsatisfied", "irritated", "livid", "no help", "ignored", "scam",
            "cheated", "waste", "delay", "bad experience", "zero support", "not helpful", "injustice", "ridiculous", "careless", "lousy"
        ],
            "Billing Issue": [
            "invoice", "bill", "charged wrongly", "wrong amount", "overbilled", "underbilled", "tax error",
            "invoice not received", "bill mismatch", "GST", "billing cycle", "late fee", "duplicate bill",
            "billing query", "monthly charges", "unexpected charge", "hidden fees", "unauthorized billing",
            "discount not applied", "plan charges", "billed extra", "wrong calculation", "auto billing",
            "payment confirmation", "invalid invoice", "past due", "due amount", "incorrect tax", "mischarged",
            "receipt issue", "unbilled usage", "outstanding balance", "service charge", "invoice overdue",
            "bill not generated", "amount discrepancy", "charged extra", "multiple charges", "monthly bill"
        ],
        "Other": []
    }
    for category, keywords in categories.items():
        if any(word in text for word in keywords):
            return category
    return "General Inquiry"