const { Artist, Album, Song } = require('../models');

exports.getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.findAll({
      attributes: ['id', 'name', 'imageUrl', 'genres', 'monthlyListeners', 'verified'],
      order: [['name', 'ASC']]
    });
    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ message: 'Error fetching artists' });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    // Note: This currently fetches all albums and all their songs, which might be excessive.
    // Consider fetching only basic artist info here and letting the frontend fetch albums/songs separately.
    const artist = await Artist.findByPk(req.params.id);
    // Removed includes for albums/songs to keep this focused on artist details
    // const artist = await Artist.findByPk(req.params.id, {
    //   include: [
    //     {
    //       model: Album,
    //       as: 'albums',
    //       attributes: ['id', 'title', 'coverUrl', 'releaseDate', 'type'],
    //       include: [
    //         {
    //           model: Song,
    //           as: 'songs',
    //           attributes: ['id', 'title', 'duration', 'trackNumber']
    //         }
    //       ]
    //     }
    //   ]
    // });

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json(artist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ message: 'Error fetching artist details' });
  }
};

exports.createArtist = async (req, res) => {
  try {
    const { name, biography, imageUrl, genres } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const artist = await Artist.create({
      name,
      biography,
      imageUrl,
      genres: Array.isArray(genres) ? genres : genres?.split(','),
    });

    res.status(201).json(artist);
  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({ message: 'Error creating artist' });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, biography, imageUrl, genres } = req.body;

    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    await artist.update({
      name: name || artist.name,
      biography: biography || artist.biography,
      imageUrl: imageUrl || artist.imageUrl,
      genres: genres ? (Array.isArray(genres) ? genres : genres.split(',')) : artist.genres,
    });

    res.json(artist);
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ message: 'Error updating artist' });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByPk(id);

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    await artist.destroy();
    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({ message: 'Error deleting artist' });
  }
};

exports.getArtistAlbums = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if artist exists first (optional but good practice)
    const artistExists = await Artist.findByPk(id);
    if (!artistExists) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const albums = await Album.findAll({
      where: { artistId: id },
      // Removed song includes from here, fetch songs separately if needed per album
      // include: [
      //   {
      //     model: Song,
      //     as: 'songs',
      //     attributes: ['id', 'title', 'duration', 'trackNumber']
      //   }
      // ],
      order: [
        ['releaseDate', 'DESC'],
        ['type', 'ASC'],
        // Removed song ordering as songs are not included
        // [{ model: Song, as: 'songs' }, 'trackNumber', 'ASC']
      ]
    });

    res.json(albums);
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    res.status(500).json({ message: 'Error fetching artist albums' });
  }
};

// New function to get top songs for an artist
exports.getArtistSongs = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10; // Allow specifying limit via query param, default 10

    // Check if artist exists first
    const artistExists = await Artist.findByPk(id);
    if (!artistExists) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const songs = await Song.findAll({
      where: { artistId: id },
      order: [['popularity', 'DESC']], // Order by popularity
      limit: limit, // Limit the results
      include: [
        // Include album info needed for display/playback
        { model: Album, as: 'album', attributes: ['id', 'title', 'coverUrl'] },
        // Optionally include artist info again if needed by frontend structure
        // { model: Artist, as: 'artist', attributes: ['id', 'name'] }
      ]
    });

    res.json(songs);
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    res.status(500).json({ message: 'Error fetching artist songs' });
  }
};
