const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors")
require("dotenv").config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

// verifyJwt link 
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

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
    // all collection mongodb 
    const InstructorsCollection = client.db("CreactArtSchool").collection("Instructors");
    const classCollection = client.db("CreactArtSchool").collection("class");
    const UserCollection = client.db("CreactArtSchool").collection("user");
    const ClassSeletedCollection = client.db("CreactArtSchool").collection("ClassSeleted");

  //  this is the token jwt
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })


  // this is the selate data class
    app.post('/ClassSeleted', async (req, res) => {
      const user = req.body;
      const result = await ClassSeletedCollection.insertOne(user);
      res.send(result);
  })

  // this is the selate data class
  app.get('/ClassSeleted', async (req, res)=>{
    const items = ClassSeletedCollection.find();
    const result = await items.toArray();
    res.send(result);
  });


    // this is the class add
    app.post('/class', async (req, res) => {
      const user = req.body;
      const result = await classCollection.insertOne(user);
      res.send(result);
  })

  //  user all data get
    app.get('/users', async (req, res)=>{
      const items = UserCollection.find();
      const result = await items.toArray();
      res.send(result);
    });

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
    // admin users
    app.get('/users/admin/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email: email}
      const user = await UserCollection.findOne(query)
      const result={admin: user?.role ==="admin"}
      res.send(result)
    })
    // admin kora
    app.patch('/users/admin/:id', async(req, res)=>{
      const id= req.params.id;
      const filter={_id: new ObjectId(id)};
      const updateDoc={
        $set:{
          role:'admin'
        }
      };
      const result= await UserCollection.updateOne(filter, updateDoc);
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
// this is  checked the mongodb
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})





