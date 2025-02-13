const Sauce = require('../models/sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const userId = req.auth.userId;
      const userLiked = sauce.usersLiked.includes(userId);
      const userDisliked = sauce.usersDisliked.includes(userId);

      if (req.body.like === 1 && !userLiked) {
        sauce.usersLiked.push(userId);
        sauce.likes++;
      } else if (req.body.like === -1 && !userDisliked) {
        sauce.usersDisliked.push(userId);
        sauce.dislikes++;
      } else if ((req.body.like === 0 && userLiked) || (req.body.like === 0 && userDisliked)) {
        const indexLiked = sauce.usersLiked.indexOf(userId);
        if (indexLiked !== -1) {
          sauce.usersLiked.splice(indexLiked, 1);
          sauce.likes--;
        }
        const indexDisliked = sauce.usersDisliked.indexOf(userId);
        if (indexDisliked !== -1) {
          sauce.usersDisliked.splice(indexDisliked, 1);
          sauce.dislikes--;
        }
      }

      Sauce.updateOne({ _id: req.params.id }, sauce)
        .then(() => res.status(200).json({ message: 'Like/dislike mis à jour !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
};
