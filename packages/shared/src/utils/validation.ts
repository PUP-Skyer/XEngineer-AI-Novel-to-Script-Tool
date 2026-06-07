export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidUsername = (username: string): boolean => /^[a-zA-Z0-9_]{3,20}$/.test(username);
export const isValidPassword = (password: string): boolean => password.length >= 8;
export const isValidRoomCode = (code: string): boolean => /^[A-Z0-9]{6}$/.test(code);
