import React, { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  InputAccessoryView,
  ScrollView,
} from 'react-native';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useUserProfile } from '@/hooks/useUserProgfile';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as ImagePicker from 'expo-image-picker';
import { Id } from '@/convex/_generated/dataModel';

type ThreadComposerProps = {
  isPreview?: boolean;
  isReply?: boolean;
  threadId?: Id<'messages'>;
};

const ThreadComposer: React.FC<ThreadComposerProps> = ({ isPreview, isReply, threadId }) => {
  const router = useRouter();
  const [threadContent, setThreadContent] = useState('');
  const { userProfile } = useUserProfile();
  const inputAccessoryViewID = 'uniqueID';
  const addThread = useMutation(api.messages.addThread);
  const [mediaFiles, setMediaFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const handleSubmit = async () => {
    const mediaStorageIds = await Promise.all(mediaFiles.map((file) => uploadMediaFile(file)));
    addThread({ threadId, content: threadContent, mediaFiles: mediaStorageIds });
    setThreadContent('');
    setMediaFiles([]);
    router.dismiss();
  };

  const handleCancel = () => {
    if (!threadContent && mediaFiles.length === 0) {
      router.dismiss();
      return;
    }
    
    Alert.alert('Discard post?', '', [
      {
        text: 'Discard',
        onPress: () => {
          setThreadContent('');
          setMediaFiles([]);
          router.dismiss();
        },
        style: 'destructive',
      },
      {
        text: 'Save Draft',
        style: 'cancel',
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const removeThread = () => {
    setThreadContent('');
    setMediaFiles([]);
  };

  const selectImage = async (source: 'camera' | 'library') => {
    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [7, 7],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    };

    let result;

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      setMediaFiles([result.assets[0], ...mediaFiles]);
    }
  };

  const removeImage = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const uploadMediaFile = async (image: ImagePicker.ImagePickerAsset) => {
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();

    // Convert URI to blob
    const response = await fetch(image!.uri);
    const blob = await response.blob();

    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': image!.mimeType! },
      body: blob,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  const handlePreviewPress = () => {
    router.push('/(auth)/(modal)/create');
  };

  // If preview mode, show simplified clickable version
  if (isPreview) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: userProfile?.imageUrl as string }} style={styles.avatar} />
        <View style={styles.previewContent}>
          <TouchableOpacity 
            style={styles.previewTextContainer}
            onPress={handlePreviewPress}>
            <Text style={styles.previewText}>What's new?</Text>
          </TouchableOpacity>
          <View style={styles.previewIconRow}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => {
                handlePreviewPress();
                // After navigation, trigger image picker
                setTimeout(() => selectImage('library'), 500);
              }}>
              <Ionicons name="images-outline" size={20} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => {
                handlePreviewPress();
                // After navigation, trigger camera
                setTimeout(() => selectImage('camera'), 500);
              }}>
              <Ionicons name="camera-outline" size={20} color={Colors.border} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Full composer mode
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'New Post',
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={!threadContent.trim() && mediaFiles.length === 0}
              style={[
                styles.postButton,
                (!threadContent.trim() && mediaFiles.length === 0) && styles.postButtonDisabled
              ]}>
              <Text style={[
                styles.postButtonText,
                (!threadContent.trim() && mediaFiles.length === 0) && styles.postButtonTextDisabled
              ]}>
                Post
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.fullContainer}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.topRow}>
            <Image source={{ uri: userProfile?.imageUrl as string }} style={styles.avatar} />
            <View style={styles.centerContainer}>
              <Text style={styles.name}>
                {userProfile?.first_name} {userProfile?.last_name}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={isReply ? 'Reply to post' : "What's new?"}
                placeholderTextColor={Colors.border}
                value={threadContent}
                onChangeText={setThreadContent}
                multiline
                autoFocus
                inputAccessoryViewID={inputAccessoryViewID}
              />
              {mediaFiles.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {mediaFiles.map((file, index) => (
                    <View key={index} style={styles.mediaContainer}>
                      <Image source={{ uri: file.uri }} style={styles.mediaImage} />
                      <TouchableOpacity
                        style={styles.deleteIconContainer}
                        onPress={() => removeImage(index)}>
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              <View style={styles.iconRow}>
                <TouchableOpacity style={styles.iconButton} onPress={() => selectImage('library')}>
                  <Ionicons name="images-outline" size={24} color={Colors.border} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => selectImage('camera')}>
                  <Ionicons name="camera-outline" size={24} color={Colors.border} />
                </TouchableOpacity>
              </View>
            </View>

            {(threadContent || mediaFiles.length > 0) && (
              <TouchableOpacity onPress={removeThread} style={styles.cancelButton}>
                <Ionicons name="close" size={24} color={Colors.border} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.keyboardAccessory}>
            <Text style={styles.keyboardAccessoryText}>
              {isReply
                ? 'Everyone can reply and quote'
                : 'Profiles that you follow can reply and quote'}
            </Text>
          </View>
        </InputAccessoryView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: 'white',
  },
  previewContent: {
    flex: 1,
  },
  previewTextContainer: {
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: Colors.border,
  },
  previewIconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  centerContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
  },
  cancelButton: {
    padding: 4,
  },
  iconRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  keyboardAccessory: {
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  keyboardAccessoryText: {
    color: Colors.border,
    fontSize: 12,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  postButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  postButtonDisabled: {
    backgroundColor: Colors.border,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  postButtonTextDisabled: {
    color: '#fff',
    opacity: 0.5,
  },
  mediaContainer: {
    position: 'relative',
    marginRight: 10,
    marginTop: 10,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  mediaImage: {
    width: 100,
    height: 200,
    borderRadius: 6,
  },
});

export default ThreadComposer