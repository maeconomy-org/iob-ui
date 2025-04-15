# Client Certificate Information Guide

## Certificate Contents

Client certificates typically contain the following information:

1. **Basic Information**

   - Subject Name
   - Organization Name
   - Organization Unit
   - Country
   - State/Province
   - Locality/City

2. **Technical Details**

   - Serial Number
   - Version
   - Valid From Date
   - Valid To Date (Expiration)
   - Public Key
   - Signature Algorithm

3. **Extensions**
   - Key Usage
   - Extended Key Usage
   - Subject Alternative Names (SANs)
   - Certificate Policies
   - Authority Information Access

## Extracting Certificate Information

When a client certificate is used in a TLS connection, the server can access this information. The backend can provide these details to the frontend:

```typescript
interface CertificateInfo {
  subject: {
    commonName: string
    organization: string
    organizationalUnit: string
    country: string
    state: string
    locality: string
  }
  issuer: {
    commonName: string
    organization: string
  }
  validity: {
    notBefore: Date
    notAfter: Date
  }
  serialNumber: string
  fingerprint: string
}
```

## Certificate Selector Implementation

### 1. Browser's Native Selector

The browser will automatically show its certificate selector when the server requests a client certificate:

```typescript
// This happens automatically during TLS handshake
// No special frontend code needed
fetch('/api/endpoint', {
  credentials: 'include',
})
```

### 2. Custom Certificate Info Display

After authentication, you can display certificate information:

```typescript
interface CertificateDisplay {
  currentCertificate: CertificateInfo | null;
  expirationWarning: boolean;
}

function CertificateInfo({ certificate }: { certificate: CertificateInfo }) {
  const daysUntilExpiration = Math.floor(
    (new Date(certificate.validity.notAfter).getTime() - Date.now()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">Current Certificate</h3>
      <div className="space-y-2 mt-2">
        <p>Subject: {certificate.subject.commonName}</p>
        <p>Organization: {certificate.subject.organization}</p>
        <p>Expires in: {daysUntilExpiration} days</p>
        {daysUntilExpiration < 30 && (
          <p className="text-amber-600">
            ⚠️ Certificate will expire soon
          </p>
        )}
      </div>
    </div>
  );
}
```

### 3. Certificate Selection History

You can store and display recently used certificates (only the public information):

```typescript
interface CertificateHistory {
  recentCertificates: {
    subjectName: string;
    organization: string;
    lastUsed: Date;
  }[];
}

function CertificateHistory({ history }: { history: CertificateHistory }) {
  return (
    <div className="space-y-2">
      <h3>Recently Used Certificates</h3>
      {history.recentCertificates.map((cert, index) => (
        <div key={index} className="p-2 border rounded">
          <p>{cert.subjectName}</p>
          <p className="text-sm text-gray-500">
            {cert.organization} • Last used: {formatDate(cert.lastUsed)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

## Security Considerations

1. **Private Key Protection**

   - Private keys never leave the browser's secure storage
   - Cannot be accessed via JavaScript
   - Managed by the browser's certificate store

2. **Certificate Information**

   - Only display non-sensitive certificate information
   - Never expose private keys or sensitive data
   - Use HTTPS for all certificate-related communications

3. **Validation**

   - Server must validate certificate chain
   - Check certificate revocation status
   - Verify certificate purposes (Client Authentication)

4. **User Experience**
   - Clear feedback about certificate status
   - Expiration warnings
   - Easy certificate renewal process
   - Help documentation for certificate installation

## Implementation Notes

1. **Browser Support**

   - Modern browsers support client certificates
   - Certificate UI varies by browser
   - Some mobile browsers have limitations

2. **Testing**

   - Use test certificates for development
   - Create test CA for development
   - Document certificate installation process

3. **Maintenance**
   - Monitor certificate expiration
   - Plan renewal process
   - Keep CA certificates updated
   - Regular security audits
