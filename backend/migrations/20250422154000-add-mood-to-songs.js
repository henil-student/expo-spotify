'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Songs', 'mood', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'neutral'
    });

    // Add index for the new mood column
    await queryInterface.addIndex('Songs', ['mood']);
  },

  async down(queryInterface, Sequelize) {
    // Remove the index first
    await queryInterface.removeIndex('Songs', ['mood']);
    
    // Then remove the column
    await queryInterface.removeColumn('Songs', 'mood');
  }
};
