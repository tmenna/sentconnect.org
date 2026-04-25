import whiteLogo from "@assets/SENTCONNECT_LOGO_-_White_1777111187198.png";
import blueLogo from "@assets/SENTCONNECT_LOGO_-_Blue_1777111269581.png";

export const LOGO_WHITE = whiteLogo;
export const LOGO_BLUE  = blueLogo;

export function usePlatformLogo(): { white: string; blue: string } {
  return { white: whiteLogo, blue: blueLogo };
}
