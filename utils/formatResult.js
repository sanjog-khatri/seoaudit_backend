const pass = (message) => ({
  status: 'pass',
  message,
  fix: null
});

const warn = (message, fix) => ({
  status: 'warning',
  message,
  fix
});

const fail = (message, fix) => ({
  status: 'fail',
  message,
  fix
});

module.exports = {
  pass,
  warn,
  fail
};