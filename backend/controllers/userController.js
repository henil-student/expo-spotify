const { User, Song, UserLike } = require('../models'); // Adjust path as needed

// Get all songs liked by the authenticated user
exports.getLikedSongs = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware adds user to req

    // Find the user and include their liked songs
    // We only need the IDs for the frontend context initially
    const userWithLikes = await User.findByPk(userId, {
      include: [{
        model: Song,
        as: 'likedSongs',
        attributes: ['id'], // Only fetch the song IDs
        through: { attributes: [] } // Don't include attributes from the UserLike join table
      }]
    });

    if (!userWithLikes) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract just the song IDs
    const likedSongIds = userWithLikes.likedSongs.map(song => song.id);

    res.status(200).json(likedSongIds);

  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res.status(500).json({ message: 'Error fetching liked songs', error: error.message });
  }
};

// Like a specific song
exports.likeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: 'Song ID is required' });
    }

    // Check if the song exists (optional but good practice)
    const song = await Song.findByPk(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Create the like association (or find if it already exists)
    // findOrCreate prevents errors if the user tries to like the same song twice quickly
    const [like, created] = await UserLike.findOrCreate({
      where: { userId: userId, songId: songId },
      defaults: { userId: userId, songId: songId } // Values to use if creating
    });

    if (created) {
      res.status(201).json({ message: 'Song liked successfully', like });
    } else {
      res.status(200).json({ message: 'Song was already liked', like });
    }

  } catch (error) {
    console.error("Error liking song:", error);
     // Handle potential unique constraint violation gracefully if findOrCreate wasn't used
     if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Song already liked' });
     }
    res.status(500).json({ message: 'Error liking song', error: error.message });
  }
};

// Unlike a specific song
exports.unlikeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.params; // Get songId from URL parameters

    if (!songId) {
      return res.status(400).json({ message: 'Song ID is required in URL parameter' });
    }

    // Find and delete the like association
    const deletedCount = await UserLike.destroy({
      where: {
        userId: userId,
        songId: songId
      }
    });

    if (deletedCount > 0) {
      res.status(200).json({ message: 'Song unliked successfully' });
    } else {
      // This could mean the song wasn't liked in the first place, or the songId/userId was wrong
      res.status(404).json({ message: 'Like not found or already removed' });
    }

  } catch (error) {
    console.error("Error unliking song:", error);
    res.status(500).json({ message: 'Error unliking song', error: error.message });
  }
};
