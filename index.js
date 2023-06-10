const express = require('express');
const app = express() ;
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000 ;

// middleware 
app.use(cors())
app.use(express.json())

// Database


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.40yptof.mongodb.net/?retryWrites=true&w=majority`;

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
    const classesCollection = client.db("cricket").collection("classes");
    const studentClassCollection = client.db("cricket").collection("studentClass");
    const usersCollection = client.db("cricket").collection("users");

    // users collectons 
    app.post("/users" , async (req , res ) => {
      const user = req.body ;
      const quary = {email : user.email};
      const existUser = await usersCollection.findOne(quary) ;
      if(existUser) {
        return res.send({message : "already have user"})
      }
      const result = await usersCollection.insertOne(user) ;
      res.send(result)
    })

    app.get("/classes" , async (req , res) => {
        const quary = {} ;
        const options = {
            sort: { availableSeats : -1 },
          };
        const result = await classesCollection.find(quary ,options).limit(6).toArray();
        res.send(result)
    })

    app.post("/studentsClass" , async(req , res ) => {
      const studenClass = req.body ;
      const result = await studentClassCollection.insertOne(studenClass) ;
      res.send(result)
    })

    app.get("/studentsClass" , async (req , res) => {
      const result = await studentClassCollection.find().toArray();
      res.send(result)
    })

    app.delete("/studentsClass/:id" , async(req, res) => {
      const id = req.params.id ;
      console.log(id)
      const query = {_id : new ObjectId(id)} ;
      const result = await studentClassCollection.deleteOne(query) ;
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.connect();
  }
}
run().catch(console.dir);



app.get("/" , (req , res) => {
    res.send("cricket is runiing")
})

app.listen(port , () => {
    console.log("server is running")
})