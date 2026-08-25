// utils/validators.js
//
// VIVA NOTE - Callback vs Promise vs async/await, side by side:
//   1. checkPasswordStrength      -> classic Node-style callback
//   2. checkPasswordStrengthAsync -> that same callback, wrapped BY HAND
//      in `new Promise(...)` (this is literally what Node's built-in
//      `util.promisify` automates for you)
//   3. authController.js will consume #2 with `await`, because
//      async/await is syntax sugar over Promises - it needs something
//      that returns a Promise underneath.

/**
 * Classic Node-style callback function: (args..., callback), where
 * callback follows the "error-first" convention: callback(err, result).
 * Same shape as Node's built-in fs.readFile, etc.
 *
 * The work is deferred with setTimeout(..., 0) instead of calling
 * `callback` immediately. This is deliberate: a callback-based function
 * should never SOMETIMES run synchronously and SOMETIMES asynchronously -
 * it has to be consistently one or the other, or callers can't rely on
 * ordering. (Nickname for this rule in the Node community: "never
 * release Zalgo".)
 */
function checkPasswordStrength(password, callback) {
  setTimeout(() => {
    if (typeof password !== "string") {
      callback(new Error("Password must be a string"));
      return;
    }

    const checks = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[@$!%*#?&]/.test(password),
    };

    const isValid = Object.values(checks).every(Boolean);

    // Error-first convention: null in the error slot means "no error".
    callback(null, { isValid, ...checks });
  }, 0);
}

/**
 * Hand-rolled promisification of checkPasswordStrength — wrap a
 * callback-style function in `new Promise(...)`, and inside the
 * executor, call the original with a callback that resolves on
 * success or rejects on error.
 */
function checkPasswordStrengthAsync(password) {
  return new Promise((resolve, reject) => {
    checkPasswordStrength(password, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

module.exports = { checkPasswordStrength, checkPasswordStrengthAsync };