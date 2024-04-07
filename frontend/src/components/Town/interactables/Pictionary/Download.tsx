import { Button } from '@chakra-ui/react';
import React, { createRef } from 'react';
import { useScreenshot, createFileName } from 'use-react-screenshot';

export default function Download(): JSX.Element {
  const ref = createRef();
  const [image, takeScreenShot] = useScreenshot({
    type: 'image/jpeg',
    quality: 1.0,
  });

  const download = (image, { name = 'img', extension = 'jpg' } = {}) => {
    const a = document.createElement('a');
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const downloadScreenshot = () => takeScreenShot(ref.current).then(download);

  return (
    <div>
      <Button onClick={downloadScreenshot}>Download</Button>
    </div>
  );
}
