const regForm = document.getElementById('register-form')
const loginForm = document.getElementById('login-form')
const name = document.getElementById('name')
const loginInp = document.getElementById('login')
const passwordInp = document.getElementById('password')
const passwordRepeat = document.getElementById('repeat-password')

regForm.addEventListener('submit', (e) => {
  e.preventDefault()

  if (checkInputs()) addNewUser()

})

loginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const formValues = Object.fromEntries([...new FormData(loginForm).entries()])

  if (loginCheckInputs(formValues)) logIn(formValues)

})

function loginCheckInputs({ login, password }) {
  const [loginInput, passwordInput] = loginForm.elements
  login = login.trim()
  password = password.trim()
  let status = true

  if (login === '') {
    setErrorFor(loginInput, 'Login cannot be empty')
    status = false
  } else {
    setSuccessFor(loginInput)
  }

  if (password === '') {
    setErrorFor(passwordInput, 'Password cannot be empty')
    status = false
  } else {
    setSuccessFor(passwordInput)
  }
  return status
}

function logIn(formValues) {
  return fetch('/login', { method: 'POST', body: JSON.stringify(formValues) })
    .then(response => response.json())
    .then(answer => {
      if (!answer.error) {
        localStorage.jwt = answer.accessToken
        location.href = '/users.html'

      }
      else alert(answer.error)
    })
}

function isPassword(password) {
  return this.value.match(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8})$/).test(password)
}

function setErrorFor(input, message) {
  const formControl = input.parentElement; // form-control div
  const small = formControl.querySelector('small')

  // add error message inside small tag
  small.innerText = message

  // add error class 
  formControl.classList.add('error')
  formControl.classList.remove('success')
}

function setSuccessFor(input) {
  const formControl = input.parentElement
  const small = formControl.querySelector('small')
  formControl.classList.add('success')
  formControl.classList.remove('error')
  small.innerText = ''
}

function showRegisterForm() {
  document.getElementById('register-form').hidden = false;
  document.getElementById('login-form').hidden = true;
}

function showLoginForm() {
  document.getElementById('register-form').hidden = true;
  document.getElementById('login-form').hidden = false;
}

function addNewUser() {
  const formValues = Object.fromEntries([...new FormData(regForm).entries()])
  isLoginFree(formValues.login).then(free => {
    if (free) {
      fetch('/newuser', { method: 'POST', body: JSON.stringify(formValues) })
      regForm.reset()
      alert('You succesfully registered. Now please log in')
      showLoginForm()
    } else {
      setErrorFor(loginInp, 'This login is already in use')
    }
  })
}

function isLoginFree(login) {
  return fetch('/check/' + login).then(response => response.text()).then(answer => answer == 'free' ? true : false)
}

function checkInputs() {
  // get the values from the inputs
  const nameValue = name.value.trim()
  const loginValue = loginInp.value.trim()
  const passwordValue = passwordInp.value.trim()
  const passwordRepeatValue = passwordRepeat.value.trim()

  let status = true;

  if (nameValue === '') {
    setErrorFor(name, 'Name cannot be empty')
    status = false;
  } else {
    setSuccessFor(name)
  }
  if (loginValue === '') {
    setErrorFor(loginInp, 'Login cannot be empty')
    status = false;
  } else {
    setSuccessFor(loginInp)
  }
  if (passwordValue === '') {
    setErrorFor(passwordInp, 'Password cannot be empty')
    status = false;
  } else {
    setSuccessFor(passwordInp)
  }
  if (passwordRepeatValue === '') {
    setErrorFor(passwordRepeat, 'Password cannot be empty')
    status = false;
  } else if (passwordValue !== passwordRepeatValue) {
    setErrorFor(passwordRepeat, 'Passwords should be the same')
    status = false;
  }

  else {
    setSuccessFor(passwordRepeat)
  }
  return status
}
