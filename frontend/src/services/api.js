const BASE_URL = import.meta.env.VITE_API_URL

export const fetchHello = async () => {
  const response = await fetch(`${BASE_URL}/api/hello`)
  const data = await response.json()
  return data
}

export const loginUser = async (credentials) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  const data = await response.json()
  return data
}

export const registerUser = async (userInfo) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInfo)
  })
  const data = await response.json()
  return data
}

export const sendMessage = async (message) => {
  const response = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
  const data = await response.json()
  return data
}

export const getMessages = async () => {
  const response = await fetch(`${BASE_URL}/api/messages`)
  const data = await response.json()
  return data
}