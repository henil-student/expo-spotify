const { Album, Artist, Song } = require('../models');

exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.findAll({
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        }
      ],
      order: [['releaseDate', 'DESC']]
    });
    res.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ message: 'Error fetching albums' });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id, {
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name', 'imageUrl']
        },
        {
          model: Song,
          as: 'songs',
          attributes: ['id', 'title', 'duration', 'trackNumber', 'previewUrl', 'isPlayable'],
          order: [['trackNumber', 'ASC']]
        }
      ]
    });

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ message: 'Error fetching album details' });
  }
};

exports.createAlbum = async (req, res) => {
  try {
    const { title, artistId, coverUrl, releaseDate, type, genres } = req.body;

    if (!title || !artistId) {
      return res.status(400).json({ message: 'Title and artist ID are required' });
    }

    // Verify artist exists
    const artist = await Artist.findByPk(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const album = await Album.create({
      title,
      artistId,
      coverUrl,
      releaseDate,
      type,
      genres: Array.isArray(genres) ? genres : genres?.split(',')
    });

    // Return created album with artist details
    const albumWithDetails = await Album.findByPk(album.id, {
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json(albumWithDetails);
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).json({ message: 'Error creating album' });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, coverUrl, releaseDate, type, genres } = req.body;

    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    await album.update({
      title: title || album.title,
      coverUrl: coverUrl || album.coverUrl,
      releaseDate: releaseDate || album.releaseDate,
      type: type || album.type,
      genres: genres ? (Array.isArray(genres) ? genres : genres.split(',')) : album.genres
    });

    // Return updated album with relationships
    const updatedAlbum = await Album.findByPk(id, {
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        },
        {
          model: Song,
          as: 'songs',
          attributes: ['id', 'title', 'trackNumber'],
          order: [['trackNumber', 'ASC']]
        }
      ]
    });

    res.json(updatedAlbum);
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(500).json({ message: 'Error updating album' });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Album.findByPk(id);
    
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    await album.destroy();
    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).json({ message: 'Error deleting album' });
  }
};

exports.getAlbumSongs = async (req, res) => {
  try {
    const { id } = req.params;
    const songs = await Song.findAll({
      where: { albumId: id },
      order: [['trackNumber', 'ASC']],
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(songs);
  } catch (error) {
    console.error('Error fetching album songs:', error);
    res.status(500).json({ message: 'Error fetching album songs' });
  }
};
