module.exports = {
  allowedDomains: ['CORP', 'local'],
  allowedSessionStates: [ 'open', 'user-logged-out', 'user-timed-out', 'user-revoked', 'admin-revoked' ], 
  secondsToJwtExpiration: 300,
  resultLimit: 1000
};