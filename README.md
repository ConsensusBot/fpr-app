# gitter-gimp

A web application built to serve the needs of The Bitcoin Cash Fund and it's community

## Features

### Current Features
- Hosts a web form to be used for submitting BCF project proposals (FPRs)

### Planned Features
- Host the "Github App" responsible for parsing the web form and automating the necessary Github tasks on behalf of those submitting proposals.
- Distribute and manage FPR numbers to ensure number uniqueness and prompt delivery to those in need.
- Hosts a programmable chat bot capable of delivering information to the BCHF Rocket Chat instance

## About the app

### Software Stack
- nodejs application
- Hosted on Heroku
- Sails.js backend javascript MVC framework (uses Express.js under the hood)
- Redis for Socket and Session stores
- Postgresql for data store
- EJS for HTML templating
- Vue JS for frontend controllers and UI components
- Bootstrap.js for forms and styles
- Various other front-end dependencies

### Running the App
1. Must be running npm and at least version 8 of node.js
2. Clone the project locally
3. `CD` into gitter-gimp and install it's dependencies using `npm install`
4. Start the app with `sails lift`
5. Navigate to `http://localhost:1337/form`

### Contributing
Please feel free to submit issues and pull requests.  There's a lot of planning left to do but if you see something obvious, please let us know. 

### Links

+ [Bitcoin Cash Fund Homepage](https://thebitcoincash.fund/)
+ [Learn about Bitcoin Cash](https://www.bitcoincash.org/)
+ [Bitcoin Cash Fund Gitter Community](https://gitter.im/Bitcoin-Cash-Fund/)
+ [Bitcoin Cash Fund Github Organization](https://github.com/The-Bitcoin-Cash-Fund)
+ [Bitcoin Cash Fund Trello](https://trello.com/bitcoincashfund)
+ [Sails.js MVC Framework Docs](https://next.sailsjs.com/documentation/reference)
