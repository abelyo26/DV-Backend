import readLine from 'readline';
import util from 'util';

import bcrypt from 'bcrypt';
import Joi from 'joi';

import connectToDb from '../../config/mongoose';

/**
 *
 * @param cleanPassword
 */
const generateHashedPassword = async (cleanPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(cleanPassword, salt);
  return hashedPassword;
};

/**
 *
 */
async function run() {
  const Reader = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = util.promisify(Reader.question).bind(Reader);
  const email = await question('Please enter admin email\n');
  const emailSchema = Joi.string().email().required();
  const { error: invalidEmail } = emailSchema.validate(email);

  /**
   *
   * @param msg
   */
  const exit = (msg) => {
    Reader.write(`\n${msg}`);
    Reader.close();
    process.exit(0);
  };
  if (invalidEmail) exit('Invalid Email');

  const password = await question('Please enter password\n');
  const passwordSchema = Joi.string().min(6).required();
  const { error: invalidPassword } = passwordSchema.validate(password);
  if (invalidPassword) exit('Invalid Password');

  Reader.write('Creating Admin user...');
  const db = await connectToDb();
  const User = db.connection.collection('users');

  const hashedPassword = await generateHashedPassword(password);
  await User.insertOne({
    email,
    password: hashedPassword,
    emailVerified: true,
    firstName: 'Admin',
    lastName: ' ',
    isSystemAdmin: true,
  });
  exit(`Account created \nEmail : ${email}\n Password:${password}\n`);
}
run();
