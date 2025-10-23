import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native'
import React, { useState } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as Sentry from '@sentry/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
const editProfile = () => {
    const { biostring, linkstring, userId, imageUrl } = useLocalSearchParams<{
        biostring: string;
        linkstring: string;
        userId: string;
        imageUrl: string;
      }>();
      const [bio, setBio] = useState(biostring);
      const [link, setLink] = useState(linkstring);
      const updateUser = useMutation(api.users.updateUser);
      const generateUploadUrl = useMutation(api.users.generateUploadUrl);
      const updateImage = useMutation(api.users.updateImage);
      const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
    
      const router = useRouter();
      const selectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
        });
        if (!result.canceled) {
          setSelectedImage(result.assets[0]);
        }
      };
      const onDone = async () => {
        updateUser({ _id: userId as Id<'users'>, bio, websiteUrl: link });
        Sentry.captureEvent({
          message: 'User Profile updated',
          extra: {
            bio,
            link,
          },
        }); 

        router.dismiss()
      };

    
  return (
    <View>
     <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={onDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity> 
          ),
        }}
      />
      <TouchableOpacity onPress={selectImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
        ) : (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
      </TouchableOpacity>
       <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Write a bio..."
          numberOfLines={4}
          multiline
          textAlignVertical="top"
          style={styles.bioInput}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Link</Text>
        <TextInput value={link} onChangeText={setLink} placeholder="Link" autoCapitalize="none" />
      </View>
    </View>
  )
}

export default editProfile

const styles = StyleSheet.create({
    section: {
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 4,
      padding: 8,
      margin: 16,
    },
    bioInput: {
      height: 100,
    },
    label: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    doneButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.submit,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: 'center',
    },
  });