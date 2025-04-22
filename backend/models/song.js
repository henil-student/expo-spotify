'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      // Song belongs to Album
      Song.belongsTo(models.Album, {
        foreignKey: 'albumId',
        as: 'album'
      });

      // Song belongs to Artist
      Song.belongsTo(models.Artist, {
        foreignKey: 'artistId',
        as: 'artist'
      });

      // Song can be liked by many Users through UserLike table
      Song.belongsToMany(models.User, { 
        through: models.UserLike, 
        foreignKey: 'songId',   // key in the UserLike table that points to Song
        otherKey: 'userId',     // key in the UserLike table that points to User
        as: 'likedByUsers'    // Alias to use when fetching users who liked this song
      });

      // Additional associations can be added later:
      // - Song can belong to many Playlists
    }
  }

  Song.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    albumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Albums',
        key: 'id'
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
    duration: {
      type: DataTypes.INTEGER, // Duration in seconds
      allowNull: false,
      defaultValue: 0
    },
    trackNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true // For future use with actual audio files
    },
    explicit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    popularity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    previewUrl: {
      type: DataTypes.STRING,
      allowNull: true // 30s preview URL
    },
    isPlayable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Song',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['albumId']
      },
      {
        fields: ['artistId']
      }
    ]
  });

  return Song;
};
