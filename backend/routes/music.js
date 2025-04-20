const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const artistController = require('../controllers/artistController');
const albumController = require('../controllers/albumController');
const songController = require('../controllers/songController');
const searchController = require('../controllers/searchController'); // Import search controller

// Artist routes
router.get('/artists', artistController.getAllArtists);
router.get('/artists/:id', artistController.getArtistById);
router.get('/artists/:id/albums', artistController.getArtistAlbums);
router.get('/artists/:id/songs', artistController.getArtistSongs); // Add route for artist songs
router.post('/artists', authenticate, artistController.createArtist);
router.put('/artists/:id', authenticate, artistController.updateArtist);
router.delete('/artists/:id', authenticate, artistController.deleteArtist);

// Album routes
router.get('/albums', albumController.getAllAlbums);
router.get('/albums/:id', albumController.getAlbumById);
router.get('/albums/:id/songs', albumController.getAlbumSongs); // Note: This exists, might conflict if not careful? No, different base path.
router.post('/albums', authenticate, albumController.createAlbum);
router.put('/albums/:id', authenticate, albumController.updateAlbum);
router.delete('/albums/:id', authenticate, albumController.deleteAlbum);

// Song routes
router.get('/songs', songController.getAllSongs);
router.get('/songs/popular', songController.getPopularSongs);
router.get('/songs/:id', songController.getSongById);
router.post('/songs', authenticate, songController.createSong);
router.put('/songs/:id', authenticate, songController.updateSong);
router.delete('/songs/:id', authenticate, songController.deleteSong);

// Search route
router.get('/search', searchController.searchAll);

module.exports = router;
