import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { OffCanvas } from '../../components/OffCanvas';

export const Toolbar = ({ userName }) => {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <OffCanvas/>
          <Navbar.Toggle />
          <Navbar.Brand href="#home">Odoo</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Toolbar;
