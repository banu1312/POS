// @mui
import { styled } from '@mui/material/styles';
import { Autocomplete, Badge, Box, Button, Card, CardContent, Dialog, DialogContent, Drawer, FormControl, FormControlLabel, FormHelperText, FormLabel, IconButton, InputAdornment, Paper, Radio, RadioGroup, Stack, Step, StepButton, StepLabel, Stepper, TextField, Typography } from '@mui/material';
// component
import { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {usePos } from './posReducer';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import { OutletContext } from '../../../layouts/dashboard/OutletProvider';


// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  top: theme.spacing(16),
  height: theme.spacing(5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.25),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
}));

// ----------------------------------------------------------------------
const steps = [
  'My Cart',
  'Checkout',
  'Finish',
];
const StyledProductImg = styled('img')({
  top: 0,
  width: 250,
  height: 250,
  objectFit: 'cover',
});
export default function CartWidget({openModal,handleCloseModal,handleOpenModal}) {
  const {state,dispatch} = usePos()
  const [activeStep, setActiveStep] = useState(0);
  const [staff,setStaff] = useState([])
  const cookies = new Cookies
  const cookie = cookies.get("Authorization")
  const [customer,setCustomer] = useState([])
  
  const formatedTotal = state.formData.total.toLocaleString(undefined,{
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})

  useEffect(()=>{
    const mapping=async()=> {
    axios.get("http://localhost:8000/api/customers",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setCustomer(response.data.data)
          })
    axios.get("http://localhost:8000/api/staffs",{
            headers:{
              "Content-Type":"aplication/json",
              Authorization: `Bearer ${cookie}`
            }
          }).then(response=>{
            setStaff(response.data.data)
          })
  } 
    mapping()
  },[])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "itemsAdded") {
        // Local storage has changed, update your cart here
        const updatedLocalStorageProductList = JSON.parse(e.newValue) || [];
        dispatch({ type: "UPDATE", payload: updatedLocalStorageProductList });
      }
    };
  
    // Add the event listener
    window.addEventListener("storage", handleStorageChange);
  
    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  const handleValidation=(formData)=>{ 
    const errors = {};
    
    // Perform validation here
    Object.keys(formData).forEach((field) => {
      if( field !== 'information'){
        if (formData[field] === '' || formData[field] === 0 ) {
          errors[field] = `${field} is required`;
        }
      }
    });

        // Update validationErrors state
    Object.keys(errors).forEach((field) => {
     dispatch({
        type: 'SET_VALIDATION_ERROR',
        payload: { field, error: errors[field] },
      });
    });
    
    return errors;
  }
  
  const handleDate=(data)=>{
    const date = new Date(data.$y, data.$M , data.$D)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    dispatch({type:"DATE",payload:formattedDate})
  }

  const handleNext = () => {
    if (activeStep === 1) {
      const errors = handleValidation(state.formData);

    if (Object.keys(errors).length === 0) {
      handleCreate()
      // setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleChange=(e,id)=>{
    const newquantity = parseInt(e.target.value,10);

    const updateProduct = state.product.map((p)=>{
      if(p.id === id){
        return {...p, quantity:newquantity}
      }
      return p
    })
    dispatch({type:"UPDATE" , payload:updateProduct})
  }

  const handleChangeForm = e =>{
    dispatch(
      {type:"CHANGE_INPUT" , payload:{name:e.target.name , value:e.target.value}},
    )
}
  const handleRadioButton = (name,value) =>{
    dispatch(
      {type:"CHANGE_INPUT" , payload:{name , value}},
    )
}
  const calculateTotalCost = () => {
    return state.product.reduce((total, item) => {
      return total + item.quantity * Number(item.sellingPrice)
    }, 0);
  };

  // Reset totalState when coli changes
  useEffect(() => {
    state.formData.total = calculateTotalCost()
  }, [state, state.formData.total]);

  const handleCreate= async() =>{
    
    try {
      await axios.post("http://localhost:8000/api/transactions",{
        staff_id:state.formData.staff_id,
        customer_id:state.formData.customer_id,
        transactionDate:state.formData.transactionDate,
        paymentStatus:state.formData.paymentMethod,
        itemStatus:state.formData.deliveryMethod,
        information:state.formData.information,
        total:state.formData.total,
        installment:Number(state.formData.installment),
        product_id:state.product.map(p=>({
          id:p.id,
          quantity:p.quantity
        }))
      },{
        headers:{
          Authorization: `Bearer ${cookie}`
        }
      }).then(response=>{
          console.log(response);
      })
    } catch (error) {
      console.log(error);
    }
    }

    
  return (
    <>
      <StyledRoot>
        <IconButton onClick={handleOpenModal}>
        <Badge showZero badgeContent={state.product.length} color="error" max={99} >
          <Iconify icon="eva:shopping-cart-fill" width={24} height={24} />
        </Badge>
        </IconButton>
      </StyledRoot>

      <Drawer
        anchor="right"
        open={openModal}
        onClose={handleCloseModal}
        PaperProps={{
          sx: { width: "50%", border: 'none', overflow: 'hidden', padding:3},
        }}
      >
          <Stepper activeStep={activeStep} sx={{ marginBottom:10 }}>
            {steps.map((label, index) => {
              return (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </>
          ) : (
            <>
            <Scrollbar>
              <Stack>

            {activeStep === 0 && (
              state.product.length > 0 ? (
              state.product.map((p)=>{
              const {name,urlImage,sellingPrice,idProduk,id,quantity} = p
              const formattedAfterDisc = sellingPrice.toLocaleString(undefined,{
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
              return (
                <>
                <Card sx={{ display:"flex" , marginBottom:5 }}>
                <StyledProductImg alt={name} src={`http://localhost:8000/storage/${urlImage}`}/>
                <CardContent sx={{ width:"100%" , display:'flex' , justifyContent:'space-between' , flexDirection:'column'}}>
                  <Box  sx={{ flex: '1 0 auto', display:'flex' , justifyContent:'space-between'}}>
                  <Box>
                  <Typography component="div" variant="h5">
                    {name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" component="div">
                    IDR {formattedAfterDisc}
                  </Typography>
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" component="div">
                    Kode: {idProduk}
                  </Typography>
                  </Box>
                  <Box>
                  <TextField
                      id="outlined-start-adornment"
                      sx={{ m: 1, width: '25ch' }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Qty</InputAdornment>,
                      }}
                      defaultValue={quantity}
                      onChange={(e)=>handleChange(e,id)}
                    />
                  </Box>
                </CardContent>
                </Card>
                </>
              )
            })) :
            (
              <>
                <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ textAlign:'center'}}>
                  no items in the cart
                </Typography>
              </>
            )
            )}
            {activeStep === 1 && (
               state.product.length > 0 ? (
                <>
                <Paper elevation={8} sx={{ padding: 5 , marginBottom:5,marginTop:2,width:"90%",marginLeft:"auto",marginRight:"auto" }}>
                    <Typography variant='h6' textAlign={'center'}>Form Checkout</Typography>

                    <Autocomplete
                      id="country-select-demo"
                      name="customer_id"
                      sx={{ marginTop:5 }}
                      disableClearable
                      options={customer}
                      getOptionLabel={(option) => option.name}
                      renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                          {option.name}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Choose a Customer"
                        inputProps={{
                          ...params.inputProps,
                        }}
                        error={!!state.validationErrors.customer_id}
                        helperText={state.validationErrors.customer_id || ' '}
                        />
                        )}
                        onChange={(event,newValue) => {
                          if (newValue) {
                            handleChangeForm({ target: { name: 'customer_id', value: newValue.id } });
                          }
                      }}
            />
                    <Autocomplete
                      id="country-select-demo"
                      name="customer_id"
                      sx={{ marginTop:2 }}
                      disableClearable
                      options={staff}
                      getOptionLabel={(option) => option.name}
                      renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                          {option.name}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Choose a Staff"
                        inputProps={{
                          ...params.inputProps,
                        }}
                        error={!!state.validationErrors.staff_id}
                        helperText={state.validationErrors.staff_id || ' '}
                        />
                        )}
                        onChange={(event,newValue) => {
                          if (newValue) {
                            handleChangeForm({ target: { name: 'staff_id', value: newValue.id } });
                          }
                        }}
            />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer
                        components={[
                          'DatePicker',
                          'MobileDatePicker',
                          'DesktopDatePicker',
                          'StaticDatePicker',
                        ]}
                        sx={{ marginTop:2 }}
                      >
                          <DatePicker label="Trasaction Date" onChange={(data)=>handleDate(data)} defaultValue={dayjs()} slotProps={{ textField: { helperText:state.validationErrors.transactionDate , error:!!state.validationErrors.transactionDate} }}/>
                      </DemoContainer>
                    </LocalizationProvider>
                    
                    <Box sx={{ display:'flex',flexDirection:'column' }}>
                    <FormControl sx={{ marginTop:2 }} error={!!state.validationErrors.paymentMethod}>
                    <FormLabel id="demo-row-radio-buttons-group-label">Payment Method</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={state.formData.paymentMethod}
                      onChange={(e)=>handleRadioButton("paymentMethod",e.target.value)}
                    >
                      <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                      {state.formData.total > 30000 && (
                        <FormControlLabel value="debit" control={<Radio />} label="Debit" />
                        )}
                      {state.formData.paymentMethod ==='debit' && (
                        <RadioGroup
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        row
                        value={state.formData.installment}
                        onChange={(e)=>handleRadioButton("installment",e.target.value)}
                        >
                        <FormControlLabel value={3} control={<Radio />} label="3 Bulan" />
                        <FormControlLabel value={6} control={<Radio />} label="6 Bulan" />
                        <FormControlLabel value={12} control={<Radio />} label="12 Bulan" />
                      </RadioGroup>
                      )}
                    </RadioGroup>
                    <FormHelperText>{state.validationErrors.paymentMethod}</FormHelperText>
                  </FormControl>

                    <FormControl sx={{ marginTop:2 }} error={!!state.validationErrors.deliveryMethod}>
                    <FormLabel id="demo-row-radio-buttons-group-label">Shipping Method</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={state.formData.deliveryMethod}
                      onChange={(e)=>handleRadioButton("deliveryMethod",e.target.value)}
                    >
                      <FormControlLabel value="pickUp" control={<Radio />} label="Pick Up" />
                      <FormControlLabel value="delivery" control={<Radio />} label="Delivery" />
                    </RadioGroup>
                    <FormHelperText>{state.validationErrors.deliveryMethod}</FormHelperText>
                  </FormControl>
                <TextField
                  id="outlined-disabled"
                  label="Information"
                  sx={
                    {marginTop:2}
                  }
                  fullWidth
                  name='information'
                  onChange={handleChangeForm}
                  error={!!state.validationErrors.information}
                  helperText={state.validationErrors.information}
                />
                    </Box>
                <Typography variant='subtitle1' fontSize={17} sx={{ marginTop:3 }}>Total Purchase :</Typography>
                {state.product.map(p=>{
                  const formattedAfterDisc = p.sellingPrice.toLocaleString(undefined,{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })
                  
                  return(
                  <>
                  <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                  <Typography variant='subtitle2' fontSize={12} >{p.name}</Typography>
                  <Typography variant="subtitle2" fontSize={12} color="text.secondary">
                    {p.quantity} X Rp{formattedAfterDisc}
                  </Typography>
                  </Box>
                  </>
                )})}
                  <Typography variant='subtitle2' fontSize={15} textAlign={'end'} sx={{ width: '100%', "::after": { content: '""', whiteSpace: 'nowrap' } }}>
                    +{'-'.repeat(30)}
                  </Typography>
                  <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                  <Typography variant='subtitle2' fontSize={12} >Total Payment</Typography>
                  <Typography variant="subtitle2" fontSize={12} color="text.secondary">
                    Rp{formatedTotal}
                  </Typography>
                  </Box>
                </Paper>
                </>
                ) :
                (
                  <>
                  <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ textAlign:'center'}}>
                    no items in the cart
                  </Typography>
                </>
              )
              )}
            {activeStep === 2 && (
              state.product.length > 0 ? (
                <>
                finish
                </>
                ) :
              (
                <>
                  <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ textAlign:'center'}}>
                    no items in the cart
                  </Typography>
                </>
              )
            )}
              </Stack>
            </Scrollbar>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2}}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </>
          )}
      </Drawer>
    </>
    );
  }
  