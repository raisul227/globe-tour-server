const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware
app.use(cors());
app.use(express.json());
require('dotenv').config();

app.get('/', (req, res) => {
    res.send('Global tour server is running')
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@dataserver.wdratsj.mongodb.net/?retryWrites=true&w=majority`;

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
        const serviceCollection = client.db('globeTour').collection('services');
        const bookingCollection = client.db('globeTour').collection('bookings');
        // Connect the client to the server	(optional starting in v4.7)
        app.get('/services', async (req, res) => {
            const result = await serviceCollection.find().limit(6).toArray();
            res.send(result);
        })

        app.get('/allServices', async (req, res) => {
            const result = await serviceCollection.find().toArray();
            res.send(result);
        })
        app.get('/allServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        //bookings

        app.get('/bookings', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query?.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booked = req.body;
            const result = await bookingCollection.insertOne(booked);
            res.send(result);
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const bookedItem = req.body;
            const updatedDoc = {
                $set: {
                    status: bookedItem.status
                }
            };
            const result = await bookingCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })


        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);








app.listen(port, () => {
    console.log(`Globe server is running on port ${port}`)
});