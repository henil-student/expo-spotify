'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get the albums and artists we created
    const albums = await queryInterface.sequelize.query(
      `SELECT id, title, "artistId" FROM "Albums";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const albumMap = albums.reduce((acc, album) => {
      acc[album.title] = { id: album.id, artistId: album.artistId };
      return acc;
    }, {});

    return queryInterface.bulkInsert('Songs', [
      // Abbey Road Songs
      {
        title: 'Come Together',
        albumId: albumMap['Abbey Road'].id,
        artistId: albumMap['Abbey Road'].artistId,
        duration: 259,
        trackNumber: 1,
        previewUrl: 'https://example.com/previews/come-together.mp3',
        popularity: 90,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Something',
        albumId: albumMap['Abbey Road'].id,
        artistId: albumMap['Abbey Road'].artistId,
        duration: 183,
        trackNumber: 2,
        previewUrl: 'https://example.com/previews/something.mp3',
        popularity: 88,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Dark Side of the Moon Songs
      {
        title: 'Breathe',
        albumId: albumMap['The Dark Side of the Moon'].id,
        artistId: albumMap['The Dark Side of the Moon'].artistId,
        duration: 163,
        trackNumber: 1,
        previewUrl: 'https://example.com/previews/breathe.mp3',
        popularity: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Time',
        albumId: albumMap['The Dark Side of the Moon'].id,
        artistId: albumMap['The Dark Side of the Moon'].artistId,
        duration: 421,
        trackNumber: 2,
        previewUrl: 'https://example.com/previews/time.mp3',
        popularity: 92,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // A Night at the Opera Songs
      {
        title: 'Bohemian Rhapsody',
        albumId: albumMap['A Night at the Opera'].id,
        artistId: albumMap['A Night at the Opera'].artistId,
        duration: 354,
        trackNumber: 1,
        previewUrl: 'https://example.com/previews/bohemian-rhapsody.mp3',
        popularity: 98,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Love of My Life',
        albumId: albumMap['A Night at the Opera'].id,
        artistId: albumMap['A Night at the Opera'].artistId,
        duration: 219,
        trackNumber: 2,
        previewUrl: 'https://example.com/previews/love-of-my-life.mp3',
        popularity: 87,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // The Wall Songs
      {
        title: 'Another Brick in the Wall, Pt. 2',
        albumId: albumMap['The Wall'].id,
        artistId: albumMap['The Wall'].artistId,
        duration: 239,
        trackNumber: 1,
        previewUrl: 'https://example.com/previews/another-brick.mp3',
        popularity: 95,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Comfortably Numb',
        albumId: albumMap['The Wall'].id,
        artistId: albumMap['The Wall'].artistId,
        duration: 382,
        trackNumber: 2,
        previewUrl: 'https://example.com/previews/comfortably-numb.mp3',
        popularity: 94,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Songs', null, {});
  }
};
