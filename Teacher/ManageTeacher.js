
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listUserTeacher, removeUser } from '../../functions/authBackend';
import { Table, TableHead, TableRow, TableBody, TableCell, Paper, IconButton, Typography, Box } from '@mui/material';
import moment from 'moment';
import 'moment/locale/th';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const ManageTeacher = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData(user.user.token);
  }, []);

  const loadData = (authtoken) => {
    listUserTeacher(authtoken)
      .then((res) => {
        const filterUser = res.data.filter((item) => item.role === "user");
        setData(filterUser);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  return (
    <Paper
      sx={{
        width: '90%',
        margin: 'auto',
        marginTop: '20px',
        padding: '20px',
      }}
    >
      <Typography variant="h4" align="center" sx={{ marginBottom: '20px' }}>
        รายชื่อนักศึกษา
      </Typography>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ลำดับที่</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชื่อ</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่เข้าร่วม</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เข้าร่วมล่าสุดเมื่อ</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>คะแนน</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell align="">{index + 1}</TableCell>
              <TableCell align="">{item.name}</TableCell>
              <TableCell align="">{item.email}</TableCell>

              <TableCell align="">
                {moment(item.createdAt).locale('th').format('LL')}
              </TableCell>
              <TableCell align="">
                {moment(item.updatedAt).locale('th').fromNow()}
              </TableCell>
              <TableCell align="center">
                คะแนน
              </TableCell>
            </TableRow>
          ))}         
        </TableBody>
      </Table>
      <Button
      component={Link} 
      to="/teacher/index" 
      variant="contained"
      color="error" 
      sx={{ margin: '20px 0' }} 
    >
      กลับ
    </Button>
    </Paper>
    
  );
};

export default ManageTeacher
