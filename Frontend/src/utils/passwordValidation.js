export const PASSWORD_HINT =
  "Min 8 characters with uppercase, lowercase, number, and special character.";

export const PASSWORD_ERROR_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const isValidPassword = (password) => PASSWORD_REGEX.test(password || "");

export const validatePassword = (password) => {
  if (isValidPassword(password)) {
    return { valid: true, message: "" };
  }
  return { valid: false, message: PASSWORD_ERROR_MESSAGE };
};
