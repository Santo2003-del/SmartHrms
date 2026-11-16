/**
 * High-Accuracy Location Fetcher (Disabled)
 */
export const getHighAccuracyLocation = () => {
  return Promise.resolve({
    lat: 0,
    lng: 0,
    accuracy: 0
  });
};