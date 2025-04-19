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

    // Use a valid test URL for all previews temporarily
    const testPreviewUrl = 'https://storage.googleapis.com/exoplayer-test-media-0/Jazz_In_Paris.mp3';

    return queryInterface.bulkInsert('Songs', [
      // Abbey Road Songs
      {
        title: 'Come Together',
        albumId: albumMap['Abbey Road'].id,
        artistId: albumMap['Abbey Road'].artistId,
        duration: 259,
        trackNumber: 1,
        previewUrl: testPreviewUrl, // Updated
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
        previewUrl: testPreviewUrl, // Updated
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
        previewUrl: testPreviewUrl, // Updated
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
        previewUrl: testPreviewUrl, // Updated
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
        previewUrl: testPreviewUrl, // Updated
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
        previewUrl: testPreviewUrl, // Updated
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
        previewUrl: testPreviewUrl, // Updated
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
        previewUrl: testPreviewUrl, // Updated
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
