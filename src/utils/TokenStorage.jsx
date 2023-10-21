import jwtDecode from "jwt-decode"

export function TokenStorage() {
  const tokenStore = localStorage.getItem('token')

  if (!tokenStore) {
    return { tokenValid: false }
  }
  const { exp } = jwtDecode(tokenStore)
  const expirationTime = exp * 1000
  const currentTime = new Date().getTime()
  const timeBeforeExpiration = 1200000
  const isValid = currentTime < expirationTime - timeBeforeExpiration
  const decodedToken = jwtDecode(tokenStore)

  if (isValid) {
    return { tokenValid: true, token: tokenStore, decoded: decodedToken }
  }
  
  return { tokenValid: false, token: tokenStore, decoded: decodedToken }
}