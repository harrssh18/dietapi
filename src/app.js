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
        console.log(req.body)
        console.log(cost,name,meals)
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

//edit or delete

app.get('/get-ingredients',AdminverifyToken,async(req,res)=>{
    try{
        const data = await Ingredient.find()
        res.render('get-ingredients',{"ingre":data});
    }
    catch(error){
        res.send(error)
    }
}); 

app.get('/get-ingredient/:id',AdminverifyToken,async (req,res)=>{
    try {
        const _id = req.params.id;
        const data = await Ingredient.findById(_id);
        res.render("edit-ingredient",{"name":data.name,"id":_id})
    } catch (error) {
        res.send(error)
    }
});

app.post('/del-ingredient/:id',AdminverifyToken,async(req,res)=>{
    try {
    const _id = req.params.id;
    const del = await Ingredient.findByIdAndDelete(_id);
    res.redirect('/get-ingredients/')
    } catch (error) {
        res.send(error)
    }
}); 

app.post('/get-ingredient/:id',AdminverifyToken,async(req,res)=>{
    try {
        const _id = req.params.id;
        const result = await Ingredient.findByIdAndUpdate(_id,req.body,{new:true});
        const d = await result.save()
        res.redirect('/get-ingredients/')
    } catch (error) {
        res.send(error)
    }
});


app.get('/get-recipies',AdminverifyToken,async (req,res)=>{
    try {
        const data = await Recipie.find();
        res.render('get-recipies',{"reci":data})
    } catch (error) {
        res.send(error)
    }
});

app.get("/edit_recipie/:id",AdminverifyToken,async (req,res)=>{
    try {
        const arr = []
        const _id = req.params.id
        const data = await Recipie.findById(_id)
        const ingre = await Ingredient.find()
        for (let i in data.ingredient){ 
            const ing = await Ingredient.findById({_id:data.ingredient[i]})
            arr.push(ing)
        }
        res.render("edit-recipie",{"ingre":ingre,"rename":data.name,"redesc":data.desc,"reimg":data.img,"ing":arr,"id":_id})
    } catch (error) {
        res.send(error)
    }
});

app.post('/edit_recipie/:id',AdminverifyToken,imageUpload,async (req,res) => {
    try {
        const _id = req.params.id
        const name = req.body.name
        const desc = req.body.desc
        const img = req.body.file
        const ingre = req.body.ingres
        const result =await Recipie.findByIdAndUpdate(_id,{name:name,desc:desc,img:img,ingredient:ingre},{new:true});
        const d = await result.save()
        res.redirect('/get-recipies/')
    } catch (error) {
        res.send(error);
    }
});

app.post('/del-recipie/:id',AdminverifyToken,async (req,res) => {
    try {
        const _id = req.params.id
        const result = await Recipie.findByIdAndDelete(_id);
        res.redirect('/get-recipies/')
    } catch (error) {
        res.send(error);
    }
});


app.get('/get-meals',AdminverifyToken,async (req,res)=>{
    try {
        const data = await MealsPlan.find();
        res.render('get-meals',{"meals":data})
    } catch (error) {
        res.send(error)
    }
});

app.get("/edit_meal/:id",AdminverifyToken,async (req,res)=>{
    try {
        const _id = req.params.id
        const data = await MealsPlan.findById(_id)
        const reci = await Recipie.find()
        const bf = await Recipie.findById({_id:data.break_fast})
        const ms = await Recipie.findById({_id:data.morning_snacks})
        const lu = await Recipie.findById({_id:data.lunch})
        const as = await Recipie.findById({_id:data.afternoon_snacks})
        const di = await Recipie.findById({_id:data.dinner})
        res.render("edit-meal",{"id":_id,"bf":bf,"ms":ms,"lu":lu,"as":as,"di":di,'reci':reci,'data':data})
    } catch (error) {
        res.send(error)
    }
});


app.post('/edit_meal/:id',AdminverifyToken,async (req,res) => {
    try {
        const _id = req.params.id
        const name = req.body.name    
        const bf = req.body.bf
        const ms = req.body.ms
        const lu = req.body.lu
        const as = req.body.as
        const di = req.body.di
        const result =await MealsPlan.findByIdAndUpdate(_id,{name:name,break_fast:bf,morning_snacks:ms,lunch:lu,afternoon_snacks:as,dinner:di},{new:true});
        const d = await result.save()
        res.redirect('/get-meals/')
    } catch (error) {
        res.send(error);
    }
});

app.post('/del-meal/:id',AdminverifyToken,async (req,res) => {
    try {
        const _id = req.params.id
        const result = await MealsPlan.findByIdAndDelete(_id);
        res.redirect('/get-meals/')
    } catch (error) {
        res.send(error);
    }
});

app.get('/get-days',AdminverifyToken,async (req,res)=>{
    try {
        const data = await Days.find();
        res.render('get-days',{"data":data})
    } catch (error) {
        res.send(error)
    }
});

app.get("/edit_day/:id",AdminverifyToken,async (req,res)=>{
    try {
        const _id = req.params.id
        const data = await Days.findById(_id)
        const meal = await MealsPlan.findById({_id:data.meals})
        const meals = await MealsPlan.find()
        res.render("edit-days",{"id":_id,'mealname':meal.name,'mealid':meal._id,'data':data,"meals":meals})
    } catch (error) {
        res.send(error)
    }
});

app.post('/edit_day/:id',AdminverifyToken,async (req,res) => {
    try {
        const _id = req.params.id
        const name = req.body.name    
        const cost = req.body.cost
        const meals = req.body.meals
        const result =await Days.findByIdAndUpdate(_id,{name:name,cost:cost,meals:meals},{new:true});
        const d = await result.save()
        res.redirect('/get-days/')
    } catch (error) {
        res.send(error);
    }
});

app.post('/del-day/:id',AdminverifyToken,async (req,res) => {
    try {
        const _id = req.params.id
        const result = await Days.findByIdAndDelete(_id);
        res.redirect('/get-days/')
    } catch (error) {
        res.send(error);
    }
});

app.post('/del-days/:id',AdminverifyToken,async (req,res) => {
    try {
        const _id = req.params.id
        const result = await MealsPlan.findByIdAndDelete(_id);
        res.redirect('/get-days/')
    } catch (error) {
        res.send(error);
    }
});


app.listen(3000,()=>{
    console.log("Serving On this port 3000")
});
