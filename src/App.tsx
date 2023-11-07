
import { ComposerTest } from './ComposerTest';
import {useRef, useState, useEffect } from 'react';

function App() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setFirstRender(false);
  }, [canvasRef.current]);

  return (
    <>
        <canvas
            ref={canvasRef}
            style={{width: '100%', height: '100%'}}
        />
      {canvasRef.current && <ComposerTest canvas={canvasRef.current}/>}
    </>
  );
}

export default App;
