# Certificate Installation and Usage Guide

## Quick Start

1. Install your certificate
2. Open IoB application
3. Click "Authorize" when prompted
4. Select your certificate from the browser dialog
5. Start using the application

## Installing Your Certificate

### Windows

1. Double-click the certificate file (`.p12` or `.pfx`)
2. Windows will open the Certificate Import Wizard
3. Select "Current User" for store location
4. Follow the wizard, entering your certificate password when prompted
5. Click "Finish" to complete installation

### macOS

1. Double-click the certificate file
2. Keychain Access will open automatically
3. Enter your system password to allow installation
4. Enter the certificate password when prompted
5. The certificate will be installed in your login keychain

### Chrome/Edge

1. Open Settings
2. Search for "certificates" or go to Privacy and Security
3. Click "Manage certificates"
4. Go to "Your certificates" tab
5. Click "Import" and follow the wizard

### Firefox

Firefox uses its own certificate store:

1. Open Settings
2. Search for "certificates" or go to Privacy & Security
3. Click "View Certificates"
4. Go to "Your Certificates" tab
5. Click "Import" and select your certificate file

## Using Your Certificate

### First-Time Login

1. Open IoB application
2. Click "Authorize"
3. Your browser will show a certificate selection dialog
4. Select your organization's certificate
5. Click OK/Allow

### Daily Usage

- Your browser will remember your choice
- You may need to reselect after browser restart
- Certificate selection dialog may appear if multiple certificates are available

### Common Issues

#### Certificate Not Showing

- Ensure certificate is installed correctly
- Check if certificate is in the correct store
- Verify certificate hasn't expired
- Make sure you're using a supported browser

#### Access Denied

- Verify you selected the correct certificate
- Check certificate expiration date
- Contact your administrator if issues persist

#### Browser Differences

- Chrome/Edge share certificate store with Windows
- Firefox uses its own certificate store
- Safari uses macOS keychain
- Mobile browsers may have limited support

## Certificate Management

### Best Practices

- Keep your certificate password secure
- Don't share certificates between users
- Back up your certificate file
- Note the expiration date
- Request renewal before expiration

### Security Tips

- Only install certificates from trusted sources
- Never share your certificate password
- Use strong protection passwords
- Remove old or unused certificates

## Getting Help

### Support Contacts

- Technical Issues: [support@example.com](mailto:support@example.com)
- Certificate Requests: [certificates@example.com](mailto:certificates@example.com)
- Emergency Support: [+1 (555) 123-4567](tel:+15551234567)

### Useful Resources

- [Organization Certificate Policy](#)
- [Browser Security Settings](#)
- [Certificate FAQ](#)

## Certificate Renewal

### When to Renew

- 30 days before expiration
- When changing organizations
- If certificate is compromised

### Renewal Process

1. Request new certificate from administrator
2. Receive certificate file and password
3. Install new certificate
4. Test with IoB application
5. Remove old certificate (optional)

## Troubleshooting

### Common Error Messages

- "No valid certificates found"
  - Solution: Install or reimport certificate
- "Certificate expired"
  - Solution: Request and install new certificate
- "Certificate not trusted"
  - Solution: Contact administrator

### Browser-Specific Issues

- Chrome/Edge: Clear SSL state if issues persist
- Firefox: Check certificate store settings
- Safari: Verify keychain access
