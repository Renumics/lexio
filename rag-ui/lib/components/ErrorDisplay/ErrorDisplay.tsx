import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { errorAtom } from '../../state/rag-state';
import 'react-toastify/dist/ReactToastify.css';

const ErrorDisplay = () => {
  const [error] = useAtom(errorAtom);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  return <ToastContainer />;
};

export { ErrorDisplay };