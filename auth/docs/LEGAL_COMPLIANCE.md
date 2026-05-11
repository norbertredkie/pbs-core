# Legal Compliance Guide

Privacy, GDPR, CCPA, COPPA, and more

## Overview

PBS products must comply with multiple data protection regulations:

| Regulation | Scope | Key Requirements |
|-----------|-------|------------------|
| **GDPR** | EU/EEA users | Consent, privacy, right to erasure |
| **CCPA** | California residents | Data access, deletion, opt-out |
| **COPPA** | Users <13 | Parental consent, limited collection |
| **LGPD** | Brazil | Similar to GDPR |
| **DPA** | Digital Services Act (EU) | Content moderation, transparency |

## GDPR Compliance

### 1. Legal Basis

We collect data under these legal bases:

- **Contract**: Necessary to provide the service
- **Consent**: You explicitly agreed to terms
- **Legitimate Interest**: Improve product, prevent fraud
- **Legal Obligation**: Tax compliance, law enforcement

### 2. Consent Management

**Signup Flow:**
1. User sees privacy policy before signup
2. User accepts Terms + Privacy Policy + Safety Policy
3. We store acceptance timestamp and IP address
4. User can withdraw consent anytime

**Implementation:**

```python
# In auth/models.py
class UserConsent(BaseModel):
    privacy_policy_accepted: bool
    privacy_policy_timestamp: datetime
    terms_accepted: bool
    terms_timestamp: datetime
    safety_policy_accepted: bool
    safety_policy_timestamp: datetime
    can_contact: bool  # Marketing emails
```

### 3. Data Subject Rights

#### Right to Access (Article 15)
Users can download their data

```
GET /auth/me/data-export
Headers: Authorization: Bearer <token>
Response: JSON with all user data
```

#### Right to Rectification (Article 16)
Users can correct their data

```
PUT /auth/me
Body: {name, avatar_url}
```

#### Right to Erasure (Article 17)
Users can request deletion

```
POST /auth/delete-account
Headers: Authorization: Bearer <token>
```

**Process:**
1. Account marked as deleted (soft delete)
2. Data deleted 30 days later (recovery window)
3. Permanent deletion after 30 days
4. Sends webhook event: `user.deleted`

#### Right to Restrict (Article 18)
Users can restrict data processing

```
PUT /auth/me/restrictions
Body: {restrict_marketing: true}
```

#### Right to Portability (Article 20)
Users can export data in portable format

```
GET /auth/me/export
Query: format=json|csv
Response: Portable user data
```

#### Right to Object (Article 21)
Users can opt-out of processing

```
PUT /auth/me/preferences
Body: {marketing_emails: false}
```

### 4. Data Processing Agreement (DPA)

Required for data processors. Include in business contracts:

**Template:**
```
Data Processing Agreement (DPA)

Date: [DATE]
Processor: PBS Inc.
Client: [YOUR COMPANY]

1. Data Processing Scope
   - Personal data: email, name, profile data
   - Purposes: service delivery, analytics
   - Duration: while account active + 30 days

2. Processor Obligations
   - Process data only per client instructions
   - Implement security measures (TLS, AES)
   - Ensure staff confidentiality
   - Notify client of data breaches within 24h
   - Delete data upon termination

3. Sub-processors
   - Google Cloud (hosting)
   - Supabase (database)
   - Veriff (age verification)

4. Security Measures
   - Encryption in transit and rest
   - Access controls (role-based)
   - Audit logging
   - Regular security assessments

5. Data Breach Response
   - Client notified within 24 hours
   - Incident investigation
   - Regulatory notification (if required)
   - Post-incident review
```

### 5. Privacy Impact Assessment (DPIA)

For high-risk processing, conduct a DPIA:

```markdown
# Data Protection Impact Assessment (DPIA)

## 1. Description of Processing
- Collect user email, name, OAuth provider ID
- Store in encrypted database
- Retain for 30 days after deletion

## 2. Necessity & Proportionality
- Necessary to provide authentication service
- Collect only what's needed
- Proportional to service value

## 3. Risk Assessment
- **Unauthorized access**: Encrypted storage, TLS
- **Data loss**: Daily backups, disaster recovery
- **Unauthorized sharing**: No third-party sharing without consent
- **Profiling**: No automated decision-making

## 4. Mitigation Measures
- Encryption (AES-256, TLS 1.2+)
- Access controls (RBAC)
- Audit logging
- Regular penetration testing
- Staff training (data protection)

## 5. Conclusion
Processing poses low risk if mitigations implemented.
```

### 6. Privacy by Design

Implement privacy from day 1:

- ✅ Collect only necessary data
- ✅ Encrypt sensitive data
- ✅ Implement access controls
- ✅ Minimize data retention
- ✅ Pseudonymize where possible
- ✅ Default to private settings
- ✅ Transparent processing

## CCPA Compliance

### 1. Rights Under CCPA

#### Right to Know (Sections 1798.100)
"What personal information does PBS collect?"

```
GET /auth/me/ccpa-data-request
Headers: Authorization: Bearer <token>
Response: All personal information
```

#### Right to Delete (Section 1798.105)
"Delete my personal information"

```
POST /auth/delete-account
```

#### Right to Opt-Out (Section 1798.120)
"Don't sell or share my personal information"

```
PUT /auth/me/ccpa-opt-out
Body: {opt_out_sale: true}
```

#### Right to Limit (Section 1798.121)
"Limit use of sensitive personal information"

```
PUT /auth/me/ccpa-limit
Body: {limit_sensitive_info: true}
```

#### Right to Correct (Section 1798.100)
"Correct inaccurate personal information"

```
PUT /auth/me
Body: {name: "Correct Name"}
```

### 2. Privacy Notice

**Required Disclosures:**

In privacy policy, disclose:
- Categories of personal information collected
- Purposes of collection
- Categories shared/disclosed
- Consumer rights under CCPA
- Contact information for requests

### 3. Request Verification

For CCPA requests, verify requestor identity:

```python
# Verify email + OTP
def verify_ccpa_request(email: str):
    # Send OTP to email
    # User confirms OTP
    # Fulfill request
```

### 4. Opt-Out Implementation

If you sell/share data (⚠️ PBS does NOT):

```
- Add "Do Not Sell My Personal Information" link
- Clear opt-out mechanism
- Honor opt-out requests within 45 days
- No discrimination for opting out
```

## COPPA Compliance

### 1. Minimum Age Verification

For services collecting data from children <13:

```python
# Verify age before signup
if user_age < 13:
    require_parental_consent()
```

### 2. Parental Consent

**Safe Harbor Methods:**
- Email verification of parent
- Credit card verification (declined, not charged)
- Other government ID verification

```python
# Send verification to parent email
def send_parent_consent_request(parent_email: str, child_name: str):
    link = generate_secure_token(child_id)
    email = f"""
    Your child {child_name} wants to join PBS.
    Please verify you're the parent: {link}
    """
    send_email(parent_email, email)
```

### 3. Limited Data Collection

For children <13, collect ONLY:
- Name
- Email
- Birth date (for age verification)
- Optional: Avatar

**DO NOT collect:**
- Precise location
- Device identifiers
- Behavioral data
- Marketing data
- Biometric data

### 4. No Targeted Advertising

```python
# Disable marketing for users <13
if user_age < 13:
    disable_behavioral_ads()
    disable_marketing_emails()
```

### 5. Parental Access & Deletion

Parents have right to:

```
GET /parent-portal/{parent_token}
  Response: Child's account data

DELETE /parent-portal/{parent_token}
  Action: Delete child's account + data
```

### 6. Verifiable Parental Consent

COPPA requires "verifiable parental consent". Safe methods:

- ✅ Signed email from parent
- ✅ Credit/debit card (declined, not charged)
- ✅ Government-issued ID
- ❌ Opt-out consent (less safe)

## Child Safety (NCMEC Reporting)

### 1. CSAM Detection

If you detect Child Sexual Abuse Material (CSAM):

```python
def report_csam(content_url: str, reporter_info: dict):
    # Report to NCMEC immediately
    ncmec_report = {
        "source_url": content_url,
        "timestamp": datetime.now(),
        "reporter": reporter_info
    }
    # POST to https://www.cybertipline.org/
```

### 2. Grooming Prevention

- Monitor for patterns of child grooming
- Age-gate sensitive features
- Restrict messaging between adults/children
- Report suspicious accounts

### 3. Child Exploitation Reporting

Users report suspected exploitation:

```
POST /report-exploitation
Body: {
  "user_id": "...",
  "content": "...",
  "description": "..."
}
Response: Confirmation + NCMEC case number
```

## Age Verification

### 1. Approaches

**Lightweight:** Birth date at signup
```python
if user_birthdate > today - 13_years:
    require_parental_consent()
```

**Medium:** Third-party age verification
```python
# Use Veriff or AgeID to verify
verify_age_with_veriff(user_id)
```

**Heavy:** Government ID
```python
# Requires ID upload + verification
require_government_id(user_id)
```

### 2. Best Practice

1. Use birth date initially
2. For age-restricted features, require 3rd-party verification
3. For adult-only services (18+), require government ID

## Incident Response

### 1. Data Breach

**Timeline:**
- 0h: Discover breach
- <24h: Notify affected users
- <72h: Notify supervisory authority (GDPR)
- <10 days: Regulatory report

**Notification Template:**
```
Subject: Important Security Notice - [Service Name]

We discovered unauthorized access to account data. 
Affected: Email, name, OAuth provider ID
Impact: [Low/Medium/High]
Actions taken: [encrypted, monitoring, etc.]
What you should do: [reset password, etc.]

Case #: [ID]
Contact: [email]
```

### 2. Incident Reporting

**GDPR:** Report to supervisor authority within 72h
**CCPA:** Report within 60 days
**State AG:** Varies by state

### 3. Post-Incident Review

```
1. Root cause analysis
2. Identify systemic issues
3. Implement fixes
4. Document lessons learned
5. Update security policies
6. Communicate to stakeholders
```

## Audit & Documentation

### 1. Records of Processing

Maintain (GDPR Article 30):

```
- Data categories collected
- Processing purposes
- Recipients of data
- Retention periods
- Security measures
- Processing location
- Sub-processors
```

### 2. Regular Audits

```
- Annual security audit
- Quarterly access control review
- Monthly log review
- Real-time anomaly detection
```

### 3. Compliance Checklist

```
[ ] Privacy policy updated
[ ] Terms of service updated
[ ] COPPA compliance (if applicable)
[ ] GDPR consent collection
[ ] CCPA opt-out mechanism
[ ] Data retention policy
[ ] Incident response plan
[ ] DPA with sub-processors
[ ] Staff training completed
[ ] Regular audits scheduled
```

## Resources

- **GDPR**: https://gdpr-info.eu/
- **CCPA**: https://oag.ca.gov/privacy/ccpa
- **COPPA**: https://www.ftc.gov/enforcement/rules/rulemaking-201/childrens-online-privacy-protection-rule
- **NCMEC**: https://www.cybertipline.org/

## Contact

For compliance questions: {{DPO_EMAIL}}
