const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors")
require("dotenv").config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

//  this is the link 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ylfmjda.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const InstructorsCollection = client.db("CreactArtSchool").collection("Instructors");
    const classCollection = client.db("CreactArtSchool").collection("class");
    const UserCollection = client.db("CreactArtSchool").collection("user");

    // this is the user data save

    app.post('/users', async(req, res)=>{
      const user= req.body;
      const query ={email: user.email}
      const existingUser = await UserCollection.findOne(query);
      if (existingUser){
        return res.send({message: 'user already exissts'})
      }
      const result = await UserCollection.insertOne(user)
      res.send(result);
    })



    // this is the instructors data
    app.get('/Instructors', async (req, res) => {
      const items = InstructorsCollection.find();
      const result = await items.toArray();
      res.send(result);
    });

    // thsi is the class 
    app.get('/class', async (req, res) => {
      const items = classCollection.find();
      const result = await items.toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})





