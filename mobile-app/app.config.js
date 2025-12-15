export default {
  expo: {
    name: "Hamere Trufat",
    slug: "hamere-trufat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.hameretrufat.app",
      buildNumber: "1",
      infoPlist: {
        NSPhotoLibraryUsageDescription: "We need access to your photos to upload images.",
        NSCameraUsageDescription: "We need access to your camera to take photos.",
        NSMicrophoneUsageDescription: "We need access to your microphone for audio recordings."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.hameretrufat.app",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS",
        "RECORD_AUDIO"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.hameretrufat.com/api/v1",
      useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA !== "false"
    },
    plugins: [
      "expo-router",
      "expo-av",
      "expo-notifications",
      [
        "expo-calendar",
        {
          calendarPermission: "Allow Hamere Trufat to access your calendar to add events."
        }
      ]
    ]
  }
};


