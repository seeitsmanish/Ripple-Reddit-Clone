import { ToastPosition } from "@chakra-ui/react";
import { FaHammer } from "react-icons/fa";

export type ToastType = {
  title: string;
  description: string;
  status: 'info' | 'warning' | 'success' | 'error';
  duration: number;
  isClosable: boolean;
  icon: React.ReactNode;
  position: ToastPosition;
}

const TOASTS: Record<string, ToastType> = Object.freeze({
  UNDER_DEVELOPMENT: {
    title: "Under Development",
    description: 'This feature is under development',
    status: 'info',
    duration: 3000,
    isClosable: true,
    icon: <FaHammer size={20} />,
    position: 'top-right'
  }
})

export default TOASTS;