const express =  require('express')
const app = express()

require('./db/conn');
const path = require("path")
const Ingredient = require('./models/model');
const Recipie = require('./models/recipie');
const Days = require('./models/days');
const hbs = require('hbs');
const MealsPlan = require('./models/mealsplan');
const bodyParser = require('body-parser');
const multer = require('multer');
const Admin = require('./models/admin');
const bcryptjs = require('bcryptjs');
const session = require('express-session');
const AdminverifyToken = require('./middelware/admin-auth');
const cookieParser = require("cookie-parser");



const templatePath = path.join(__dirname,'../templates/views');
const partialsPath = path.join(__dirname,'../templates/partials');
app.use(cookieParser());
app.set('view engine','hbs')
app.set('views',templatePath);
hbs.registerPartials(partialsPath);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const imageStorage = multer.diskStorage({  
    destination: './public/images', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
    }
});
const imageUpload = multer({
    storage: imageStorage}).single('file');

app.get("/add_ingredient",AdminverifyToken,async (req,res)=>{
    try{
        res.render('ingredient')
    }
    catch(e){
            res.send(e);
        }
    });

app.post('/add_ingredient',AdminverifyToken,async (req,res) => {
    try {
        const ingre = req.body.ingre
        const data = new Ingredient({name:ingre})
        const AddData = await data.save()
        res.redirect('/add_ingredient/');
    } catch (error) {
        res.send(error);
    }
});

app.get("/add_recipie",AdminverifyToken,async (req,res)=>{
    try{
        const ingre = await Ingredient.find();
        res.render('add_recipie',{'ingre':ingre});
            
    }catch(e){
        res.send(e);
    }
});

app.post('/add_recipie',AdminverifyToken,imageUpload,async (req,res) => {
    try {
        const ingres = req.body.ingres
        const name = req.body.name
        const desc = req.body.desc
        const img = req.file.filename
        const data = new Recipie({name:name,desc:desc,img:img,ingredient:ingres})
        const result = await data.save()
        res.redirect('/add_recipie/')
    } catch (error) {
        res.send(error);
    }
});

app.get("/add_meals",AdminverifyToken,async (req,res)=>{
   try {
        const reci = await Recipie.find();
        res.render('meals',{'reci':reci});
        }
    catch (error) {
       res.send(error)
   } 
});

app.post('/add_meals',AdminverifyToken,async (req,res) => {
    try {
        
    const name = req.body.name
    const bf = req.body.bf
    const ms = req.body.ms
    const lu = req.body.lu
    const as = req.body.as
    const di = req.body.di

    const data = new MealsPlan({name:name,break_fast:bf,morning_snacks:ms,lunch:lu,afternoon_snacks:as,dinner:di})
    const result = await data.save()
    res.redirect('/add_meals/')
    }
    catch (error) {
        res.send(error);
    }
});

app.get("/add_days",AdminverifyToken,async (req,res)=>{
    try {
        const meals = await MealsPlan.find();
        res.render('days',{'meals':meals})
    } catch (error) {
        res.send(error)
    } 
 });

app.post('/add_days',AdminverifyToken,async (req,res) => {
    try {
        const cost = req.body.cost
        const name = req.body.name
        const meals = req.body.meals
        const data = new Days({day:name,cost:cost,meals:meals})
        const result = await data.save()
        res.redirect('/add_days/')
    } catch (error) {
        res.send(error);
    }
});

app.get('/days', async (req,res)=>{
    const data = await Days.find()
    res.send(data)
});

app.get('/ingredients', async (req,res)=>{
    const data = await Ingredient.find()
    res.send(data)
});

app.get('/recipie', async (req,res)=>{
    const data = await Recipie.find()
    res.send(data)
});

app.get('/meals', async (req,res)=>{
    const data = await MealsPlan.find()
    res.send(data)
});

app.get('/admin_register',(req,res)=>{
    try {
        if (req.cookies.jwt == undefined){
        res.render('admin-register');
        }
        else{
            res.redirect('/admin-profile/')
        }
    } catch (error) {
        res.send(error)
    }
});

app.post('/admin_register',async (req,res)=>{
    try {
        if (req.cookies.jwt == undefined){
            if (req.body.password == req.body.password2){
            const user = new Admin(req.body)
            const result = await user.save()
            res.redirect('/admin-login/')
            }
            else{
                res.send("Password Not Match!!")
            }
        }
        else{
            res.redirect('/admin-profile/')
        }
    } catch (error) {
        res.send(error)
    }
});




app.get('/admin-login', (req,res)=>{
    try {
        if (req.cookies.jwt == undefined){
            res.render('admin-login',{user:true});
        }
        else{
            res.redirect('/admin-profile/');
        }
    } catch (error) {
        res.send(error)
    }
});

app.post('/admin-login',async(req,res)=>{
   try {
        if (req.cookies.jwt == undefined){
        const data = await Admin.findOne({email:req.body.email})
        const verify = await bcryptjs.compare(req.body.password,data.password);
            if (verify){
                    const token = await data.generateAuthToken();
                    res.cookie('jwt',token,{expires: new Date(Date.now()+86400*1000)});
                    res.redirect('/admin-profile/');
                }
        }
        else{
            res.redirect('/admin-profile/')
        }
   } catch (error) {
       res.send(error);
   }
});

app.get('/admin-profile',AdminverifyToken, (req,res)=>{
    try {
        res.render('profile')
        }
    catch (error) {
        res.send(error)
    }
});

app.get('/admin-logout',async(req,res)=>{
    try {
        if (req.cookies.jwt != undefined){
        res.clearCookie("jwt");
        res.redirect('/admin-login/');
        }
        else{
            res.redirect('/admin-login/')
        }
    }
    catch (error) {
        res.send(error)
    }
});

app.get('/',(req,res)=>{
    try {
        if (req.cookies.jwt == undefined){
        res.render('home')
        }
        else{
            res.redirect('admin-profile')
        }
    }
    catch (error) {
        res.send(error)
    }
});

app.get('/error', (req,res)=>{
    res.render('error')
});

app.listen(3000,()=>{
    console.log("Serving On this port 3000")
});
