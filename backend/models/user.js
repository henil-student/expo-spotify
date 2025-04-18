'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here when we add more models
      // For example:
      // User.hasMany(models.Playlist)
    }
  }
  
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
        notEmpty: true
      }
    },
    lastLoginAt: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'User',
    // Add timestamps by default
    timestamps: true,
    // Don't delete records, just set deletedAt
    paranoid: true,
    hooks: {
      beforeSave: async (user) => {
        // You can add hooks here if needed
        // For example, updating lastLoginAt on login
      }
    }
  });

  return User;
};
