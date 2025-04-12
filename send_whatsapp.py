# from flask import Flask, render_template, request, redirect, url_for, session, jsonify
# import json
# import os
# from datetime import datetime

# app = Flask(__name__)
# app.secret_key = 'supersecretkey'

# ADMIN_CREDENTIALS = {"emp123": "password"}
# EMAIL_AUDIT_FILE = os.path.join(os.path.dirname(__file__), 'email_audit.json')
# WHATSAPP_AUDIT_FILE = os.path.join(os.path.dirname(__file__), 'whatsapp_audit.json')

# def ensure_audit_file(file_path):
#     if not os.path.exists(file_path):
#         print(f"Creating file: {file_path}")
#         with open(file_path, 'w') as f:
#             json.dump([], f)

# def normalize_issue(issue, source):
#     return {
#         'id': issue.get('id', f"issue_{int(datetime.now().timestamp() * 1000)}_{source}"),
#         'source': source,
#         'from': issue.get('from', 'Unknown'),
#         'subject': issue.get('subject', 'N/A' if source == 'email' else 'WhatsApp Message'),
#         'body': issue.get('body', 'N/A'),
#         'category': issue.get('category', 'Uncategorized'),
#         'timestamp': issue.get('date', issue.get('timestamp', datetime.now().isoformat())),
#         'status': issue.get('status', 'pending'),
#         'resolved_by': issue.get('resolved_by', None),
#         'resolved_at': issue.get('resolved_at', None)
#     }

# @app.route('/')
# def home():
#     if 'logged_in' in session:
#         return redirect(url_for('dashboard'))
#     return redirect(url_for('login'))

# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         emp_id = request.form['emp_id']
#         password = request.form['password']
#         if emp_id in ADMIN_CREDENTIALS and ADMIN_CREDENTIALS[emp_id] == password:
#             session['logged_in'] = True
#             session['emp_id'] = emp_id
#             return redirect(url_for('dashboard'))
#         return render_template('login.html', error="Invalid employee ID or password")
#     return render_template('login.html')

# @app.route('/dashboard')
# def dashboard():
#     if 'logged_in' not in session:
#         return redirect(url_for('login'))
#     return render_template('dashboard.html')

# @app.route('/logout')
# def logout():
#     session.clear()
#     return redirect(url_for('login'))

# @app.route('/api/issues', methods=['GET'])
# def get_issues():
#     if 'logged_in' not in session:
#         return jsonify({"error": "Unauthorized"}), 401
    
#     ensure_audit_file(EMAIL_AUDIT_FILE)
#     ensure_audit_file(WHATSAPP_AUDIT_FILE)
    
#     email_issues = []
#     whatsapp_issues = []
    
#     try:
#         with open(EMAIL_AUDIT_FILE, 'r') as f:
#             email_issues = [normalize_issue(issue, 'email') for issue in json.load(f)]
#         print(f"Loaded email issues: {len(email_issues)} entries")
#     except Exception as e:
#         print(f"Error loading email_audit.json: {e}")
    
#     try:
#         with open(WHATSAPP_AUDIT_FILE, 'r') as f:
#             whatsapp_issues = [normalize_issue(issue, 'whatsapp') for issue in json.load(f)]
#         print(f"Loaded whatsapp issues: {len(whatsapp_issues)} entries")
#     except Exception as e:
#         print(f"Error loading whatsapp_audit.json: {e}")
    
#     all_issues = email_issues + whatsapp_issues
#     all_issues.sort(key=lambda x: x['timestamp'], reverse=True)
#     print(f"Sending API response: {len(all_issues)} total issues")
#     return jsonify(all_issues)

# @app.route('/api/issues/<issue_id>/resolve', methods=['POST'])
# def resolve_issue(issue_id):
#     if 'logged_in' not in session:
#         return jsonify({"error": "Unauthorized"}), 401

#     for file_path, source in [(EMAIL_AUDIT_FILE, 'email'), (WHATSAPP_AUDIT_FILE, 'whatsapp')]:
#         ensure_audit_file(file_path)
#         try:
#             with open(file_path, 'r') as f:
#                 issues = [normalize_issue(issue, source) for issue in json.load(f)]
#             for issue in issues:
#                 if issue['id'] == issue_id:
#                     issue['status'] = 'resolved'
#                     issue['resolved_by'] = session['emp_id']
#                     issue['resolved_at'] = datetime.now().isoformat()
#                     with open(file_path, 'w') as f:
#                         json.dump(issues, f, indent=4)  # Keep all issues, just mark resolved
#                     print(f"Resolved issue {issue_id} in {file_path}")
#                     return jsonify({"success": True})
#         except Exception as e:
#             print(f"Error resolving issue in {file_path}: {e}")
#     return jsonify({"error": "Issue not found"}), 404

# @app.route('/analytics')
# def analytics():
#     if 'logged_in' not in session:
#         return redirect(url_for('login'))
#     print("Rendering analytics page")  # Add logging to confirm route is hit
#     try:
#         return render_template('analytics.html')
#     except Exception as e:
#         print(f"Error rendering analytics.html: {e}")
#         return "Error loading analytics page", 500

# @app.route('/api/issues/<issue_id>/delete', methods=['DELETE'])
# def delete_issue(issue_id):
#     if 'logged_in' not in session:
#         return jsonify({"error": "Unauthorized"}), 401

#     for file_path, source in [(EMAIL_AUDIT_FILE, 'email'), (WHATSAPP_AUDIT_FILE, 'whatsapp')]:
#         ensure_audit_file(file_path)
#         try:
#             with open(file_path, 'r') as f:
#                 issues = [normalize_issue(issue, source) for issue in json.load(f)]
#             for i, issue in enumerate(issues):
#                 if issue['id'] == issue_id:
#                     del issues[i]
#                     with open(file_path, 'w') as f:
#                         json.dump(issues, f, indent=4)
#                     print(f"Deleted issue {issue_id} from {file_path}")
#                     return jsonify({"success": True})
#         except Exception as e:
#             print(f"Error deleting issue in {file_path}: {e}")
#     return jsonify({"error": "Issue not found"}), 404

# if __name__ == '__main__':
#     app.run(debug=True)