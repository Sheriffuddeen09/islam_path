import { TopSection } from './TopSection';
import ImageCrop from './ImageCrop';
import { useState } from 'react';

function AppImage() {
  const [url,setUrl]=useState('')
  
  return (
    <div className="App translate-y-20">
      <h2 className="title"> React Image Crop / Editor</h2>
     <TopSection setUrl={setUrl}/>
     {url && <ImageCrop url={url}/>}
    </div>
  );
}

export default AppImage;