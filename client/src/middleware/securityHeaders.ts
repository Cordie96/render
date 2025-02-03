export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://www.youtube.com wss: https:; " +
    "frame-src https://www.youtube.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export const applySecurityHeaders = () => {
  Object.entries(securityHeaders).forEach(([header, value]) => {
    if (document.head) {
      const meta = document.createElement('meta');
      meta.httpEquiv = header;
      meta.content = value;
      document.head.appendChild(meta);
    }
  });
}; 