// Fallback for cross-platform icons using Lucide.

import { Home, Send, Code, ChevronRight } from 'lucide-react-native';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type ViewStyle } from 'react-native';

type IconMapping = Record<string, React.ComponentType<any>>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Lucide Icons mappings here.
 * - see Lucide icons at https://lucide.dev/icons/
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': Home,
  'paperplane.fill': Send,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': ChevronRight,
};

/**
 * An icon component that uses native SF Symbols on iOS, and Lucide Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Lucide Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const IconComponent = MAPPING[name];
  return <IconComponent color={color} size={size} style={style} />;
}
