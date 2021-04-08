const express = require('express');

const router = express.Router();
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const {Sequelize,Op}=require("sequelize");

const session=require("./sessions.js");
const {User,Session}=require("./db");
const matchCredentials = require('./utils.js');

//home route
router.get('/',(req,res)=>{
	let sessID=req.cookies.SID;
  res.render('pages/home',{title:"Home",session:sessID});
})

//create a user acount
router.post('/create',async function(req,res){
	let sessID=req.cookies.SID;
  let body=req.body;
  if(body.username!==""&&body.password!==""){
    const user=await User.create({
      username:body.username,
      password:body.password
    }).then((user)=>{
    	console.log(user.toJSON());

    });
		res.render("pages/home",{title:"Home",session:sessID})
  }else{
  res.render('pages/errors',{title:"Error",err_message:"Registration was Not Successful, Required are fields Empty",session:sessID})
  }

})

//login
router.post('/login',async(req,res)=>{
  let user= await User.findAll({
    where:{
      [Op.and]:[
      {username:req.body.username},
      {password:req.body.password}
      ]
    }
  }).then((user)=>{
    if(user.length>0){

      const sessid =uuidv4()

    let session=Session.create({
          user: user.id,
          timeOfLogin: Date.now(),
        	sessionID: sessid
      })

      res.cookie('SID', sessid, {
        expires: new Date(Date.now() + 900000),
        httpOnly: true
      })
      console.log(JSON.stringify(session));
       res.render("pages/members",{title:"Members Home",session:sessid});

    }else{
      res.render('pages/errors',{title:"Error",err_message:"Wrong Username or Passwor",session:undefined})
      console.log("Invalid Username or Password")

    }
  })


})

//go to login page
router.get('/login',(req,res)=>{
	let sessID=req.cookies.SID;
res.render("pages/login",{title:"Login",session:sessID});
})

//registration route
router.get('/register',(req,res)=>{
	let sessID=req.cookies.SID;
res.render("pages/register",{title:"Create Account",session:sessID});
})

//logout route
router.get('/logout',async(req,res)=>{
  let SID=req.cookies.SID;
if(SID!==undefined){
  res.cookie("SID","",{expires:new Date(Date.now()-900000)})
await Session.destroy({
  where:{
    sessionID:SID
  }
}).then(()=>{
  res.redirect('/');
  console.log("All Sessions Destroyed and Loged Out");
})


}else{
  res.redirect('/');
}


})


//this is a protected homepage.
router.get('/profile',async(req,res)=>{
let sessID=req.cookies.SID;
if(sessID!==undefined){
  let sess= await Session.findAll({
    where:{
      sessionID:sessID
    }
  }).then((sess)=>{
    //if session is undefined than this will be false
    if(sess.length>0){
      res.render('pages/members',{title:"Members Home",session:sessID});

    }
  });

}else{
  res.render('pages/errors',{title:"Error",err_message:"You have  not loged in"});
}



})

//if something goes wrong,you get sent here
router.get('/errors',(req,res)=>{
  res.render('pages/errors',{title:"Error"});
})
//404 handling
router.get("*",(req,res)=>{
  res.render("pages/errors",{title:"Error",err_message:"404"});
})

module.exports=router
