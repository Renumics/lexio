export const fetchSamplePDF = async (url: string): Promise<Uint8Array> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      return new Uint8Array([37, 80, 68, 70, 45, 49, 46, 53, 10]); // "%PDF-1.5" header
    }
  };