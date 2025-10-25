export const escapeArbitrary = (str = '') =>
  str
    .replace(/\\_/g, '\u0000')
    .replace(/_/g, ' ')
    .replace(/\u0000/g, '_')
