'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Artist extends Model {
    static associate(models) {
      // Artist has many Albums
      Artist.hasMany(models.Album, {
        foreignKey: 'artistId',
        as: 'albums'
      });

      // Artist has many Songs through Albums
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
      validate: {
        notEmpty: true
      }
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    genres: {
      type: DataTypes.STRING, // Comma-separated list of genres
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
    monthlyListeners: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Artist',
    // Add timestamps
    timestamps: true,
    // Enable soft deletes
    paranoid: true,
  });

  return Artist;
};
