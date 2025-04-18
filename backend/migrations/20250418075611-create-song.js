'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Songs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      albumId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Albums',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      artistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Artists',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      trackNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      audioUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      explicit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      popularity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      previewUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isPlayable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('Songs', ['albumId']);
    await queryInterface.addIndex('Songs', ['artistId']);
    await queryInterface.addIndex('Songs', ['title']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Songs');
  }
};
