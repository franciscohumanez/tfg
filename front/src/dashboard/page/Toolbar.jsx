import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

export const Toolbar = () => {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Odoo</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <a href="#login">Mark Otto</a>
            </Navbar.Text>
          </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Toolbar;
