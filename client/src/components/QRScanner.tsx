import { useEffect, useState } from 'react';
import { Box, Text, Center } from '@mantine/core';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function QRScanner() {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        try {
          const url = new URL(decodedText);
          const roomId = url.searchParams.get('roomId');
          if (roomId) {
            html5QrCode.stop();
            navigate(`/remote?roomId=${roomId}`);
          }
        } catch (e) {
          setError('Invalid QR code');
        }
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, []);

  return (
    <Box>
      <Center>
        <Box id="qr-reader" style={{ width: '300px', height: '300px' }} />
      </Center>
      {error && (
        <Text color="red" align="center" mt="md">
          {error}
        </Text>
      )}
    </Box>
  );
} 