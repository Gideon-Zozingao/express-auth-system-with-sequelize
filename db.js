const {Sequelize,Model,DataTypes,Op}=require("sequelize");

const sequelize=new Sequelize("sqlite::memory:");
try{
   sequelize.authenticate()
  console.log("Connection hase been  to the database server has been Established");
}catch(error){
  console.error(`Unable to conect to the Database ${error}`)
}

class User extends Model{};
User.init({
    username:DataTypes.STRING,
    password:DataTypes.STRING
},{sequelize,modelName:"user"});

 class Session extends Model{}
 Session.init({
   sessionID:DataTypes.UUID,
   user:DataTypes.STRING,
   timeOfLogin:DataTypes.DATE

 },{sequelize,moelName:"session"});

(async()=>{
    await sequelize.sync()
})()

let models={
    User:User,
    Session:Session
}

module.exports=models
