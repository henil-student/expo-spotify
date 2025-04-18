'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get the artists we created
    const artists = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Artists";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create a map of artist names to IDs
    const artistMap = artists.reduce((acc, artist) => {
      acc[artist.name] = artist.id;
      return acc;
    }, {});

    return queryInterface.bulkInsert('Albums', [
      {
        title: 'Abbey Road',
        artistId: artistMap['The Beatles'],
        coverUrl: 'https://example.com/abbey-road.jpg',
        releaseDate: new Date('1969-09-26'),
        type: 'album',
        genres: 'rock,pop',
        totalTracks: 17,
        popularity: 95,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Dark Side of the Moon',
        artistId: artistMap['Pink Floyd'],
        coverUrl: 'https://example.com/dark-side.jpg',
        releaseDate: new Date('1973-03-01'),
        type: 'album',
        genres: 'rock,progressive rock',
        totalTracks: 10,
        popularity: 98,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'A Night at the Opera',
        artistId: artistMap['Queen'],
        coverUrl: 'https://example.com/night-at-opera.jpg',
        releaseDate: new Date('1975-11-21'),
        type: 'album',
        genres: 'rock,classic rock',
        totalTracks: 12,
        popularity: 92,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Sgt. Pepper\'s Lonely Hearts Club Band',
        artistId: artistMap['The Beatles'],
        coverUrl: 'https://example.com/sgt-pepper.jpg',
        releaseDate: new Date('1967-06-01'),
        type: 'album',
        genres: 'rock,psychedelic rock',
        totalTracks: 13,
        popularity: 96,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'The Wall',
        artistId: artistMap['Pink Floyd'],
        coverUrl: 'https://example.com/the-wall.jpg',
        releaseDate: new Date('1979-11-30'),
        type: 'album',
        genres: 'rock,progressive rock',
        totalTracks: 26,
        popularity: 94,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Albums', null, {});
  }
};
