const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const PermitionError = require('../errors/permition-err');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send({ data: movies }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании фильма'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById({ _id: req.params.id })
    .orFail(() => new NotFoundError('Фильм с указанным _id не найдена'))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        throw new PermitionError('Нельзя удалить чужой фильм');
      }
      return movie.remove()
        .then(() => res.send(movie));
    })
    .catch(next);
};
