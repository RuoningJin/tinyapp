const findUser = (targetEmail, database) => {
  for (const user in database) {
    if (database[user].email === targetEmail) {
      return database[user];
    }
  }
  return null;
};

module.exports = findUser;