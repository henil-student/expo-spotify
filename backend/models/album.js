'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Album extends Model {
    static associate(models) {
      // Album belongs to Artist
      Album.belongsTo(models.Artist, {
        foreignKey: 'artistId',
        as: 'artist'
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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    artistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Artists',
        key: 'id'
      }
    },
    coverUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('album', 'single', 'ep'),
      defaultValue: 'album'
    },
    genres: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('genres');
        return rawValue ? rawValue.split(',') : [];
      },
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue('genres', val.join(','));
        } else {
          this.setDataValue('genres', val);
        }
      }
    },
    totalTracks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    popularity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Album',
    timestamps: true,
    paranoid: true,
  });

  return Album;
};
