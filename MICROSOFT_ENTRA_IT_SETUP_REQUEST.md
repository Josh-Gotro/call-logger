# Microsoft Entra ID Setup Request - DataTech Call Logger

**Application Name:** DataTech Call Logger
**Purpose:** Internal staff time-tracking and call logging application
**Primary Users:** WAI DataTech staff (@wostmann.com email domain)
**Request Date:** 2025-11-04
**Priority:** Standard Setup Request

---

## Executive Summary

We need a Microsoft Entra ID (formerly Azure Active Directory) application registration configured for our internal Call Logger application. This will enable secure single sign-on (SSO) for our DataTech staff using their existing WAI credentials, eliminating the need for separate passwords and improving security.

**Key Benefits:**
- Single sign-on with existing WAI credentials
- No additional passwords to manage
- Enhanced security through Azure AD authentication
- Centralized user access management
- Audit trail for user authentication

---

## Application Overview

**What the application does:**
- Logs and tracks support call details (duration, task, subject, comments)
- Generates reports on call activity by time period
- Provides searchable call history for staff
- Exports call data to CSV for analysis

**Technology Stack:**
- Frontend: React Single Page Application (SPA)
- Backend: Spring Boot REST API (Java)
- Database: PostgreSQL
- Deployment: Docker containers

**Current State:**
- Application is functional but uses basic manual login
- MSAL libraries already installed in codebase
- Backend is configured to validate Azure AD JWT tokens (once enabled)

---

## What We Need from IT

### Part 1: Application Registration in Microsoft Entra ID

Please create a new **App Registration** in your Microsoft Entra ID (Azure AD) tenant with the following configuration:

#### Basic Information
- **Application Name:** `DataTech Call Logger` (or your preferred naming convention)
- **Application Type:** Single Page Application (SPA)
- **Supported Account Types:** Accounts in this organizational directory only (WAI - Single tenant)

#### Redirect URIs (Platform: Single-page application)

Please configure the following redirect URIs:

**Development Environment:**
```
http://localhost:3000
http://localhost:3003
http://localhost:5173
```

**Production Environment:**
```
https://[YOUR-PRODUCTION-DOMAIN]
https://[YOUR-PRODUCTION-DOMAIN]/callback
```

> **Note:** Please replace `[YOUR-PRODUCTION-DOMAIN]` with our actual production URL once determined.

#### Logout URIs (Front-channel logout URL)

**Development:**
```
http://localhost:3000/logout
http://localhost:3003/logout
```

**Production:**
```
https://[YOUR-PRODUCTION-DOMAIN]/logout
```

#### ID Tokens Configuration

Under **Authentication > Implicit grant and hybrid flows:**
- ✅ Enable "ID tokens (used for implicit and hybrid flows)"

Under **Token configuration:**
- ✅ Include the following optional claims in ID tokens:
  - `email`
  - `family_name`
  - `given_name`
  - `upn` (User Principal Name)

---

### Part 2: API Permissions

Please grant the following **Delegated Permissions** for Microsoft Graph API:

| Permission | Type | Purpose |
|------------|------|---------|
| `User.Read` | Delegated | Read user's profile (name, email) |
| `email` | Delegated | Access user's email address |
| `profile` | Delegated | Access user's basic profile info |
| `openid` | Delegated | Required for OpenID Connect authentication |

**Admin Consent Required:** Yes (please grant admin consent for the organization)

---

### Part 3: Application Configuration Details

#### Expose an API (Optional but Recommended)

If you want to define custom scopes for the backend API:

- **Application ID URI:** `api://[CLIENT_ID]` or `api://datatech-call-logger`
- **Scope Name:** `access_as_user`
- **Who can consent:** Admins and users
- **Display Name:** "Access Call Logger as user"
- **Description:** "Allows the app to access Call Logger on behalf of the signed-in user"

#### Token Configuration

- **Token version:** v2.0 (recommended)
- **Token lifetime:** Default (1 hour for access tokens)
- **Refresh tokens:** Enabled

---

### Part 4: Security & Access Configuration

#### User Assignment

**Option A - All WAI DataTech Staff (Recommended):**
- Under **Enterprise Application > Properties**:
- Set "User assignment required?" to **No**
- This allows all users in the tenant to sign in

**Option B - Specific User Group:**
- Under **Enterprise Application > Properties**:
- Set "User assignment required?" to **Yes**
- Under **Users and groups**, assign the specific group: `WAI DataTech Staff` (or equivalent)

**Our Preference:** Option A (allow all tenant users, we'll validate @wostmann.com domain in code)

#### Conditional Access Policies

If your organization uses conditional access policies, please ensure:
- Multi-factor authentication (MFA) policies apply as per org standards
- No additional IP restrictions beyond org standards
- Application can be accessed from standard work locations

---

### Part 5: Application Roles (Future Enhancement)

If possible, please configure the following **App Roles** for role-based access control:

| Role Name | Display Name | Description | Allowed Member Types |
|-----------|--------------|-------------|---------------------|
| `Admin` | Administrator | Can manage tasks, subjects, and view all reports | Users |
| `Reporter` | Reporter | Can generate and export reports | Users |
| `User` | Standard User | Can log calls and view own history | Users |

**Note:** This is optional for initial deployment. We can add role-based features later.

---

## Information We Need Back from IT

Once the App Registration is created, please provide us with the following information:

### Required Configuration Values

```
┌─────────────────────────────────────────────────────────────┐
│ CRITICAL INFORMATION NEEDED                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Tenant ID (Directory ID):                                │
│    [                                                    ]   │
│    Found: Azure AD > Overview > Tenant ID                   │
│                                                             │
│ 2. Application (Client) ID:                                 │
│    [                                                    ]   │
│    Found: App Registrations > [App Name] > Overview         │
│                                                             │
│ 3. Client Secret (if required):                             │
│    [                                                    ]   │
│    Found: App Registrations > Certificates & secrets        │
│    Note: Only needed if using confidential client flow      │
│                                                             │
│ 4. Redirect URIs Configured:                                │
│    [                                                    ]   │
│    [                                                    ]   │
│                                                             │
│ 5. Production Domain Approved:                              │
│    [                                                    ]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Additional Information Helpful for Testing

- **Test User Accounts:** Do you have test accounts we can use for development/testing?
- **Access Token Lifetime:** What is the configured access token lifetime?
- **Refresh Token Rotation:** Is refresh token rotation enabled?
- **Token Endpoint:** (Usually `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token`)
- **Authorization Endpoint:** (Usually `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize`)

---

## Technical Implementation Details (For IT Review)

### Authentication Flow

This application uses the **OAuth 2.0 Authorization Code Flow with PKCE** (Proof Key for Code Exchange):

1. User clicks "Sign in with Microsoft"
2. Application redirects to Microsoft Entra ID login page
3. User enters WAI credentials
4. Entra ID validates credentials and returns authorization code
5. Application exchanges code for access token + ID token (using PKCE)
6. Access token is included in all API requests to backend
7. Backend validates JWT token signature against Entra ID public keys
8. Backend extracts user identity from token claims

**Security Features:**
- PKCE prevents authorization code interception attacks
- No client secret stored in browser (SPA best practice)
- Token validation uses Azure AD's public key infrastructure
- Tokens stored in memory only (not localStorage for XSS protection)

### Token Validation (Backend)

Our Spring Boot backend will validate tokens using:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://login.microsoftonline.com/{TENANT_ID}/v2.0
          audiences: {CLIENT_ID}
          jwk-set-uri: https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys
```

**Validation Checks:**
- Token signature (verified against Azure AD public keys)
- Token expiration (`exp` claim)
- Token issuer (`iss` claim matches tenant)
- Token audience (`aud` claim matches client ID)
- User email domain (@wostmann.com)

### Required Token Claims

Our application expects the following claims in the ID token and Access token:

| Claim | Purpose |
|-------|---------|
| `oid` | Azure AD Object ID (unique user identifier) |
| `email` | User's email address |
| `name` | User's display name |
| `preferred_username` | User's UPN |
| `tid` | Tenant ID |
| `aud` | Audience (should match our client ID) |
| `iss` | Issuer (should be Azure AD) |
| `exp` | Expiration timestamp |
| `iat` | Issued at timestamp |

---

## Network & Firewall Requirements

### Outbound Connections Required

The application needs to make outbound HTTPS connections to:

**Microsoft Entra ID Endpoints:**
```
https://login.microsoftonline.com
https://login.microsoft.com
https://graph.microsoft.com (for User.Read permission)
```

**Ports:**
- TCP 443 (HTTPS)

### Inbound Connections

No special inbound firewall rules required beyond standard web application access.

---

## Security & Compliance Considerations

### Data Handling

**What data does the application access from Entra ID:**
- User's display name
- User's email address
- User's Object ID (for unique identification)

**What data does the application store:**
- User email and name (for call log attribution)
- Call timestamps, durations, tasks, subjects, and comments
- No passwords are stored (authentication delegated to Entra ID)

**Data Retention:**
- Call logs retained indefinitely for business reporting purposes
- User records retained while user is active in Entra ID
- No PII beyond email/name is stored

### Compliance

- **Authentication Audit Trail:** All authentication events logged in Entra ID sign-in logs
- **Access Tokens:** Short-lived (1 hour), validated on every API request
- **Session Management:** Sessions tied to token lifetime, automatic logout on expiration
- **No Credentials Stored:** Application never sees or stores user passwords

### Security Best Practices Implemented

- ✅ PKCE for authorization code flow
- ✅ Token validation on backend (signature, expiration, audience)
- ✅ Domain restriction (@wostmann.com only)
- ✅ CORS configured for specific origins only
- ✅ No credentials in frontend code
- ✅ HTTPs required for production
- ✅ Tokens stored in memory (not localStorage)

---

## Deployment Timeline

| Phase | Timeline | Description |
|-------|----------|-------------|
| **1. App Registration** | Week 1 | IT creates app registration and provides credentials |
| **2. Development Testing** | Week 1-2 | Developers integrate MSAL and test with dev environment |
| **3. Internal Testing** | Week 2-3 | Small group of users test authentication flow |
| **4. Production Deployment** | Week 3-4 | Deploy to production with production redirect URIs |
| **5. Full Rollout** | Week 4+ | All DataTech staff using Azure AD authentication |

---

## Testing Checklist (For IT Validation)

After configuration, please verify:

- [ ] Application appears in Enterprise Applications list
- [ ] Delegated permissions granted with admin consent
- [ ] Redirect URIs configured for both dev and prod
- [ ] Token configuration includes required claims
- [ ] Test user can successfully authenticate
- [ ] Access token contains expected claims (email, name, oid)
- [ ] Token lifetime is configured appropriately
- [ ] Conditional access policies apply as expected

---

## Support Contacts

**Development Team:**
- Name: [Your Name]
- Email: [Your Email]
- Phone: [Your Phone]

**Project Manager:**
- Name: [PM Name]
- Email: [PM Email]

**Escalation Contact:**
- Name: [Escalation Name]
- Email: [Escalation Email]

---

## Additional Resources

**Microsoft Documentation:**
- [Register an application with Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- [Configure a SPA with MSAL.js](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-overview)
- [Microsoft Graph API Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)

**Our Application:**
- Repository: [GitHub/Bitbucket URL]
- Documentation: `README.md` in repository
- Architecture Diagram: `README.md` > Architecture section

---

## Questions or Concerns?

If you have any questions about this request or need clarification on any technical details, please contact:

**Email:** [Your Email]
**Teams/Slack:** [Your Handle]
**Phone:** [Your Phone]

We're happy to schedule a call to walk through the requirements if needed.

---

## Appendix A: Environment Variables We Will Configure

Once you provide the credentials, we will configure the following environment variables in our application:

**Backend (Spring Boot):**
```bash
AZURE_TENANT_ID=<from-it>
AZURE_CLIENT_ID=<from-it>
```

**Frontend (React/Vite):**
```bash
VITE_AZURE_TENANT_ID=<from-it>
VITE_AZURE_CLIENT_ID=<from-it>
```

These will be stored securely in:
- Development: `.env.local` (git-ignored)
- Production: Docker secrets or environment variable injection

---

## Appendix B: Sample Token Claims (What We'll Receive)

Here's an example of what the ID token claims will look like after successful authentication:

```json
{
  "aud": "12345678-1234-1234-1234-123456789abc",
  "iss": "https://login.microsoftonline.com/{tenant-id}/v2.0",
  "iat": 1699123456,
  "nbf": 1699123456,
  "exp": 1699127056,
  "email": "john.doe@wostmann.com",
  "name": "John Doe",
  "oid": "00000000-0000-0000-0000-000000000001",
  "preferred_username": "john.doe@wostmann.com",
  "rh": "...",
  "sub": "...",
  "tid": "87654321-4321-4321-4321-cba987654321",
  "uti": "...",
  "ver": "2.0"
}
```

**Claims we use:**
- `email` - Identifies which DataTech staff member logged the call
- `name` - Display name for UI
- `oid` - Unique identifier stored in our database for user records
- `aud`, `iss`, `exp` - Security validation

---

## Appendix C: OAuth 2.0 Flow Diagram

```
┌─────────┐                                           ┌──────────────┐
│         │                                           │              │
│ Browser │                                           │ Entra ID     │
│ (SPA)   │                                           │ (Azure AD)   │
│         │                                           │              │
└────┬────┘                                           └──────┬───────┘
     │                                                        │
     │ 1. User clicks "Sign in with Microsoft"               │
     │                                                        │
     │ 2. Redirect to login.microsoftonline.com              │
     │ ──────────────────────────────────────────────────────>│
     │                                                        │
     │                     3. User enters credentials         │
     │                        (handled by Microsoft)          │
     │                                                        │
     │ 4. Authorization code + PKCE verifier returned         │
     │<───────────────────────────────────────────────────────│
     │                                                        │
     │ 5. Exchange code for tokens                            │
     │ ──────────────────────────────────────────────────────>│
     │                                                        │
     │ 6. Return ID token + Access token                      │
     │<───────────────────────────────────────────────────────│
     │                                                        │
     │                                                        │
     │                                           ┌────────────┴────────┐
     │ 7. API request with Bearer token          │                     │
     │ ──────────────────────────────────────────>│  Backend API        │
     │                                            │  (Spring Boot)      │
     │                                            │                     │
     │                                            │ 8. Validate token:  │
     │                                            │    - Signature      │
     │                                            │    - Expiration     │
     │                                            │    - Audience       │
     │                                            │                     │
     │ 9. Return protected data                   │                     │
     │<───────────────────────────────────────────│                     │
     │                                            │                     │
     │                                            └─────────────────────┘
```

---

**END OF REQUEST**

Thank you for your assistance in setting up Microsoft Entra ID authentication for the DataTech Call Logger application. We look forward to working with you on this implementation.
