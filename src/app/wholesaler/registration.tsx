'use client'

import React, { useState, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import toast, { Toaster } from 'react-hot-toast'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { Country, State, City } from 'country-state-city'
import currencyCodes from 'currency-codes'
import ReactCountryFlag from 'react-country-flag'
import Autocomplete from '@mui/material/Autocomplete'

const REGISTER_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}agency/register`

const generateCaptcha = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function RegistrationForm() {
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
  const [wholesalerId, setWholesalerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [countryList, setCountryList] = useState<{ name: string; isoCode: string }[]>([])
  const [cityList, setCityList] = useState<string[]>([])
  const [currencyList, setCurrencyList] = useState<string[]>([])

  // For Autocomplete input display for country
  const [countryInput, setCountryInput] = useState<string>('')

  const phoneInputRef = useRef<HTMLInputElement>(null)
  const userPhoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCaptchaCode(generateCaptcha())
    const stored = localStorage.getItem('wholesalerId')
    setWholesalerId(stored)

    const countries = Country.getAllCountries() || []
    countries.sort((a, b) => a.name.localeCompare(b.name))
    const mapped = countries.map(c => ({ name: c.name, isoCode: c.isoCode }))
    setCountryList(mapped)

    if (agency.country) {
      const sel = mapped.find(c => c.isoCode === agency.country)
      if (sel) {
        setCountryInput(sel.name)
      }
    }

    const popularCurrencies = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF']
    const allCodes = currencyCodes.codes() || []
    const uniqueCodes = Array.from(new Set(allCodes.map(c => c.toUpperCase())))
    const rest = uniqueCodes
      .filter(code => !popularCurrencies.includes(code))
      .sort((a, b) => a.localeCompare(b))
    setCurrencyList([...popularCurrencies, ...rest])
  }, [])

  useEffect(() => {
    const countryIso = agency.country
    if (countryIso) {
      const states = State.getStatesOfCountry(countryIso) || []
      let citiesAccumulator: string[] = []
      states.forEach(st => {
        const cities = City.getCitiesOfState(countryIso, st.isoCode) || []
        cities.forEach(cityObj => {
          if (cityObj.name && !citiesAccumulator.includes(cityObj.name)) {
            citiesAccumulator.push(cityObj.name)
          }
        })
      })
      citiesAccumulator.sort((a, b) => a.localeCompare(b))
      setCityList(citiesAccumulator)
      setAgency(prev => ({ ...prev, city: '' }))
    } else {
      setCityList([])
      setAgency(prev => ({ ...prev, city: '' }))
    }
  }, [agency.country])

  const handleAgencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAgency(prev => ({ ...prev, [name]: value }))
  }

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser(prev => ({ ...prev, [name]: value }))
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

  const resetAll = () => {
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
    setCityList([])
    setCountryInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!wholesalerId) {
      toast.error('No wholesaler ID found in local storage.')
      setLoading(false)
      return
    }
    // License is now optional: do not block submission if licenseBase64 is empty
    if (captchaInput.trim() !== captchaCode) {
      toast.error('Captcha does not match.')
      setLoading(false)
      return
    }
    // Build payload; include licenseUrl only if provided
    const payload: any = {
      ...agency,
      ...user,
      wholesaler: wholesalerId,
    }
    if (licenseBase64) {
      payload.licenseUrl = licenseBase64
    }
    try {
      const res = await fetch(REGISTER_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || `Server ${res.status}: ${res.statusText}`)
      }
      toast.success('Registration successful!')
      resetAll()
    } catch (err: any) {
      toast.error(`Registration failed: ${err.message || 'Network error'}`)
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
    {
      name: 'country',
      label: 'Country',
      type: 'autocomplete',
      options: countryList,
      required: true,
    },
    {
      name: 'city', label: 'City', type: 'select', options: cityList, required: true,
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
      options: currencyList,
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
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 rounded-lg">
        <div className="relative flex items-center h-16">
          <div className="absolute left-0">
            <img src="/images/logo.jpg" alt="Logo" className="h-12 w-auto object-contain" />
          </div>
          <h2 className="mx-auto text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            Registration Form
          </h2>
        </div>
        {error && <div className="mt-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          <h3 className="mt-8 text-xl font-semibold">Agency Detail</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {agencyFields.map(f => {
              if (f.type === 'phone') {
                return (
                  <div key={f.name} className="w-full">
                    <label className="block text-sm font-medium mb-1">{f.label}</label>
                    <PhoneInput
                      ref={phoneInputRef}
                      country={'us'}
                      value={agency.phoneNumber}
                      onChange={phone => setAgency(prev => ({ ...prev, phoneNumber: phone }))}
                      onCountryChange={() => phoneInputRef.current?.focus()}
                      inputProps={{
                        name: 'phoneNumber',
                        required: true,
                      }}
                      containerClass="w-full"
                      inputStyle={{ width: '100%' }}
                    />
                  </div>
                )
              }
              if (f.type === 'autocomplete' && f.name === 'country') {
                return (
                  <Autocomplete
                    key="country-autocomplete"
                    options={countryList}
                    getOptionLabel={option => option.name}
                    value={countryList.find(c => c.isoCode === agency.country) || null}
                    inputValue={countryInput}
                    onInputChange={(event, newInput) => {
                      setCountryInput(newInput)
                    }}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setAgency(prev => ({ ...prev, country: newValue.isoCode, city: '' }))
                        setCountryInput(newValue.name)
                      } else {
                        setAgency(prev => ({ ...prev, country: '', city: '' }))
                        setCountryInput('')
                      }
                    }}
                    disableClearable
                    renderOption={(props, option) => (
                      <li {...props}>
                        <ReactCountryFlag
                          countryCode={option.isoCode}
                          svg
                          // increased gap in dropdown
                          style={{ width: '1.2em', height: '1.2em', marginRight: '0.5em' }}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={params => {
                      const selectedCountry = countryList.find(c => c.isoCode === agency.country)
                      return (
                        <TextField
                          {...params}
                          label="Country"
                          placeholder="Type to search country"
                          required
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: selectedCountry ? (
                              <InputAdornment position="start" sx={{ ml: 1 }}>
                                <ReactCountryFlag
                                  countryCode={selectedCountry.isoCode}
                                  svg
                                  style={{ width: '1.2em', height: '1.2em' }}
                                />
                              </InputAdornment>
                            ) : null,
                            endAdornment: selectedCountry ? (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setAgency(prev => ({ ...prev, country: '', city: '' }))
                                    setCountryInput('')
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ) : null,
                          }}
                          fullWidth
                        />
                      )
                    }}
                    fullWidth
                  />
                )
              }
              return (
                <TextField
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  type={f.type === 'select' ? undefined : f.type}
                  select={f.type === 'select'}
                  required={!!f.required}
                  value={(agency as any)[f.name]}
                  onChange={e => {
                    if (f.name === 'country') {
                      // handled by Autocomplete
                    } else {
                      handleAgencyChange(e)
                    }
                  }}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  placeholder={f.type !== 'select' ? `Enter ${f.label}` : undefined}
                  SelectProps={
                    f.type === 'select'
                      ? {
                          displayEmpty: true,
                          renderValue: selected => {
                            if (!selected) {
                              return placeholderMap[f.name]
                            }
                            return selected as string
                          },
                        }
                      : undefined
                  }
                >
                  {f.type === 'select' &&
                    (f.name === 'city'
                      ? cityList.map(opt => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))
                      : f.name === 'businessCurrency'
                      ? currencyList.map(opt => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))
                      : f.options?.map(opt => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        )))}
                </TextField>
              )
            })}
          </div>

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
                // removed required so submission is allowed without a license
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

          <h3 className="mt-8 text-xl font-semibold">Main User Detail</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {userFields.map(f =>
              f.type === 'phone' ? (
                <div key={f.name} className="w-full">
                  <label className="block text-sm font-medium mb-1">{f.label}</label>
                  <PhoneInput
                    ref={userPhoneInputRef}
                    country={'us'}
                    value={user.mobileNumber}
                    onChange={phone => setUser(prev => ({ ...prev, mobileNumber: phone }))}
                    onCountryChange={() => userPhoneInputRef.current?.focus()}
                    inputProps={{
                      name: 'mobileNumber',
                      required: true,
                    }}
                    containerClass="w-full"
                    inputStyle={{ width: '100%' }}
                  />
                </div>
              ) : (
                <TextField
                  key={f.name}
                  name={f.name}
                  label={f.label}
                  type={f.type === 'select' ? undefined : f.type}
                  select={f.type === 'select'}
                  required={!!f.required}
                  value={(user as any)[f.name]}
                  onChange={handleUserChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  placeholder={f.type !== 'select' ? `Enter ${f.label}` : undefined}
                  SelectProps={
                    f.type === 'select'
                      ? {
                          displayEmpty: true,
                          renderValue: selected => (selected as string) || placeholderMap[f.name],
                        }
                      : undefined
                  }
                >
                  {f.options?.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              )
            )}
          </div>

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
                  🔄
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

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="reset"
              disabled={loading}
              onClick={resetAll}
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
      </div>
    </div>
  )
}
