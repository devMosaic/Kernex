import React from 'react';
import FtpSettings from './FtpSettings';
import { useTitle } from '../../hooks/useTitle';

const FtpServerPage: React.FC = () => {
  useTitle('FTP Server');
  return (
    <div>
        <h1 style={{ marginBottom: 30, fontSize: 24 }}>FTP Server Configuration</h1>
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <FtpSettings />
        </div>
    </div>
  );
};

export default FtpServerPage;
