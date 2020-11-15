const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcryptjs");
const bodyparser = require("body-parser");
const { ServiceProvider , validateServiceProvider, validateLogin } = require('../../models/Service Provider/ServiceProvider');
const { setToken } = require("../../auth/auth");
const {WorkHistory}= require('../../models/Service Provider/WorkHistory');
const email = require("./email");
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: false }));

// Service provider sign-up fr-
 router.post("/signup", async (req,res) => {

    console.log(
        "signUp Backend ",
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        req.body.password,
        req.body.servicetype,
        req.body.contactno
      );
  // Validate Schema
  const { error } = validateServiceProvider(req.body);
  if (error) {
    console.log("validation Error", error);
    return res.status(400).send(error.details[0].message);
  }

  // Check if this Service Provider already exisits
  let user = await ServiceProvider.findOne({ email: req.body.email });
  if (user) {
    console.log("Service Provider already exists");
    return res.status(400).send("Service Provider already exists!");
  } 
  // Insert the new Service Provider if they do not exist yet
  else {
    try {
      user = new ServiceProvider({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        servicetype: req.body.servicetype,
        password: req.body.password,
        contactno: req.body.contactno
      });
    } catch (ex) {
      console.log("Error in creating Service Provider", ex);
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    const token = setToken(user._id, user.isApproved, user.email, user.isAdmin);
    console.log("token", token);
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(token);
  }

 });

 // Service Provider Log-in fr-
 router.post("/login", async (req, res) => {
    const { error } = validateLogin(req.body);
  
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
  
    let user = await ServiceProvider.findOne({ email: req.body.email });
    if (user) {
      const validatePassword = await bcrypt.compare(req.body.password,user.password);
      if (!validatePassword)
      {
           res.status(400)
      }    
      try{
      const token = setToken(user._id, user.email, user.isAdmin, user.isApproved);
      res
        .header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .send(token)
        .status(200)
      }
      catch(ex){
         console.log("Setting token Exception" , ex)
      }
    }else
    { 
      res.status(400).send("No Registered ServiceProvider exists");
    }
    });

    router.get("/view", async (req, res) => {
      const jwt = decode(req.header("x-auth-token"));
      const task = await WorkHistory.find({serviceprovider:jwt.id});
      if (!task) res.status(400);
      res.send(task);
    });
    router.get("/email:id", async (req, res) => {
      const task = await ServiceProvider.findById({_id:req.params.id});
      if (!task) res.status(400);
      res.send(task.email);
    });
    router.post("/getdata", async (req,res)=>{

      const task = await ServiceProvider.find({email:req.body.email});
      if (!task) res.status(400);
      res.send(task);

    });

    router.put("/edit",async (req,res)=>{

      const task = await ServiceProvider.find({email:req.body.esearchemail});

      console.log(task);
      await ServiceProvider.update(
        {email:req.body.esearchemail},
        {
          $set: {
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            servicetype:req.body.servicetype,
            password:req.body.password,
            contactno:req.body.contactno
          },
        },
        { new: true }
      );

      if (!task) {res.status(400)}else{res.send(200)};
    });

    router.post("/del", async (req,res)=>{
      const task = await ServiceProvider.findOne({email:req.body.dsearchemail});
      if(task){

        task.deleteOne({_id:task._id});
        res.send(200);
    }
    else{

        console.log("serviceprovider not found"+req.body.dsearchemail);
        return res.status(400).send("serviceprovider not exists!");

    }


    });


 router.update;
 module.exports = router;