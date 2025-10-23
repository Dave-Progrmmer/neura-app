import { View, Text, Button } from 'react-native'
import * as Sentry from '@sentry/react-native'
import React from 'react'

const index = () => {
  return (
    <View>
      <Text>This is feed</Text>
      <Button
  title="Try!"
  onPress={() => {
    Sentry.captureException(new Error("First error"));
  }}
/>;
    </View>
  )
}

export default index