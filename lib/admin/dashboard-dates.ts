// Request-time data query boundary, separate from the React component's render body.
export function recentContentCutoff() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}
