'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserLikes', {
      id: { // Optional: Add a primary key to the join table itself
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Or 'SET NULL' if you want to keep likes even if user/song is deleted
      },
      songId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Songs', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Automatically set creation time
      },
      updatedAt: { // Keep updatedAt for consistency, though less critical for a join table
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    // Add a unique constraint to prevent duplicate likes
    await queryInterface.addConstraint('UserLikes', {
      fields: ['userId', 'songId'],
      type: 'unique',
      name: 'unique_user_song_like'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserLikes');
  }
};
