const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmedPassword } = req.body;

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
    }
    if (!email) {
      res.status(422).json({ message: "O email é obrigatório" });
    }
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória" });
    }
    if (!confirmedPassword) {
      res.status(422).json({ message: "A confirmação da senha é obrigatória" });
    }
    if (password !== confirmedPassword) {
      res.status(422).json({ message: "As senhas não coincidem" });
    }

    

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name,
      email: email,
      phone: phone,
      password: hashedPassword,
    });

    try {
      const newUser = await user.save();
      res.status(201).json({ message: "Usuário criado com sucesso!", user: newUser });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
};
