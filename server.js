const restify = require('restify');

const server = restify.createServer();

const data = require('./data');

/** These pre will be executed prior to routing */
server.pre(restify.plugins.pre.userAgentConnection());
server.pre(restify.plugins.pre.dedupeSlashes());

/**These use will be executed post routing  */
server.use((req, res, next) => {
  //console.warn('run for all routes!');
  if (req.path().indexOf('show-error') !== -1) {
     return next(new Error('Error occured'));
    //return next( new NotFoundError('not here'));
  }
  next();
});
server.use(restify.plugins.bodyParser({
    maxBodySize: 0,
    mapParams: true,
}));


/** Defining the routes */
server.get('/', (req, res, next) => {
  res.send('Welcome to Restify REST framework');
});

server.get('/people', (req, res, next) => {
  res.json(data.people);
  return next();
});

server.get('/people/:name', (req, res, next) => {
  const name = req.params.name;
  const personObj = data.people.find(person => person.name.toLowerCase() == name.toLowerCase());
  if (personObj) {
    res.json(personObj);
    return next();
  } else {
    const error = new Error();
    error.statusCode = 404;
    return next(error);
  }
});

server.post('/people', (req, res, next) => {
  const person = req.body;
  data.people.push(person);
  res.json(data.people);
  return next();
});

server.put('/people', (req, res, next) => {
  const personObj = req.body;
  const index = data.people.findIndex(person => personObj.name.toLowerCase() === person.name.toLowerCase());
  if (index == -1) {
    const error = new Error();
    error.statusCode = 404;
    return next(error);
  }
  data.people.splice(index, 1, personObj);
  res.json(data.people);
  return next();
});

server.del('/people', (req, res, next) => {
  const personObj = req.body;
  const index = data.people.findIndex(person => personObj.name.toLowerCase() == person.name.toLowerCase())
  if (index > -1) {
    data.people.splice(index, 1);
    res.json({removed: personObj});
  }
  return next();
});

const port = 3003;
server.listen(port, () => console.log(`${server.name} Restify server is running at ${server.url}`));

/*
 *  Unlike other REST frameworks, calling res.send() does not trigger next() automatically 
 *  In many applications, wor can continue to hapen after res.send().
 *  Flushing the response is not synonymous with completion of a request.
 *  
 */