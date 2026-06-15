// Resolve a stable device identifier from header, body, or query.
export function deviceId(req) {
  return (
    req.headers['x-device-id'] ||
    req.body?.device_id ||
    req.query?.device_id ||
    'anonymous-device'
  );
}
