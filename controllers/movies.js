const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const PermitionError = require('../errors/permition-err');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .populate('owner')
    .then((movies) => res.send({ data: movies }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    name, link,
  } = req.body;

  Movie.create({
    name, link, owner: req.user._id,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById({ _id: req.params.MovieId })
    .orFail(() => new NotFoundError('Карточка с указанным _id не найдена'))
    .then((movie) => {
      if (!Movie.owner.equals(req.user._id)) {
        throw new PermitionError('Нельзя удалить чужую карточку');
      }
      return Movie.remove()
        .then(() => res.send(movie));
    })
    .catch(next);
};
