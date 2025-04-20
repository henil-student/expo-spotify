import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

import preloadFonts from './preloadFonts'; // This now exports the font map object
import preloadImages from './preloadImages';

// cache fonts
// /////////////////////////////////////////////////////////////////////////////
// Receives the font map object directly and calls Font.loadAsync
const cacheFonts = (fontMap) => Font.loadAsync(fontMap);

// cache images
// /////////////////////////////////////////////////////////////////////////////
// This function remains the same
const cacheImages = (images) =>
  Object.values(images).map((image) => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    }

    return Asset.fromModule(image).downloadAsync();
  });

// preload async
// /////////////////////////////////////////////////////////////////////////////
const loadAssetsAsync = async () => {
  // preload assets
  // cacheFonts now returns a single promise for all fonts
  const fontAssetsPromise = cacheFonts(preloadFonts);
  // cacheImages still returns an array of promises for images
  const imageAssetsPromises = cacheImages(preloadImages);

  // promise load all: the single font promise and the array of image promises
  return Promise.all([fontAssetsPromise, ...imageAssetsPromises]);
};

// format milliseconds to M:SS
// /////////////////////////////////////////////////////////////////////////////
const formatTime = (millis) => {
  // Check for invalid input (null, undefined, NaN)
  if (millis === null || millis === undefined || isNaN(millis) || millis < 0) {
      return '0:00'; 
  }
  
  // Convert milliseconds to total seconds
  const totalSeconds = Math.floor(millis / 1000);
  
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Helper function to pad seconds with a leading zero if needed
  const padTime = (num) => String(num).padStart(2, '0');

  // Return formatted string M:SS
  return `${minutes}:${padTime(seconds)}`;
};


// format numbers (e.g., add commas)
// /////////////////////////////////////////////////////////////////////////////
const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  // Basic check if it's a valid number
  if (isNaN(Number(num))) return '';
  // Use Intl.NumberFormat for locale-aware formatting
  try {
    return new Intl.NumberFormat().format(num);
  } catch (e) {
    console.error("Error formatting number:", num, e);
    return num.toString(); // Fallback to string conversion
  }
};

// Revert to default export to maintain consistency with how it might be used elsewhere
export default {
  loadAssetsAsync,
  formatTime,
  formatNumber
};

// Remove named exports
// export { loadAssetsAsync, formatTime, formatNumber };
