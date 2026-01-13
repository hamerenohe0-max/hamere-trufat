import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';

interface ThemedTextProps extends TextProps {
    type?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
}

export const ThemedText = ({ style, type = 'primary', ...props }: ThemedTextProps) => {
    const { colors, fontScale } = useTheme();

    const textStyle = {
        color: colors.text[type],
        fontSize: (StyleSheet.flatten(style)?.fontSize || 16) * fontScale,
    };

    return <Text style={[textStyle, style]} {...props} />;
};
