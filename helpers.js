const findUser = (targetEmail, database) => {
  for (const user in database) {
    if (database[user].email === targetEmail) {
      return database[user];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  const possChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += possChar.charAt(Math.floor(Math.random() * possChar.length));
  }
  return randomString;
};

const urlsForUser = (id, database) => {
  const userData = {};
  for (const data in database) {
    if (database[data].userID === id) {
      userData[data] = database[data];
    }
  }
  return userData;
};


module.exports = {findUser, generateRandomString, urlsForUser};