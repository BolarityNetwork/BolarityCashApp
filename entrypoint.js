// entrypoint.js

// Import required polyfills first
// IMPORTANT: These polyfills must be installed in this order
import "react-native-get-random-values";
import "@ethersproject/shims";
// Import Nativewind CSS
import "./global.css";
// Then import the expo router
import "expo-router/entry";
