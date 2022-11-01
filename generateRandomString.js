const generateRandomString = () => {
  const possChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += possChar.charAt(Math.floor(Math.random() * possChar.length));
  }
  return randomString;
};
