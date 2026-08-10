export function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*#?&]/.test(password);

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return { isValid, minLength, hasUpper, hasLower, hasNumber, hasSpecial };
}