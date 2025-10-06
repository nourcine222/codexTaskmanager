const User = require("../models/User");

exports.assignTask = async (req, res) => {
  try {
    const { userId, task } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    user.tasks.push({ description: task, assignedAt: new Date() });
    await user.save();
    res.status(200).json({ message: "Tâche attribuée avec succès", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json({ message: "Utilisateur bloqué", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json({ message: "Utilisateur activé", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
