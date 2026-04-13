import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import { welcomeTheme } from "@/src/constants/authTheme";
import { mesasTheme } from "@/src/constants/mesasTheme";

/** Alto fijo del recuadro de imagen (mismo para todas las figuras). */
export const HELP_FIGURE_FRAME_HEIGHT = 480;

type Props = {
  title: string;
  description?: string;
  source: ImageSourcePropType;
};

export function SuggestedImageCallout({ title, description, source }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {description != null && description.trim().length > 0 ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={styles.imageFrame}>
        <Image
          source={source}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={title}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: mesasTheme.muted,
    marginBottom: 10,
  },
  imageFrame: {
    width: "100%",
    height: HELP_FIGURE_FRAME_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#f0f1f4",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
