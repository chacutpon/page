import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Menu, MenuItem } from '@mui/material';

const Home = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Container sx={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Home Page Teacher
      </Typography>

      <Button
        aria-controls={open ? 'menu' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        variant="contained"
        color="primary"
      >
        เมนู
      </Button>

      <Menu
        id="menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}            
      >
        <MenuItem component={Link} to="/teacher/create" onClick={handleClose}>
          สร้างกิจกรรม
        </MenuItem>
        <MenuItem component={Link} to="/teacher/manage-teacher" onClick={handleClose}>
          นักศึกษาในห้อง
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Home;
