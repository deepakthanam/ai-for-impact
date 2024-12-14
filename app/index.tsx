import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);

  // Image Picker Handlers
  const handleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery access is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera access is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Location Handler
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Location access is required!");
      return;
    }

    const locationData = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
    });
  };

  // API Call Handler
  const handleSubmit = async () => {
    if (!image || !description || !location) {
      Alert.alert(
        "Incomplete Details",
        "Please fill all fields before submitting."
      );
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: image,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    formData.append("latitude", location.latitude.toString());
    formData.append("longitude", location.longitude.toString());
    formData.append("description", description);

    try {
      const response = await fetch("http://34.58.174.187:5000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Thank You", "Child details are uploaded to the system.");
        // Reset state after successful submission
        setImage(null);
        setDescription("");
        setLocation(null);
      } else {
        Alert.alert("Error", "Failed to upload details. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again later.");
      console.error(error);
    }
  };

  if (currentPage === "home") {
    return (
      <View style={styles.container}>
        {/* Insert Logo */}
        <Image
          source={require("../assets/images/logo.png")} // Ensure the path matches your project structure
          style={styles.logo}
        />
        <TouchableOpacity
          style={styles.enterButton}
          onPress={() => setCurrentPage("main")}
        >
          <Text style={styles.enterButtonText}>Enter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentPage === "main") {
    return (
      <View style={styles.mainContainer}>
        {/* Top Menu Bar */}
        <View style={styles.header}>
          <Text style={styles.headerText}>My Application</Text>
        </View>
        <View style={styles.body}>
          {/* Upload Image Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Alert.alert("Upload Image", "Choose an option", [
                { text: "Camera", onPress: handleCamera },
                { text: "Gallery", onPress: handleImagePicker },
              ])
            }
          >
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
          {/* Display Selected Image */}
          {image && (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          )}
          {/* Add Information Field */}
          <TextInput
            style={styles.textInput}
            placeholder="Add Description"
            value={description}
            onChangeText={setDescription}
          />
          {/* Add Location Details */}
          <TouchableOpacity style={styles.button} onPress={getLocation}>
            <Text style={styles.buttonText}>Add Location Details</Text>
          </TouchableOpacity>
          {/* Display Location Details */}
          {location && (
            <Text style={styles.locationText}>
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </Text>
          )}
        </View>
        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  enterButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 5,
  },
  enterButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    alignItems: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginVertical: 10,
  },
  locationText: {
    marginTop: 10,
    fontSize: 14,
    color: "#555555",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
