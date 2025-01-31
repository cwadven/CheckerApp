import React from 'react';
import { Linking, Text, TextStyle } from 'react-native';
import type { ReactElement } from 'react';

export const parseAndLinkify = (
  text: string, 
  linkStyle?: TextStyle
): ReactElement[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <Text
          key={index}
          style={[linkStyle]}
          onPress={() => Linking.openURL(part)}
        >
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};
