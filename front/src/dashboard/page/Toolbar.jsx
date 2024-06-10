import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import { OffCanvas } from '../../components/OffCanvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faTimesCircle  } from '@fortawesome/free-solid-svg-icons';
import './StyleToolbar.css';

export const Toolbar = ({ userName }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className='toolbar-header'>
      <div className='toolbar-background'>
        <div className='toolbar-content'>
          <OffCanvas className='menu-icon' />
          <FontAwesomeIcon
            icon={isOnline ? faWifi : faTimesCircle}
            color={isOnline ? 'green' : 'red'}
            style={{ marginLeft: '0', display: 'inline-block' }}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
