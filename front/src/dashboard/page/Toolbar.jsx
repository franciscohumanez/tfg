import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { OffCanvas } from '../../components/OffCanvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faTimesCircle  } from '@fortawesome/free-solid-svg-icons';

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
    <Navbar className="bg-body-tertiary">
      <Container>
        <OffCanvas/>
          <Navbar.Toggle />
          <Navbar.Brand href="#home">
            <p style={{ fontSize: '0.8rem', margin: 0 }}>{userName}</p>
          </Navbar.Brand>
          <FontAwesomeIcon
          icon={isOnline ? faWifi : faTimesCircle}
          color={isOnline ? 'green' : 'red'}
          style={{ marginLeft: '0', display: 'inline-block' }}
          title={isOnline ? 'Online' : 'Offline'}
        />
      </Container>
    </Navbar>
  );
}

export default Toolbar;
