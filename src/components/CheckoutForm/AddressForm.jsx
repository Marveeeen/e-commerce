import React, { useState, useEffect } from 'react'
import { InputLabel, Select, MenuItem, Button, Grid, Typography } from '@material-ui/core'
import { useForm, FormProvider } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { commerce } from '../../lib/commerce'

import CustomTextField from './CustomTextField'

const AddressForm = ({ checkoutToken, test }) => {
    
    const [shippingCountries, setShippingCountries] = useState([]);
    const [shippingCountry, setShippingCountry] = useState('');
    const [shippingSubdivisions, setShippingSubdivisions] = useState([]);
    const [shippingSubdivision, setShippingSubdivision] = useState('');
    const [shippingOptions, setShippingOptions] = useState([]);
    const [shippingOption, setShippingOption] = useState('');
    const [didMount, setDidMount] = useState(true);
    const methods = useForm();


    const countries = Object.entries(shippingCountries).map(([code, name]) =>({ id: code, label: name}))
    const divsions = Object.entries(shippingSubdivisions).map(([code, name]) =>({ id: code, label: name}))

    const fetchShippingCountries = async (checkoutToken) => {
        const { countries } = await commerce.services.localeListShippingCountries(checkoutToken);
        if(countries){
            setShippingCountries(countries)
            setShippingCountry(Object.keys(countries)[0]);
            setDidMount(false)
        }
    }

    const fetchSubdivisions = async (countryCode) => {
        setDidMount(true)
        if(didMount) {
        const { subdivisions } = await commerce.services.localeListSubdivisions(countryCode);
        
            if(subdivisions) {
                setShippingSubdivisions(subdivisions);
                setShippingSubdivision(Object.keys(subdivisions)[0]);
                setDidMount(false)
            }

        }         
      };

    const fetchShippingOptions = async (checkoutTokenId, country, stateProvince = null) => {
        const options = await commerce.checkout.getShippingOptions(checkoutTokenId, { country, region: stateProvince });
        setDidMount(true)
        if(didMount) {
            if(options) {
                setShippingOptions(options);
                setShippingOption(options[0].id);
                setDidMount(false)
            } 
        }
          
    };

    useEffect(() => {
        if(didMount) {
            fetchShippingCountries(checkoutToken.id)  
        }       
    }, [])

    useEffect(() => {
        if (shippingCountry) fetchSubdivisions(shippingCountry)
      }, [shippingCountry]);
    
    useEffect(() => {
        if (shippingSubdivision) fetchShippingOptions(checkoutToken.id, shippingCountry, shippingSubdivision);
    }, [shippingSubdivision]);

    
    return (
        <>
            <Typography variant='h6' gutterBottom>
                Shipping Address
            </Typography>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit((data) => {
                    if (!didMount)  test({ ...data, shippingCountry, shippingSubdivision, shippingOption })
                })}>
                    <Grid container spacing={3}>
                        <CustomTextField name='firstName' label='First Name' />
                        <CustomTextField name='lastName' label='Last Name' />
                        <CustomTextField name='address' label='Address' />
                        <CustomTextField name='email' label='Email' />
                        <CustomTextField name='city' label='City' />
                        <CustomTextField name='zip' label='Zip / Postal Code' />
                        <Grid item xs={12} sm={6}>
                            <InputLabel>Shipping Country</InputLabel>
                            <Select value={shippingCountry} fullWidth onChange={(e) => setShippingCountry(e.target.value)}>
                                {countries.map((country) => (
                                    <MenuItem key={country.id} value={country.id}>
                                        {country.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <InputLabel>Shipping Subdivision</InputLabel>
                        <Select value={shippingSubdivision} fullWidth onChange={(e) => setShippingSubdivision(e.target.value)}>
                            {divsions.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.label}
                            </MenuItem>
                            ))}
                        </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <InputLabel>Shipping Options</InputLabel>
                        <Select value={shippingOption} fullWidth onChange={(e) => setShippingOption(e.target.value)}>
                            {shippingOptions.map((sO) => ({ id: sO.id, label: `${sO.description} - (${sO.price.formatted_with_symbol})` })).map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.label}
                            </MenuItem>
                            ))}
                        </Select>
                        </Grid>
                    </Grid>
                    <br />
                    <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                        <Button component={Link} to='/cart' variant='outlined'>Back to Cart</Button>
                        <Button type='submit' variant='contained' color='primary'> Next</Button>
                    </div>
                </form>
            </FormProvider>
        </>
    )
}

export default AddressForm