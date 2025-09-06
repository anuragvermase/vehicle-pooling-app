// src/components/ScreenSafeArea.tsx
import React from "react";
import { View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = ViewProps & {
  edges?: Array<"top" | "bottom" | "left" | "right">;
  minTop?: number;
  minBottom?: number;
};

export default function ScreenSafeArea({
  children,
  style,
  edges = ["top", "bottom", "left", "right"],
  minTop = 0,
  minBottom = 0,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const padTop = edges.includes("top") ? Math.max(insets.top, minTop) : 0;
  const padBottom = edges.includes("bottom") ? Math.max(insets.bottom, minBottom) : 0;
  const padLeft = edges.includes("left") ? insets.left : 0;
  const padRight = edges.includes("right") ? insets.right : 0;

  return (
    <View
      style={[
        { flex: 1, paddingTop: padTop, paddingBottom: padBottom, paddingLeft: padLeft, paddingRight: padRight },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
