const { Song, Album, Artist } = require('../models');
const { Op } = require('sequelize'); // Import Op for operators

exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.findAll({
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'title', 'coverUrl']
        }
      ],
      order: [['title', 'ASC']]
    });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Error fetching songs' });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id, {
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name', 'imageUrl']
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'title', 'coverUrl', 'releaseDate']
        }
      ]
    });

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Error fetching song details' });
  }
};

exports.createSong = async (req, res) => {
  try {
    const {
      title,
      albumId,
      artistId,
      duration,
      trackNumber,
      audioUrl,
      previewUrl,
      explicit,
      isPlayable,
      mood // Include mood in creation
    } = req.body;

    if (!title || !albumId || !artistId) {
      return res.status(400).json({ 
        message: 'Title, album ID, and artist ID are required' 
      });
    }

    // Verify album and artist exist
    const [album, artist] = await Promise.all([
      Album.findByPk(albumId),
      Artist.findByPk(artistId)
    ]);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Validate mood if provided
    const validMoods = ['happy', 'calm', 'neutral'];
    if (mood && !validMoods.includes(mood)) {
      return res.status(400).json({ message: `Invalid mood. Must be one of: ${validMoods.join(', ')}` });
    }

    const song = await Song.create({
      title,
      albumId,
      artistId,
      duration,
      trackNumber,
      audioUrl,
      previewUrl,
      explicit,
      isPlayable,
      mood: mood || 'neutral' // Use provided mood or default
    });

    // Return created song with relationships
    const songWithDetails = await Song.findByPk(song.id, {
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'title', 'coverUrl']
        }
      ]
    });

    res.status(201).json(songWithDetails);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ message: 'Error creating song' });
  }
};

exports.updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      duration,
      trackNumber,
      audioUrl,
      previewUrl,
      explicit,
      isPlayable,
      mood // Include mood in update
    } = req.body;

    const song = await Song.findByPk(id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Validate mood if provided
    const validMoods = ['happy', 'calm', 'neutral'];
    if (mood && !validMoods.includes(mood)) {
      return res.status(400).json({ message: `Invalid mood. Must be one of: ${validMoods.join(', ')}` });
    }

    await song.update({
      title: title || song.title,
      duration: duration || song.duration,
      trackNumber: trackNumber || song.trackNumber,
      audioUrl: audioUrl || song.audioUrl,
      previewUrl: previewUrl || song.previewUrl,
      explicit: explicit !== undefined ? explicit : song.explicit,
      isPlayable: isPlayable !== undefined ? isPlayable : song.isPlayable,
      mood: mood || song.mood // Update mood if provided
    });

    // Return updated song with relationships
    const updatedSong = await Song.findByPk(id, {
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'title', 'coverUrl']
        }
      ]
    });

    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ message: 'Error updating song' });
  }
};

exports.deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByPk(id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    await song.destroy();
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'Error deleting song' });
  }
};

exports.getPopularSongs = async (req, res) => {
  try {
    const songs = await Song.findAll({
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'title', 'coverUrl']
        }
      ],
      order: [['popularity', 'DESC']],
      limit: 20
    });

    res.json(songs);
  } catch (error) {
    console.error('Error fetching popular songs:', error);
    res.status(500).json({ message: 'Error fetching popular songs' });
  }
};

// New function to get songs by mood
exports.getSongsByMood = async (req, res) => {
  try {
    const { mood } = req.params;
    const validMoods = ['happy', 'calm', 'neutral'];

    // Validate mood parameter
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ message: `Invalid mood parameter. Must be one of: ${validMoods.join(', ')}` });
    }

    const songs = await Song.findAll({
      where: {
        mood: mood
      },
      include: [
        {
          model: Artist,
          as: 'artist',
          attributes: ['id', 'name']
        },
        {
          model: Album,
          as: 'album',
          attributes: ['id', 'title', 'coverUrl']
        }
      ],
      order: [['popularity', 'DESC']], // Optionally order by popularity or randomly
      limit: 50 // Limit the number of songs returned
    });

    if (!songs || songs.length === 0) {
      return res.status(404).json({ message: `No songs found for mood: ${mood}` });
    }

    res.json(songs);
  } catch (error) {
    console.error(`Error fetching songs for mood ${req.params.mood}:`, error);
    res.status(500).json({ message: 'Error fetching songs by mood' });
  }
};
