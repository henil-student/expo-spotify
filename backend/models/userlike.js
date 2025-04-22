'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here if needed, though typically the associations
      // are defined on the primary models (User, Song) referencing this join table.
      // Example: If you wanted to access the User or Song directly from a UserLike instance:
      // UserLike.belongsTo(models.User, { foreignKey: 'userId' });
      // UserLike.belongsTo(models.Song, { foreignKey: 'songId' });
    }
  }
  UserLike.init({
    // id is implicitly defined by Sequelize if not specified here, 
    // but we added it in the migration, so it's good practice to include it
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Optional: Define references here too for clarity/validation
        model: 'Users',
        key: 'id'
      }
    },
    songId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Optional: Define references here too for clarity/validation
        model: 'Songs',
        key: 'id'
      }
    }
    // createdAt and updatedAt are automatically handled by Sequelize if timestamps: true (default)
  }, {
    sequelize,
    modelName: 'UserLike',
    // Optional: Explicitly define the table name if it differs from the pluralized model name
    // tableName: 'UserLikes', 
    // timestamps: true // default is true
  });
  return UserLike;
};
