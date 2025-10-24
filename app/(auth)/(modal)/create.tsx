import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Image, TextInput, ScrollView, Alert, InputAccessoryView } from 'react-native'
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useUserProfile } from '@/hooks/useUserProgfile'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import * as ImagePicker from 'expo-image-picker'

const create = () => {
  const router = useRouter()
  const [threadContent, setThreadContent] = useState('')
  const { userProfile } = useUserProfile()
  const inputAccessoryViewID = 'uniqueID'
  const addThread = useMutation(api.messages.addThread)
  const [mediaFiles, setMediaFiles] = useState<ImagePicker.ImagePickerAsset[]>([])
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl)

  const handleSubmit = async () => {
    if (!threadContent.trim() && mediaFiles.length === 0) {
      Alert.alert('Empty Post', 'Please add some content or media to your post')
      return
    }

    try {
      const mediaStorageIds = await Promise.all(mediaFiles.map((file) => uploadMediaFile(file)))
      await addThread({ content: threadContent, mediaFiles: mediaStorageIds })
      setThreadContent('')
      setMediaFiles([])
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.')
      console.error('Error creating post:', error)
    }
  }

  const handleCancel = () => {
    if (threadContent.trim() || mediaFiles.length > 0) {
      Alert.alert('Discard post?', '', [
        {
          text: 'Discard',
          onPress: () => {
            setThreadContent('')
            setMediaFiles([])
            router.back()
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
      ])
    } else {
      router.back()
    }
  }

  const selectImage = async (source: 'camera' | 'library') => {
    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    }

    let result

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Camera permission is required to take photos')
        return
      }
      result = await ImagePicker.launchCameraAsync(options)
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options)
    }

    if (!result.canceled) {
      setMediaFiles([...mediaFiles, result.assets[0]])
    }
  }

  const removeImage = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
  }

  const uploadMediaFile = async (image: ImagePicker.ImagePickerAsset) => {
    const postUrl = await generateUploadUrl()
    const response = await fetch(image.uri)
    const blob = await response.blob()

    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': image.mimeType! },
      body: blob,
    })
    const { storageId } = await result.json()
    return storageId
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.topRow}>
          <Image 
            source={{ uri: userProfile?.imageUrl as string }} 
            style={styles.avatar} 
          />
          <View style={styles.centerContainer}>
            <Text style={styles.name}>
              {userProfile?.first_name} {userProfile?.last_name}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="What's new?"
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
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="gif" size={24} color={Colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="mic-outline" size={24} color={Colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <FontAwesome6 name="hashtag" size={24} color={Colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="stats-chart-outline" size={24} color={Colors.border} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <InputAccessoryView nativeID={inputAccessoryViewID}>
        <View style={styles.keyboardAccessory}>
          <Text style={styles.keyboardAccessoryText}>
            Profiles that you follow can reply and quote
          </Text>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!threadContent.trim() && mediaFiles.length === 0) && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!threadContent.trim() && mediaFiles.length === 0}
          >
            <Text style={styles.submitButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    </View>
  )
}

export default create

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'DMSans_500Medium',
    color: '#000',
  },
  cancelButton: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
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
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 64,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  keyboardAccessoryText: {
    flex: 1,
    color: Colors.border,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    height: 150,
    borderRadius: 6,
  },
})