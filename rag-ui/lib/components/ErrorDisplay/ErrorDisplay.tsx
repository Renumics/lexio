import { useEffect, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRAGStatus } from '../RAGProvider/hooks';
import { ThemeContext, removeUndefined } from '../../theme/ThemeContext';

export interface ErrorDisplayStyles {
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  progressBarColor?: string;
}

interface ErrorDisplayProps {
  styleOverrides?: ErrorDisplayStyles;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ styleOverrides = {} }) => {
  const { error } = useRAGStatus();
  
  // use theme
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('ThemeContext is undefined');
  }
  const { colors, typography } = theme.theme;

  // Merge theme defaults + overrides
  const style: ErrorDisplayStyles = {
    backgroundColor: colors.error,
    textColor: colors.lightText,
    borderRadius: '0.375rem',
    fontFamily: typography.fontFamily,
    progressBarColor: colors.primary,
    ...removeUndefined(styleOverrides),
  };

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: style.backgroundColor,
          color: style.textColor,
          borderRadius: style.borderRadius,
          fontFamily: style.fontFamily,
        },
        progressStyle: {
          background: style.progressBarColor,
        },
      });
    }
  }, [error, style]);

  return <ToastContainer />;
};

export { ErrorDisplay };