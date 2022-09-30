
# HD Ticket System

This project is an IT/HD ticket system that enables users to easily submit tickets.
Additionally, IT administrators can easily view all unresolved tickets, and resolve them.

The tickets/incidents themselves are based on MongoDB, as each ticket is a document in the collection.

## Installation

Make sure you meet the requirements:
- NodeJS
- MongoDB (set default paths)

Then, change to your project directory and clone the repository.

```bash
  cd my-project
  git clone https://github.com/noammilner/TicketSystem.git
```
Make sure to install all required dependencies:

```bash
npm install
```

If you wish to change the target MongoDB server/port make sure to do so inside app.js.
If you're happy with the default settings, continue to run MongoDB and the application:

```bash
mongod
node app.js
```
## Contributing

Contributions are always welcome!

Feel free to submit pull requests and suggest improvments and features.

