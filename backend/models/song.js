'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Song belongs to an Album
      Song.belongsTo(models.Album, {
        foreignKey: 'albumId',
        onDelete: 'CASCADE'
      });
      // Song belongs to an Artist
      Song.belongsTo(models.Artist, {
        foreignKey: 'artistId',
        onDelete: 'CASCADE'
      });
    }
  }
  Song.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    trackNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
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
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    }
  }, {
    sequelize,
    modelName: 'Song',
  });
  return Song;
};
