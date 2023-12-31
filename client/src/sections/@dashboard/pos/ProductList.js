import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import ShopProductCard from './ProductCard';

// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
};

export default function ProductList({ products,add,...other }) {
  // const {state} = usePos()
  return (
    <Grid container spacing={3} {...other}>
      {products.map((product) => {
          return(
            <Grid key={product.id} item xs={12} sm={6} md={3}>
              <ShopProductCard product={product} add={add}/>
            </Grid>
          )})}
    </Grid>
  );
}
