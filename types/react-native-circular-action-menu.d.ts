declare module 'react-native-circular-action-menu' {
  import { ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  export interface ActionButtonProps {
    buttonColor?: string;
    onPress?: () => void;
    active?: boolean;
    size?: number;
    radius?: number;
    verticalOrientation?: 'up' | 'down';
    icon?: ReactNode;
    style?: ViewStyle;
    children?: ReactNode;
  }

  export interface ActionButtonItemProps {
    buttonColor?: string;
    title?: string;
    onPress?: () => void;
    children?: ReactNode;
  }

  export default class ActionButton extends React.Component<ActionButtonProps> {
    static Item: React.ComponentType<ActionButtonItemProps>;
  }
}
