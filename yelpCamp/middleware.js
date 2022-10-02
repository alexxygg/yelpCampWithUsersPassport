module.exports.isLoggedIn = (req, res, next) => {
  //A passport data , user and email
  console.log("REQ.USER----", req.user);
  if (!req.isAuthenticated()) {
    //Store their request to take them there once logged in
    //We had to downgrade passport version to passport@0.5.0
    console.log(
      "Visitor not logged in tried to access: ",
      req.path,
      req.originalUrl
    );
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in.");
    return res.redirect("/login");
  }
  next();
};
