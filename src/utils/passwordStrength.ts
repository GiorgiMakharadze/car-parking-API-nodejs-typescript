export const passwordStrength = (password: string) => {
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return password.length >= 10 && hasNumber && hasSpecialChar;
};
