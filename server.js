process.env.GOOGLE_APPLICATION_CREDENTIALS = 'secrets/firebase-service-account-secrets.json'

const express = require("express");
const { getAncientWisdom } = require("./bookOfAncientWisdom");
const {initializeApp} = require('firebase-admin/app')
initializeApp()
const {getAuth} = require('firebase-admin/auth')

const cors = require("cors");

const app = express();
app.use(cors());

const port = process.env.PORT || 4000;


//This route stays public for all
app.get("/", (req, res) => {
  res.send("Time (not secret): " + new Date());
});

//TODO: Your task will be to secure this route to prevent access by those who are not, at least, logged in.
app.get("/wisdom", checkIsAuthenticated,  async (req, res) => {
  try {
    console.log('uid in route handler', req.uid)
    res.send("🤐: " + getAncientWisdom() + "🤫").status(200);
  }catch(e){
    console.log(e)
    res.status(401).send(e)
  }
  
});

async function checkIsAuthenticated(req, res, next){
  const authHeaderVal = req.headers.authorization

  if(!authHeaderVal){
    res.status(400).send('oops no authorization header')
    return
  }
  const idToken = authHeaderVal.slice(7)
  try {
    const responseFromAuth = await getAuth().verifyIdToken(idToken)
    const uid = responseFromAuth.uid
    req.uid = uid
    console.log('sucess', uid)
    next()
  }catch(err){
    res.status(401).send('token did not verify')
  }
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
