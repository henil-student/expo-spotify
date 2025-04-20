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

// format seconds
// /////////////////////////////////////////////////////////////////////////////
// This function remains the same
const formatTime = (sec) => {
  if (sec === null || sec === undefined || isNaN(sec)) return '0:00'; // Add check for invalid input
  const padTime = (num, size) => `000${num}`.slice(size * -1);
  const time = parseFloat(sec).toFixed(3);
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time - minutes * 60);

  return `${padTime(minutes, 1)}:${padTime(seconds, 2)}`;
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
