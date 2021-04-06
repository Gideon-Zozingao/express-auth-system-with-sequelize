const {Sequelize,Model,DataTypes,Op}=require("sequelize");

const {User}=require("./db.js")
function matchCredentials(requestBody){
  let user=User.findOne({
  	where:{
  		[Op.and]:[
  		{username:requestBody.username},{password:requestBody.password}
  		]
  	}
  })

  if(user!==undefined){

	return true;

  }else{

    return false;

  }
}
module.exports=matchCredentials
