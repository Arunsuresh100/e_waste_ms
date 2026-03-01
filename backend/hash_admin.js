// hash_admin.js
const bcrypt = require('bcryptjs');

const plainPassword = 'admin123';
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds)
  .then(hashedPassword => {
    console.log("Your hashed admin password is:");
    console.log(hashedPassword);
    console.log("\nRun the db.logins.updateOne() command in mongosh with this hash.");
  });