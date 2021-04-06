const express = require('express');

const router = express.Router();
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const {Sequelize,Model,DataTypes,Op}=require("sequelize");
const matchCredentials = require('./utils.js')
const session=require("./sessions.js")
const {User}=require("./db")

router.get('/',(req,res)=>{
  res.render('pages/home',{title:"Home",session:session.sessions[req.cookies.SID]});
})

//create a user acount
router.post('/create',async function(req,res){
  let body=req.body;
  if(body.username!==""&&body.password!==""){
    const user=await User.create({
      username:body.username,
      password:body.password
    });
    console.log(user.toJSON());
    res.redirect('/')
  }else{
  res.render('pages/errors',{title:"Error",err_message:"Registration was Not Successful, Required are fields Empty",session:session.sessions[req.cookies.SID]})
  }

})

//login
router.post('/login',(req,res)=>{
  let body=req.body;
  User.findAll({
    where:{
      [Op.and]:[
        {username:body.username},{password:body.password}
      ]}
    }).then((user)=>{
      if(user.length>0){
          let id=uuidv4();
          session.sessions[id]={
                user:user,
                timeOfLogin:Date.now()
              }
          res.cookie("SID",id,{expires:new Date(Date.now()+900000),httpOnly:true})

            res.render("pages/members",{title:"Members Home",person:session.sessions[id].user.username,session:session.sessions[id]});
        //res.send(JSON.stringify(user));
        console.log(user)
      }else{
        res.render('pages/errors',{title:"Error",err_message:"Wrong Username or Password",session:session.sessions[req.cookies.SID]})
        console.log("Invalid Username or Password")
      }

  })
})

router.get('/login',(req,res)=>{
res.render("pages/login",{title:"Login",session:session.sessions[req.cookies.SID]});
})
router.get('/register',(req,res)=>{
res.render("pages/register",{title:"Create Account",session:session.sessions[req.cookies.SID]});
})





router.get('/logout',(req,res)=>{
  let SID=req.cookies.SID;
  delete session.sessions[SID];
  res.cookie("SID","",{expires:new Date(Date.now()-900000)})
  //console.log(SID);
  //res.cookie("SID","",{expires:0});
  res.redirect('/');
  console.log("All Sessions Destroyed and Loged Out");
})


//this is a protected homepage.
router.get('/profile',(req,res)=>{
let id=req.cookies.SID;
let sess=session.sessions[id];
//if session is undefined than this will be false
if(sess){
  res.render('pages/members',{title:"Members Home",person:session.sessions[id].user.username,session:session.sessions[id]});

}else{
  res.render('pages/errors',{title:"Error",err_message:"You have  not loged in",session:session.sessions[id]});

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
