// if user hasLoggedOut, but try to access routes that's not
//redirect ot home page
// if not let the routes run the actual logic
const isLoggedIn = (req, res, next) => {
  if(req.user) {
    res.redirect('/')
  } else {
    next()
  }
}

// the opposite of the function above
const hasLoggedOut = (req, res, next) => {
  if(req.user) {
    next()
  } else {
    res.redirect('/')
  }
}

module.exports = {
  hasLoggedOut,
  isLoggedIn
}
