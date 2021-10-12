const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://harsh:dubey@diet.nloju.mongodb.net/dietapi")
.then(() => {
    console.log('DB Connected')
}).catch((e)=>{
    console.log('e')
});