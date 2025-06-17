'use client'

import React, { useState, useEffect } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { useRouter } from 'next/navigation'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CountryFlag from 'react-country-flag'
import { Country, State, City } from 'country-state-city'
import * as currencyCodes from 'currency-codes'
import Autocomplete from '@mui/material/Autocomplete'

const REGISTER_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}wholesaler/register`

const generateCaptcha = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function RegistrationForm() {
  const router = useRouter()
  const [agency, setAgency] = useState({
    agencyName: '',
    country: '',
    city: '',
    postCode: '',
    address: '',
    website: '',
    phoneNumber: '',
    email: '',
    businessCurrency: '',
    vat: '',
  })
  const [user, setUser] = useState({
    title: '',
    firstName: '',
    lastName: '',
    emailId: '',
    designation: '',
    mobileNumber: '',
    userName: '',
    password: '',
  })
  const [licenseBase64, setLicenseBase64] = useState<string>('')
  const [licenseName, setLicenseName] = useState<string>('')
  const [captchaCode, setCaptchaCode] = useState<string>('')
  const [captchaInput, setCaptchaInput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [countries, setCountries] = useState<{ isoCode: string; name: string }[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [currencies, setCurrencies] = useState<string[]>([])

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success')

  useEffect(() => {
    setCaptchaCode(generateCaptcha())

    // Load countries
    const allCountries = Country.getAllCountries().map(c => ({
      isoCode: c.isoCode,
      name: c.name,
    }))
    allCountries.sort((a, b) => a.name.localeCompare(b.name))
    setCountries(allCountries)

    // Load currencies: popular first, then rest
    const popularCurrencies = ['USD', 'AED', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF']
    const codes = currencyCodes.codes() || []
    const uniqueCodes = Array.from(new Set(codes.map(c => c.toUpperCase())))
    uniqueCodes.sort()
    const popularList = uniqueCodes.filter(code => popularCurrencies.includes(code))
    const restList = uniqueCodes.filter(code => !popularCurrencies.includes(code))
    setCurrencies([...popularList, ...restList])
  }, [])

  useEffect(() => {
    if (agency.country) {
      const states = State.getStatesOfCountry(agency.country) || []
      const cityAcc: string[] = []
      states.forEach(st => {
        const stCities = City.getCitiesOfState(agency.country, st.isoCode) || []
        stCities.forEach(ci => {
          if (ci.name && !cityAcc.includes(ci.name)) {
            cityAcc.push(ci.name)
          }
        })
      })
      cityAcc.sort((a, b) => a.localeCompare(b))
      setCities(cityAcc)
      setAgency(prev => ({ ...prev, city: '' }))
    } else {
      setCities([])
      setAgency(prev => ({ ...prev, city: '' }))
    }
  }, [agency.country])

  const handleAgencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'country') {
      setAgency(prev => ({ ...prev, country: value, city: '' }))
    } else {
      setAgency(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptchaInput(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLicenseName(file.name)
    setError(null)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => {
        const img = new Image()
        img.onload = () => {
          const maxWidth = 800
          const scale = Math.min(1, maxWidth / img.width)
          const canvas = document.createElement('canvas')
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(
            blob => {
              if (!blob) {
                setError('Image compression failed')
                return
              }
              const r2 = new FileReader()
              r2.onloadend = () => {
                if (typeof r2.result === 'string') setLicenseBase64(r2.result)
              }
              r2.onerror = () => setError('Failed to read compressed image')
              r2.readAsDataURL(blob)
            },
            'image/jpeg',
            0.7
          )
        }
        img.onerror = () => setError('Invalid image file')
        img.src = ev.target?.result as string
      }
      reader.onerror = () => setError('Failed to read image file')
      reader.readAsDataURL(file)
    } else {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setLicenseBase64(reader.result)
      }
      reader.onerror = () => setError('Failed to read file')
      reader.readAsDataURL(file)
    }
  }

  const handleLicenseRemove = () => {
    setLicenseName('')
    setLicenseBase64('')
  }

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha())
    setCaptchaInput('')
    setError(null)
  }

  const handleToastClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return
    setToastOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (captchaInput.trim() !== captchaCode) {
      setError('Captcha does not match')
      setLoading(false)
      return
    }
    const payload: any = {
      wholesalerName: agency.agencyName,
      country: agency.country,
      city: agency.city,
      postCode: agency.postCode,
      address: agency.address,
      website: agency.website,
      phoneNumber: agency.phoneNumber,
      email: agency.email,
      businessCurrency: agency.businessCurrency,
      vat: agency.vat,
      ...(licenseBase64 ? { licenseUrl: licenseBase64 } : {}),
      title: user.title,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      designation: user.designation,
      mobileNumber: user.mobileNumber,
      userName: user.userName,
      password: user.password,
    }
    try {
      const res = await fetch(REGISTER_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.message || `Server ${res.status}: ${res.statusText}`)
      }
      const responseData = await res.json()
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token)
      }
      setToastMessage('Registration successful')
      setToastSeverity('success')
      setToastOpen(true)
      setAgency({
        agencyName: '',
        country: '',
        city: '',
        postCode: '',
        address: '',
        website: '',
        phoneNumber: '',
        email: '',
        businessCurrency: '',
        vat: '',
      })
      setUser({
        title: '',
        firstName: '',
        lastName: '',
        emailId: '',
        designation: '',
        mobileNumber: '',
        userName: '',
        password: '',
      })
      setLicenseBase64('')
      setLicenseName('')
      refreshCaptcha()
    } catch (err: any) {
      const message = err.message || 'Network error'
      setError(message)
      setToastMessage(`Registration failed: ${message}`)
      setToastSeverity('error')
      setToastOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const placeholderMap: Record<string, string> = {
    country: 'Select Country',
    city: 'Select City',
    businessCurrency: 'Select Currency',
    title: 'Select Title',
  }

  const agencyFields = [
    { name: 'agencyName', label: 'Agency Name', type: 'text', required: true },
    { name: 'country', label: 'Country', type: 'autocomplete', required: true },
    {
      name: 'city',
      label: 'City',
      type: 'select',
      options: cities.map(name => ({ code: name, name })),
      required: true,
    },
    { name: 'postCode', label: 'Post Code', type: 'text', required: true },
    { name: 'address', label: 'Address', type: 'text', required: true },
    { name: 'website', label: 'Website', type: 'text' },
    { name: 'phoneNumber', label: '', type: 'phone', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    {
      name: 'businessCurrency',
      label: 'Business Currency',
      type: 'select',
      options: currencies.map(code => ({ code, name: code })),
      required: false,
    },
    { name: 'vat', label: 'VAT', type: 'text' },
  ]

  const userFields = [
    { name: 'title', label: 'Title', type: 'select', options: ['Mr', 'Mrs', 'Miss', 'Dr'] },
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'emailId', label: 'Email ID', type: 'email', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'mobileNumber', label: '', type: 'phone', required: true },
    { name: 'userName', label: 'User Name', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 rounded-lg">
        <div className="relative flex items-center h-16">
          <h2 className="mx-auto text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            Registration Form
          </h2>
        </div>
        {error && <div className="mt-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Agency Detail */}
          <h3 className="mt-8 text-xl font-semibold">Agency Detail</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {agencyFields.map(f => {
              if (f.type === 'autocomplete') {
                return (
                  <Autocomplete
                    key="country-autocomplete"
                  
                    options={countries}
                    getOptionLabel={option => option.name}
                    value={countries.find(c => c.isoCode === agency.country) || null}
                    onChange={(e, newValue) => {
                      const iso = newValue ? newValue.isoCode : ''
                      setAgency(prev => ({ ...prev, country: iso, city: '' }))
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.isoCode} className="flex items-center ml-2">
                        <CountryFlag
                          countryCode={option.isoCode}
                          svg
                          style={{ width: 20, height: 15, marginRight: 8 }}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={params => {
                      // inject flag in input adornment if selected
                      const startAdornment = agency.country ? (
                        <>
                          <CountryFlag
                            countryCode={agency.country}
                            svg
                            style={{ width: 20, height: 15, marginRight: 8 }}
                          />
                          {params.InputProps.startAdornment}
                        </>
                      ) : (
                        params.InputProps.startAdornment
                      )

                      return (
                        <TextField
                          {...params}
                          label="Country"
                          variant="outlined"
                          fullWidth
                          required
                          placeholder={placeholderMap.country}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment,
                          }}
                        />
                      )
                    }}
                  />
                )
              }

              if (f.type === 'phone') {
                return (
                  <div key={f.name} className="w-full">
                    <label className="block text-sm font-medium mb-1">{f.label}</label>
                    <PhoneInput
                      country={'us'}
                      value={(agency as any)[f.name]}
                      onChange={phone => setAgency(prev => ({ ...prev, [f.name]: phone }))}
                      inputProps={{
                        name: f.name,
                        required: !!f.required,
                      }}
                      containerClass="w-full"
                      inputStyle={{ width: '100%' }}
                    />
                  </div>
                )
              }

              if (f.type === 'select') {
                return (
                  <TextField
                    key={f.name}
                    name={f.name}
                    label={f.label}
                    select
                    required={!!f.required}
                    value={(agency as any)[f.name]}
                    onChange={handleAgencyChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: selected => {
                        if (f.name === 'city') return (selected as string) || placeholderMap.city
                        if (f.name === 'businessCurrency')
                          return (selected as string) || placeholderMap.businessCurrency
                        return (selected as string) || ''
                      },
                    }}
                  >
                    {f.options?.map((opt: any) => (
                      <MenuItem key={opt.code} value={opt.code}>
                        {f.name === 'city' ? opt.name : f.name === 'businessCurrency' ? opt.code : opt.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )
              }

              return (
                <TextField
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  type={f.type}
                  required={!!f.required}
                  value={(agency as any)[f.name]}
                  onChange={handleAgencyChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  placeholder={`Enter ${f.label}`}
                />
              )
            })}
          </div>

          {/* License + Download */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            {licenseName ? (
              <TextField
                label="License"
                value={licenseName}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachFileIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleLicenseRemove} size="small">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <TextField
                label="License"
                type="file"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachFileIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ accept: 'image/*,application/pdf' }}
                onChange={handleFileChange}
              />
            )}
            <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
              <span className="text-sm text-red-500">
                To complete the discharge process, you must download the agency contract, sign it, and send it back.
              </span>
              <a
                href="/images/dummy.pdf"
                download
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Download
                <DownloadIcon fontSize="small" className="ml-1" />
              </a>
            </div>
          </div>

          {/* Main User Detail */}
          <h3 className="mt-8 text-xl font-semibold">Main User Detail</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {userFields.map(f =>
              f.type === 'phone' ? (
                <div key={f.name} className="w-full">
                  <label className="block text-sm font-medium mb-1">{f.label}</label>
                  <PhoneInput
                    country={'us'}
                    value={(user as any)[f.name]}
                    onChange={phone => setUser(prev => ({ ...prev, [f.name]: phone }))}
                    inputProps={{
                      name: f.name,
                      required: !!f.required,
                    }}
                    containerClass="w-full"
                    inputStyle={{ width: '100%' }}
                  />
                </div>
              ) : f.type === 'select' ? (
                <TextField
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  select
                  required={!!f.required}
                  value={(user as any)[f.name]}
                  onChange={handleUserChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: selected => (selected as string) || placeholderMap[f.name],
                  }}
                >
                  {f.options?.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  type={f.type}
                  required={!!f.required}
                  value={(user as any)[f.name]}
                  onChange={handleUserChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  placeholder={`Enter ${f.label}`}
                />
              )
            )}
          </div>

          {/* Captcha */}
          <h3 className="mt-8 text-xl font-semibold">Captcha</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-sm font-medium">Captcha</label>
              <div className="mt-1 flex items-center space-x-2">
                <div className="px-4 py-2 border rounded bg-gray-100 font-mono text-lg tracking-widest">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-2 border rounded hover:bg-gray-100"
                >
                  🔁
                </button>
              </div>
            </div>
            <TextField
              name="captchaInput"
              label="Enter Captcha"
              required
              value={captchaInput}
              onChange={handleCaptchaChange}
              fullWidth
              variant="outlined"
              placeholder="Enter Captcha"
              InputLabelProps={{ shrink: true }}
            />
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="reset"
              disabled={loading}
              onClick={() => {
                setAgency({
                  agencyName: '',
                  country: '',
                  city: '',
                  postCode: '',
                  address: '',
                  website: '',
                  phoneNumber: '',
                  email: '',
                  businessCurrency: '',
                  vat: '',
                })
                setUser({
                  title: '',
                  firstName: '',
                  lastName: '',
                  emailId: '',
                  designation: '',
                  mobileNumber: '',
                  userName: '',
                  password: '',
                })
                setLicenseBase64('')
                setLicenseName('')
                refreshCaptcha()
                setError(null)
              }}
              className="px-6 py-2 border rounded disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Snackbar for toast messages */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={6000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  )
}
