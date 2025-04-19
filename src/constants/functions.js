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
  const padTime = (num, size) => `000${num}`.slice(size * -1);
  const time = parseFloat(sec).toFixed(3);
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time - minutes * 60);

  return `${padTime(minutes, 1)}:${padTime(seconds, 2)}`;
};

export default {
  // cacheFonts is internal to loadAssetsAsync now, no need to export?
  // cacheImages is internal to loadAssetsAsync now, no need to export?
  loadAssetsAsync, // Export the main loading function
  formatTime
};
