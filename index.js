// import fastify
const fastify = require('fastify')({
    logger: true
});

const mongoose = require('mongoose');

const path = require('path');

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env;

// add static middleward
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public', 'cobra'),
});

// Declare a route
fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
});

mongoose.model('Highscore', {
    name: String,
    score: Number,
});

// post route for a highscore
fastify.post('/highscore', async (request, reply) => {
    const { name, score } = request.body;
    //save the highscore in mongo
    const Highscore = mongoose.model('Highscore');
    const highscore = new Highscore({ name, score });
    await highscore.save();
    return reply.send({ status: 'ok' });
});

// get route for highscores
fastify.get('/highscore', async (request, reply) => {
    const Highscore = mongoose.model('Highscore');
    const highscores = await Highscore.find().sort({ score: -1 }).limit(10);
    return reply.send(highscores);
});

// Run the server!
const start = async () => {
    try {
        const dbCred = DB_USER ? `${DB_USER}:${DB_PASS}@` : '';
        const connectionString = `mongodb://${dbCred}${DB_HOST}:${DB_PORT}/${DB_NAME}`;
        await mongoose.connect(connectionString, {user: DB_USER, pass: DB_PASS, useNewUrlParser: true, useUnifiedTopology: true});
        console.log('MongoDB connected...');
        await fastify.listen({
            port: 3001,
            host: '0.0.0.0',
        })
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
};

start();