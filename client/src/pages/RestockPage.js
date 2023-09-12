import { Helmet } from 'react-helmet-async';
import { filter, size } from 'lodash';
import { sentenceCase } from 'change-case';
import { useContext, useEffect, useState } from 'react';
import Cookies from 'universal-cookie/cjs/Cookies';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MuiFileInput } from 'mui-file-input';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Modal,
  Box,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  Select,
  DialogTitle,
} from '@mui/material';
// components
import DetailsIcon from '@mui/icons-material/Details';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { ProductListHead, ProductListToolbar } from '../sections/@dashboard/product';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { OutletContext } from '../layouts/dashboard/OutletProvider';
import DetailRestock from '../sections/@dashboard/restock/detail';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'productName', label: 'products', alignRight: false },
  { id: 'supplierName', label: 'Supplier name', alignRight: false },
  { id: 'restockDate', label: 'Restock Date', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'coli', label: 'Coli', alignRight: false },
  { id: 'totalSpend', label: 'Total Spend', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
  ? (a, b) => descendingComparator(a, b, orderBy)
  : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function RestockPage() {
  const navigate = useNavigate()
  
  const [open, setOpen] = useState(null);
  
  const [openModal, setOpenModal] = useState(false);
  
  const [Detail, setDetail] = useState(false);
  
  
  const [page, setPage] = useState(0);
  
  const [order, setOrder] = useState('asc');
  
  const [selected, setSelected] = useState([]);
  
  const [orderBy, setOrderBy] = useState('name');
  
  const [filterName, setFilterName] = useState('');
  
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const cookies = new Cookies()
  
  const [productList,setProduct] = useState([])
  
  const [id,setId] = useState()
  
  const {load} = useContext(OutletContext)

  const handleOpenMenu = (event,id) => {
    setOpen(event.currentTarget);
    setId(id)
  };
  const DATAGRID_COLUMNS = [
    { field: 'productName', headerName: 'Product', width: 150,
       headerAlign: 'center', align:'center'},
    { field: 'supplierName', headerName: 'Supplier name', width: 150 , headerAlign: 'center',align:'center'},
    { field: 'quantity', headerName: 'Quantity', width: 150,
   headerAlign: 'center',align:'center' },
    { field: 'coli', headerName: 'Coli', width: 150,
   headerAlign: 'center',align:'center'},
    { field: 'restockDate', headerName: 'Restock Date',width:150,headerAlign: 'center',align:'center'},
    { field: 'totalSpend', headerName: 'Total Spend',width:150,headerAlign: 'center',align:'center',
    valueGetter: (params) => {
        const totalSpend = params.row.totalSpend;
        return totalSpend.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}},
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<MoreVertIcon />}
            label="3Dots"
            className="textPrimary"
            onClick={(e)=>handleOpenMenu(e,id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const getProcessedData = (data) => {
    const processedData = [];
    
    data.forEach((entry) => {
      const { supplier, products, ...rest } = entry;
      
      if (products && products.length > 0) {
        // Loop through each product in the current restock
        products.forEach((product) => {
          const productRow = {
            productId: product.id,
            supplierName: supplier.name,
            productName: product.name,
            quantity: product.pivot.quantity,
            coli: product.pivot.coli,
            ...rest,
          };
          processedData.push(productRow);
        });
      }
    });
    
    return processedData;
  };

  useEffect(()=>{
    const cookie = cookies.get("Authorization")
    const getdata=async()=>{
      axios.get("http://localhost:8000/api/restocks?relations=supplier,products",{
        headers:{
          "Content-Type" : "aplication/json",
          "Authorization" : `Bearer ${cookie}`
        }
      }).then(response=>{
        const ProcessedData = getProcessedData(response.data.data)
        setProduct(ProcessedData)
      })
    }
    getdata()
  },[])
  

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenModalDetail=()=>{
    setOpenModal(true)
    setDetail(true)
  }

  const handleCloseModal=()=>{
    setOpenModal(false)
    setDetail(false)
  }

  const handleOpenModal=()=>{
    navigate('/dashboard/restock/create')
  }
  const handleOpenModalEdit=()=>{
    setOpen(null);
    navigate('/dashboard/restock/edit',{state:{id}})
  }

  const handleDelete=async()=>{
    load(true)
    const cookie = cookies.get("Authorization")
    axios.delete(`http://localhost:8000/api/restocks/${id}`,{
      headers:{
        "Content-Type" : "aplication/json",
        "Authorization" : `Bearer ${cookie}`
      }
    }).then(response=>{
      console.log(response);
    })
    setTimeout(()=>{
      load(false)
    },1000)
  }
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY:"scroll"
  };
  
  const style2 = {
    marginTop: 2
  }
  const style3 = {
    overflowX:"scroll",
    marginTop:2,
  }
  
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };
  
  
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - productList.length) : 0;
  
  const filteredUsers = applySortFilter(productList, getComparator(order, orderBy), filterName);
  
  const isNotFound = !filteredUsers.length && !!filterName;

  console.log(filteredUsers);
  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Restock List
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpenModal}>
            New Resctock
          </Button>
        </Stack>

        <Card>
          <ProductListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
          {filteredUsers.length === 0 ? (
              <Box sx={{ height:150 }}>
              <DataGrid
                rows={filteredUsers}
                columns={DATAGRID_COLUMNS}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10]}
                onRowSelectionModelChange={(s)=>{
                  setSelected(s)
                }}
                checkboxSelection 
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
              />
            </Box>
            ) :(
              <Box sx={{ height:"auto" }}>
              <DataGrid
                rows={filteredUsers}
                columns={DATAGRID_COLUMNS}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                
                pageSizeOptions={[5, 10]}
                onRowSelectionModelChange={(s)=>{
                  setSelected(s)
                }}
                slots={{
                  toolbar: CustomToolbar,
                }}
                checkboxSelection 
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
              />
              </Box>
            )}
          </Scrollbar>
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={handleOpenModalEdit}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }}/>
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={handleDelete}> 
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>

        <MenuItem onClick={handleOpenModalDetail}> 
          <DetailsIcon sx={{ mr: 2 }} />
          Detail
        </MenuItem>
      </Popover>
      {openModal && (
                  <>
                      {Detail && (
                          <DetailRestock style2={style2} openModal={openModal} handleCloseModal={handleCloseModal} id={id} />
                      )}
                  </>
              )}
        </>
  );
}


function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
    </GridToolbarContainer>
  );
}