const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

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
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let role;
      if (user.role === "admin") {
        role = "admin";
      } else if (user.role === "instructor") {
        role = "instructor";
      } else {
        role = "student";
      }

      res.json({ email: email, role: role });
    });


    app.get("/classes/approved" , async(req , res) => {
      const role = "approved" ;
      const query = {role : role}
      const approvedClass = await classesCollection.find(query).toArray()
      res.send(approvedClass)
    })



    app.post("/users", async (req, res) => {
      const user = req.body;
      const quary = { email: user.email };
      const existUser = await usersCollection.findOne(quary);
      if (existUser) {
        return res.send({ message: "already have user" })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result)
    })


    // admin manage class 

    app.patch("/classes/approved/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'approved'
        },
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result)
    })
    app.patch("/classes/deny/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'deny'
        },
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result)
    })





    // instructor added classes 

    app.get("/classes", async (req, res) => {
      const quary = {};
      const options = {
        sort: { seat: -1 },
      };
      const result = await classesCollection.find(quary, options).limit(6).toArray();
      res.send(result)
    })

    app.post("/classes", async (req, res) => {
      const studenClass = req.body;
      const result = await classesCollection.insertOne(studenClass);
      res.send(result)
    })

    // student added class
    app.post("/studentsClass", async (req, res) => {
      const studenClass = req.body;
      const result = await studentClassCollection.insertOne(studenClass);
      res.send(result)
    })

    app.get("/studentsClass", async (req, res) => {
      const result = await studentClassCollection.find().toArray();
      res.send(result)
    })

    app.delete("/studentsClass/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await studentClassCollection.deleteOne(query);
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



app.get("/", (req, res) => {
  res.send("cricket is runiing")
})

app.listen(port, () => {
  console.log("server is running")
})