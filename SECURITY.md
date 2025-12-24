# Security Policy

This document outlines the security practices, policies, and guidelines for the Ghardaar24 real estate platform.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Environment Variables](#environment-variables)
6. [Input Validation](#input-validation)
7. [Security Headers](#security-headers)
8. [Reporting Vulnerabilities](#reporting-vulnerabilities)
9. [Security Best Practices](#security-best-practices)

---

## Security Overview

Ghardaar24 is built with security as a priority. The application uses Supabase for backend services, which provides enterprise-grade security features out of the box.

### Security Stack

| Component | Security Feature |
|-----------|-----------------|
| Authentication | Supabase Auth (JWT-based) |
| Database | PostgreSQL with RLS |
| Storage | Supabase Storage with policies |
| API | Row Level Security policies |
| Transport | HTTPS/TLS encryption |

---

## Authentication & Authorization

### Authentication Method

The application uses **Supabase Auth** for user authentication:

- Email/password authentication for admin users
- JWT (JSON Web Tokens) for session management
- Secure token refresh mechanism
- Password hashing using bcrypt

### Session Management

- Sessions are managed client-side using Supabase's built-in session handling
- Tokens are automatically refreshed before expiration
- Sessions expire after 1 hour of inactivity (configurable)

### Admin Access

Admin functionality is restricted to authenticated users only:

```typescript
// Example: Protected route check
const { user } = useAuth()
if (!user) {
  redirect('/admin/login')
}
```

---

## Data Protection

### Data at Rest

- All data is stored in Supabase's PostgreSQL database
- Database is hosted on secure, encrypted infrastructure
- Regular automated backups are maintained by Supabase

### Data in Transit

- All communications use HTTPS/TLS encryption
- API requests are authenticated with JWT tokens
- Sensitive data is never exposed in URLs

### Personal Data Handling

The application collects the following personal data through inquiry forms:

| Data Type | Purpose | Retention |
|-----------|---------|-----------|
| Name | Contact identification | Until deleted by admin |
| Email | Communication | Until deleted by admin |
| Phone | Communication | Until deleted by admin |
| Message | Inquiry context | Until deleted by admin |

---

## Row Level Security (RLS)

All database tables have Row Level Security enabled to ensure data access is properly controlled.

### Properties Table Policies

| Policy | Access Level | Description |
|--------|--------------|-------------|
| `Public can view active properties` | SELECT | Anyone can view active listings |
| `Authenticated users can insert properties` | INSERT | Only admins can create |
| `Authenticated users can update properties` | UPDATE | Only admins can modify |
| `Authenticated users can delete properties` | DELETE | Only admins can delete |

### Inquiries Table Policies

| Policy | Access Level | Description |
|--------|--------------|-------------|
| `Anyone can submit inquiries` | INSERT | Public form submissions |
| `Authenticated users can view inquiries` | SELECT | Only admins can read |
| `Authenticated users can update inquiries` | UPDATE | Only admins can modify |
| `Authenticated users can delete inquiries` | DELETE | Only admins can delete |

### Storage Policies

| Policy | Access Level | Description |
|--------|--------------|-------------|
| `Public can view property images` | SELECT | Anyone can view images |
| `Authenticated users can upload property images` | INSERT | Only admins can upload |
| `Authenticated users can update property images` | UPDATE | Only admins can modify |
| `Authenticated users can delete property images` | DELETE | Only admins can delete |

---

## Environment Variables

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Security Guidelines

1. **Never commit `.env` files** to version control
2. **Use environment-specific variables** for different deployments
3. **Rotate keys periodically** (especially after team member changes)
4. **Use Vercel/hosting provider's** secure environment variable storage

### Key Security

- The `anon` key is safe for client-side use (protected by RLS)
- Never expose `service_role` key on the client side
- Store sensitive keys in server-side only environment variables

---

## Input Validation

### Client-Side Validation

All forms include basic client-side validation:

```typescript
// Example validation
if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  setError('Invalid email address')
  return
}
```

### Server-Side Validation

- Database constraints enforce data integrity
- CHECK constraints validate enum values
- NOT NULL constraints prevent missing required data

### Sanitization

- User inputs are sanitized before database insertion
- SQL injection is prevented by using parameterized queries (Supabase client)
- XSS prevention through React's automatic escaping

---

## Security Headers

When deploying to production, configure the following security headers:

### Recommended Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

---

## Reporting Vulnerabilities

### Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

1. **Do not** publicly disclose the vulnerability
2. **Email** your findings to the development team
3. **Include** detailed steps to reproduce
4. **Allow** reasonable time for a fix before disclosure

### What to Report

- Authentication bypass vulnerabilities
- SQL injection or XSS vulnerabilities
- Privilege escalation issues
- Data exposure or leakage
- Broken access controls

### Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 1 week |
| Fix Development | Depends on severity |
| Public Disclosure | After fix is deployed |

---

## Security Best Practices

### For Developers

1. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

2. **Review code for security issues**
   - Check for hardcoded credentials
   - Validate all user inputs
   - Use parameterized queries

3. **Follow the principle of least privilege**
   - Request only necessary permissions
   - Use minimal RLS policies

4. **Secure error handling**
   - Don't expose stack traces in production
   - Log errors securely

### For Administrators

1. **Use strong passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Use a password manager

2. **Enable two-factor authentication** (when available)

3. **Regularly review access logs**

4. **Revoke access immediately** when team members leave

### For Deployment

1. **Use HTTPS everywhere**
2. **Configure security headers**
3. **Enable automatic updates** for dependencies
4. **Set up monitoring and alerting**
5. **Perform regular security audits**

---

## Compliance

### Data Privacy

The application should be configured to comply with applicable data privacy regulations:

- **GDPR** (if serving EU users)
- **CCPA** (if serving California users)
- Local data protection laws

### Recommended Actions

1. Implement privacy policy page
2. Add cookie consent mechanism
3. Provide data export functionality
4. Implement data deletion requests

---

## Security Checklist

Use this checklist before deploying to production:

- [ ] Environment variables are properly configured
- [ ] RLS policies are enabled and tested
- [ ] Admin authentication is working
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Dependencies are up to date
- [ ] Error handling doesn't expose sensitive info
- [ ] Input validation is implemented
- [ ] Logs don't contain sensitive data
- [ ] Backup strategy is in place

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | December 2024 | Initial security policy |

---

## Contact

For security-related inquiries, please contact:

**Ashutosh Swamy**  
[![GitHub](https://img.shields.io/badge/GitHub-ashutoshswamy-181717?style=flat-square&logo=github)](https://github.com/ashutoshswamy)

---

<div align="center">
Made by <a href="https://github.com/ashutoshswamy">Ashutosh Swamy</a>
</div>
