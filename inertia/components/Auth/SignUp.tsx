import { Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import SignUpSchema from '@/schemas/SignUpSchema'
import FormField from './FormField'
import { useEffect, useState } from 'react'
import useDebounce from '@/hooks/useDebounce'

export default function SignUp() {
  const { t } = useTranslation()
  const [emailValue, setEmailValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isCheckingPhone, setIsCheckingPhone] = useState(false)

  const debouncedEmail = useDebounce(emailValue, 500)
  const debouncedPhone = useDebounce(phoneValue, 500)

  // Validate email existence
  useEffect(() => {
    if (!debouncedEmail || !debouncedEmail.includes('@')) {
      setEmailError(null)
      setIsCheckingEmail(false)
      return
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(debouncedEmail)) {
      setEmailError(null) // Let Yup handle format validation
      setIsCheckingEmail(false)
      return
    }

    setIsCheckingEmail(true)
    let isCancelled = false
    
    axios
      .get(`/api/auth/check-email?email=${encodeURIComponent(debouncedEmail)}`)
      .then((response) => {
        if (!isCancelled) {
          if (!response.data.available) {
            setEmailError('Email is already in use')
          } else {
            setEmailError(null)
          }
          setIsCheckingEmail(false)
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          // Silently fail - validation will happen on submit
          setEmailError(null)
          setIsCheckingEmail(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [debouncedEmail])

  // Validate phone existence
  useEffect(() => {
    if (!debouncedPhone || debouncedPhone.length < 7) {
      setPhoneError(null)
      setIsCheckingPhone(false)
      return
    }

    // Basic phone format check
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
    if (!phoneRegex.test(debouncedPhone)) {
      setPhoneError(null) // Let Yup handle format validation
      setIsCheckingPhone(false)
      return
    }

    setIsCheckingPhone(true)
    let isCancelled = false
    
    axios
      .get(`/api/auth/check-phone?phone=${encodeURIComponent(debouncedPhone)}`)
      .then((response) => {
        if (!isCancelled) {
          if (!response.data.available) {
            setPhoneError('Phone number is already in use')
          } else {
            setPhoneError(null)
          }
          setIsCheckingPhone(false)
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          // Silently fail - validation will happen on submit
          setPhoneError(null)
          setIsCheckingPhone(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [debouncedPhone])

  const fields = [
    { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Enter your first name' },
    { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Enter your last name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
    { name: 'phoneNumber', label: 'Phone', type: 'tel', placeholder: 'Enter your phone' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Re-enter password'
    }
  ]

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        confirmPassword: ''
      }}
      validationSchema={SignUpSchema}
      validateOnChange={true}
      validateOnBlur={true}
      onSubmit={async (values, actions) => {
        // Final check for email/phone existence before submitting
        if (emailError) {
          actions.setFieldError('email', emailError)
          return
        }
        if (phoneError) {
          actions.setFieldError('phoneNumber', phoneError)
          return
        }

        try {
          actions.setSubmitting(true)
          const { data } = await axios.post('/api/auth/register', values)
          if (data.success && data?.user?.id) {
            if (data.emailError) {
              toast.warning(t(data.message || 'Account created but verification email failed'), {
                description: `Error: ${data.emailError.code || 'MAIL_ERROR'} - ${data.emailError.message || 'Unknown error'}`,
                duration: 10000,
              })
            } else {
              toast.success(t(data.message || 'Account created successfully'))
            }
          }
        } catch (e: any) {
          toast.error(e?.response?.data?.message || t('Something went wrong'))
        } finally {
          actions.setSubmitting(false)
        }
      }}
    >
      {({ isSubmitting, setFieldValue }) => {

        return (
          <Form className="space-y-4">
            {fields.map((field) => {
              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue(field.name, e.target.value)
                if (field.name === 'email') {
                  setEmailValue(e.target.value)
                } else if (field.name === 'phoneNumber') {
                  setPhoneValue(e.target.value)
                }
              }

              return (
                <FormField 
                  key={field.name} 
                  {...field}
                  onChange={handleChange}
                  customError={
                    (field.name === 'email' && emailError) || 
                    (field.name === 'phoneNumber' && phoneError)
                      ? emailError || phoneError
                      : undefined
                  }
                  isLoading={
                    (field.name === 'email' && isCheckingEmail) ||
                    (field.name === 'phoneNumber' && isCheckingPhone)
                  }
                />
              )
            })}

            <div className="flex justify-end">
              <Button
                variant="solid"
                colorScheme="primary"
                isLoading={isSubmitting}
                type="submit"
                className="button-primary"
              >
                {t('Sign Up')}
              </Button>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}
