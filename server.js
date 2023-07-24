import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';


const app = express();

app.use(cors());

const PORT  = process.env.PORT || 4050;

app.get('/', (req, res) => {
    res.json({ message: 'Fcuk you' });

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});