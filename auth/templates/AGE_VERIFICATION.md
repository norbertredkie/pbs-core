# Age Verification & 18+ Disclaimer

**Effective Date:** {{EFFECTIVE_DATE}}
**Last Updated:** {{LAST_UPDATED}}

## 1. Age Requirements

This service requires users to be **{{MINIMUM_AGE}} years old or older**.

Some features require **18+ age verification**.

## 2. Why Age Verification?

{{#IF_COPPA}}
### COPPA Compliance (Children's Online Privacy Protection Act)

The Children's Online Privacy Protection Act (COPPA) requires:
- Parental consent for users under 13
- Limited data collection from children
- No behavioral advertising to children
- Transparency about data practices

We comply with COPPA regulations.
{{/IF_COPPA}}

{{#IF_ADULT_CONTENT}}
### Age-Restricted Features

The following features are restricted to users 18+ only:
- {{RESTRICTED_FEATURE_1}}
- {{RESTRICTED_FEATURE_2}}
- {{RESTRICTED_FEATURE_3}}
- {{RESTRICTED_FEATURE_4}}

This restriction complies with {{JURISDICTION}} law.
{{/IF_ADULT_CONTENT}}

## 3. Age Verification Methods

When you sign up, we verify age through:

### 3.1 Age Declaration

- You must select your birth date during signup
- False age declaration is a violation of Terms
- Account can be terminated for age fraud

### 3.2 Automated Checks

- We may cross-reference age data with third-party services
- Data processed securely; never shared

### 3.3 Government ID Verification *(if applicable)*

{{#IF_ID_VERIFICATION}}
For age-sensitive features, we may require:
- Upload of government-issued ID (driver's license, passport, national ID)
- ID verified via {{ID_VERIFICATION_PROVIDER}}
- ID data deleted after verification (not stored)
{{/IF_ID_VERIFICATION}}

## 4. COPPA: Parental Consent & Controls

{{#IF_COPPA}}

### 4.1 For Children Under 13

**Parental Consent Required**

Parents/guardians must provide verifiable consent before child can create an account. We use:
- Email verification to confirm parental identity
- Phone verification (optional)
- Credit card verification (optional)

### 4.2 Creating an Account for Your Child

1. Visit {{COPPA_CONSENT_URL}}
2. Provide your email and contact information
3. Provide child's name, email, and birth date
4. Verify your identity
5. We send you a verification email
6. Child's account becomes active once verified

### 4.3 Parental Rights Under COPPA

As a parent/guardian, you have the right to:

**Access:** View all information we collect about your child
- Request via {{CONTACT_EMAIL}}
- Response within 30 days

**Review & Deletion:** Examine and delete your child's account
- Go to https://{{DOMAIN}}/parent-portal
- Enter parent email and verification code
- Select "Delete Account"

**Opt-Out:** Stop further collection of your child's data
- Deactivate collection in parent portal
- Account remains active but data collection stops

**Revoke Consent:** Delete your child's account entirely
- Submit request via {{CONTACT_EMAIL}}
- Account and all data deleted within 30 days

### 4.4 What We Collect from Children <13

We collect **only:**
- Name
- Email address
- Birth date (for age verification)
- Account preferences

We **do NOT:**
- Collect precise location data
- Collect device identifiers
- Track behavioral data for advertising
- Share data with third parties
- Use data for marketing

### 4.5 COPPA Safe Harbor

We adhere to the FTC's COPPA Safe Harbor program:
- Regular compliance audits
- Third-party verification
- Documented safeguards
- Transparency reporting

{{/IF_COPPA}}

## 5. 18+ Verification

{{#IF_ADULT_FEATURES}}

### 5.1 Why 18+ Verification?

The following features are age-restricted due to:
- Legal requirements ({{JURISDICTION}})
- Content maturity
- Payment/financial requirements
- Safety concerns

### 5.2 18+ Age Verification Process

To access age-restricted features:

1. **Declare Age:** Check "I am 18+" on signup
2. **Verify Age:**
   - Method 1: Government ID upload
   - Method 2: Third-party age verification service
   - Method 3: Credit card verification
3. **Confirmation:** Receive verification confirmation
4. **Access Granted:** Age-restricted features unlocked

### 5.3 Age Verification Services

We use {{AGE_VERIFICATION_PROVIDER}} for third-party verification:
- Securely verifies your age against public records
- Does not store personal information
- Encrypted transmission
- GDPR/CCPA compliant

### 5.4 ID Verification Privacy

If you upload government ID:
- Only shared with {{ID_VERIFICATION_PROVIDER}}
- Photo extracted for age verification only
- Original ID deleted after verification
- No long-term storage of ID data

{{/IF_ADULT_FEATURES}}

## 6. Birth Date Privacy

Your birth date is:
- Encrypted in storage
- Used only for age verification
- Never sold or shared
- Visible only to you and administrators
- Deleted with account

## 7. Age Misrepresentation

### 7.1 Violations

Providing false age information is prohibited and may result in:
- Immediate account termination
- Permanent ban from the Service
- Potential legal action (fraud, COPPA violations)

### 7.2 Reporting

If you know a minor is accessing age-restricted features:
- Report via {{REPORT_FORM_URL}}
- Contact {{CONTACT_EMAIL}}
- For COPPA violations: Report to FTC at {{FTC_URL}}

## 8. Parental Controls & Monitoring

{{#IF_PARENTAL_CONTROLS}}

Parents can enable monitoring via parental controls:

### 8.1 Setting Up Parental Controls

1. Go to Account Settings > Family Controls
2. Select "Set Up Child Account"
3. Enter child's name and email
4. Set usage limits:
   - Daily time limit
   - Bedtime restrictions
   - Content filters
5. Receive activity reports

### 8.2 Activity Monitoring

Parents receive:
- Weekly activity summaries
- Login notifications
- Content upload alerts
- Friend/follower notifications

### 8.3 Content Filtering

- Block adult content
- Restrict messaging
- Disable payment features
- Approve new features/apps

{{/IF_PARENTAL_CONTROLS}}

## 9. Transitioning to Adulthood

When a child turns 18:

1. **Full Access:** All age-restricted features automatically unlocked
2. **Notification:** We notify user of 18+ feature availability
3. **Parental Access Ends:** Parental controls automatically disabled
4. **User Control:** Now user has full account control

**Exception:** User may request parental controls remain active.

## 10. Special Protections for Minors

For all users under 18:

- **Messaging Restrictions:** Limited messaging with adults (optional parent controls)
- **Privacy Defaults:** Profiles private by default
- **No Data Sharing:** Third-party data sharing disabled
- **No Advertising:** Behavioral/targeted advertising prohibited
- **Support:** Dedicated minor safety support team

## 11. Reporting Child Safety Issues

If you believe a child is in danger:

**Immediate Emergency:** Call local police or emergency services

**Report to Us:**
- Email: {{CHILD_SAFETY_EMAIL}}
- Form: {{CHILD_SAFETY_REPORT_URL}}
- Chat Support: {{SUPPORT_CHAT}}

**Report to FTC (COPPA violations):**
- https://reportinternetcrime.ic3.gov
- Federal Trade Commission
- Email: spam@uce.gov

**Report to NCMEC (Child Exploitation):**
- National Center for Missing & Exploited Children
- CyberTipline: {{NCMEC_CYBERTIPLINE_URL}}
- Phone: 1-800-843-5678

## 12. Policy Changes

This age verification policy may be updated. Changes effective with 30 days' notice.

## 13. Questions?

- **Age/COPPA Questions:** {{CONTACT_EMAIL}}
- **Verification Issues:** {{SUPPORT_URL}}
- **Privacy Questions:** {{PRIVACY_EMAIL}}

---

**Acknowledgment of Age Requirements:**
- ☐ I confirm I am {{MINIMUM_AGE}} years old or older
- ☐ I understand age-restricted features and my rights
{{#IF_COPPA}}
- ☐ I have parental consent (if under 13)
{{/IF_COPPA}}
{{#IF_ADULT_FEATURES}}
- ☐ I confirm I am 18+ for age-restricted features
{{/IF_ADULT_FEATURES}}

Last Revised: {{LAST_UPDATED}}
