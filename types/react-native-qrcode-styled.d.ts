declare module 'react-native-qrcode-styled' {
  import { Component } from 'react';

  interface QRCodeProps {
    data: string;
    style?: any;
    pieceSize?: number;
    pieceBorderRadius?: number;
    isPiecesGlued?: boolean;
    color?: string;
    outerEyesOptions?: {
      borderRadius?: number;
      color?: string;
    };
    innerEyesOptions?: {
      borderRadius?: number;
      color?: string;
    };
    logo?: {
      href: any;
      padding?: number;
      hidePieces?: boolean;
    };
  }

  export default class QRCode extends Component<QRCodeProps> {}
}
