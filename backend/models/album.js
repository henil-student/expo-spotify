'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Album extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Album belongs to an Artist
      Album.belongsTo(models.Artist, {
        foreignKey: 'artistId',
        onDelete: 'CASCADE'
      });
      // Album has many Songs
      Album.hasMany(models.Song, {
        foreignKey: 'albumId',
        as: 'songs'
      });
    }
  }
  Album.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    releaseYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900,
        max: new Date().getFullYear()
      }
    },
    coverArtUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    artistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Artists',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Album',
  });
  return Album;
};
