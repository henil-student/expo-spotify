'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Artist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Artist has many Albums
      Artist.hasMany(models.Album, {
        foreignKey: 'artistId',
        as: 'albums'
      });
      // Artist has many Songs
      Artist.hasMany(models.Song, {
        foreignKey: 'artistId',
        as: 'songs'
      });
    }
  }
  Artist.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    }
  }, {
    sequelize,
    modelName: 'Artist',
  });
  return Artist;
};
