const { Artist, Album, Song } = require('../models');
const { Op } = require('sequelize');

// Controller function to search across artists, albums, and songs
exports.searchAll = async (req, res) => {
  const query = req.query.q;

  // Basic validation: If query is empty or too short, return empty results
  if (!query || query.trim().length < 1) { // Adjust min length if needed
    return res.json({ artists: [], albums: [], songs: [] });
  }

  const searchTerm = `%${query}%`; // Prepare search term for LIKE query

  try {
    // Perform searches in parallel
    const [artists, albums, songs] = await Promise.all([
      // Search Artists by name
      Artist.findAll({
        where: {
          name: {
            [Op.like]: searchTerm // Use Op.like for broader compatibility (SQLite default is case-insensitive)
          }
        },
        limit: 10 // Limit results per category
      }),
      // Search Albums by title, include Artist info
      Album.findAll({
        where: {
          title: {
            [Op.like]: searchTerm // Use Op.like
          }
        },
        include: [{ model: Artist, as: 'artist' }], // Include associated artist
        limit: 10
      }),
      // Search Songs by title, include Artist and Album info
      Song.findAll({
        where: {
          title: {
            [Op.like]: searchTerm // Use Op.like
          }
        },
        include: [
          { model: Artist, as: 'artist' },
          { model: Album, as: 'album', attributes: ['id', 'title', 'coverUrl'] } // Include relevant album info
        ],
        limit: 15 // Maybe allow more song results
      })
    ]);

    // Return structured results
    res.json({ artists, albums, songs });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error performing search', error: error.message });
  }
};
