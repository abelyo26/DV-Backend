const validNewUser = {
  email: 'john@mailer.com',
  firstName: 'John',
  lastName: 'Wick',
  password: '@12345Ab!',
};

const duplicateEmailUser = {
  email: validNewUser.email,
  firstName: 'Yon',
  lastName: 'Vick',
  password: '$A4e52323dsaA;',
};

const wrongEmailTypeUser = {
  ...validNewUser,
  email: 'tsa',
};

const missingFirstNameUser = {
  email: 'vork@mail.com',
  lastName: 'Vork',
  password: '@#8867y98bjkik?A',
};

const validUserCredential = {
  email: validNewUser.email,
  password: validNewUser.password,
};

export {
  validNewUser,
  validUserCredential,
  duplicateEmailUser,
  wrongEmailTypeUser,
  missingFirstNameUser,
};
