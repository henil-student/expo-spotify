'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Artists', [
      {
        name: 'The Beatles',
        biography: 'The most influential band of all time.',
        imageUrl: 'https://example.com/beatles.jpg',
        genres: 'rock,pop',
        monthlyListeners: 1000000,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pink Floyd',
        biography: 'Legendary progressive rock band.',
        imageUrl: 'https://example.com/pink-floyd.jpg',
        genres: 'rock,progressive rock',
        monthlyListeners: 800000,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Queen',
        biography: 'Iconic rock band led by Freddie Mercury.',
        imageUrl: 'https://example.com/queen.jpg',
        genres: 'rock,classic rock',
        monthlyListeners: 900000,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Artists', null, {});
  }
};
