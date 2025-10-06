const express =require('express')
const cors=require('cors')
const app=express()
require("dotenv").config();

const port = 3000;
const uploadquiz =require('./routers/uploadquiz')
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/api',uploadquiz)
console.log("Gemini key loaded?", !!process.env.GEMINI_API_KEY);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})