const mongoose = require('mongoose');

const dbconnect = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/fulllogin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to Database");
}

dbconnect()
  .catch((err) => console.error(err))

module.exports = mongoose;

