import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

const CustomBloom = Bloom as unknown as React.FC<any>;
const CustomVignette = Vignette as unknown as React.FC<any>;

export const PostProcessingPipeline: React.FC = () => {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <CustomBloom
        luminanceThreshold={0.7}
        luminanceSmoothing={0.3}
        intensity={1.1}
        mipmapBlur
      />
      <CustomVignette offset={0.25} darkness={0.65} eskil={false} />
    </EffectComposer>
  );
};
