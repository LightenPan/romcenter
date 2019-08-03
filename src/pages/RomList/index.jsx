import React from 'react';
import IceContainer from '@icedesign/container';
// import ContainerTitle from '@/components/ContainerTitle';
import RomList from './RomList';

export default function ModelMarket() {
  return (
    <IceContainer
      style={{
        padding: 0,
      }}
    >
      {/* <ContainerTitle title="Rom列表" /> */}
      <RomList />
    </IceContainer>
  );
}
