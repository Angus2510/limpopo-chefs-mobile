// Image assets index
// Add your images here for easy importing

export const images = {
  // Example: logo: require('./logo.png'),
  // Example: placeholder: require('./placeholder.jpg'),

  // App icons (from root assets folder)
  icon: require("../../../assets/icon.png"),
  adaptiveIcon: require("../../../assets/adaptive-icon.png"),
  splashIcon: require("../../../assets/splash-icon.png"),
  favicon: require("../../../assets/favicon.png"),

  // Add your custom images here:
  // profilePlaceholder: require('./profile-placeholder.png'),
  logo: require("./logo.png"), // Your app logo - add logo.png to src/assets/images/
  // Temporary fallback to existing icon if logo.png doesn't exist yet:
  // logo: require('../../../assets/icon.png'),
  // yourImage: require('./your-image.png'),
};

export default images;
