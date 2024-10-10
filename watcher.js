const events = require("events");
const fs = require("fs");
const watchFile = "test.log";
const bf = require('buffer');
const TRAILING_LINES = 10;
const buffer = new Buffer.alloc(bf.constants.MAX_STRING_LENGTH);
  
  


 // this fuction not working proper.
// watch(curr, prev) {
//     const watcher = this;
//     const startPosition = this.lastSize;

//     // Update lastSize for the next change
//     this.lastSize = curr.size;

//     // Read only the new data since the last update
//     fs.readFile(this.watchFile, 'utf8', (err, data) => {
//       if (err) throw err;

//       // Extract the new data from the previous size
//       const newData = data.slice(startPosition);
//       const newLogs = newData.split("\n").filter(line => line.length > 0); // Remove any empty lines

//       console.log("logs read: " + newLogs);

//       // Update the store with the latest lines
//       newLogs.forEach((elem) => {
//         if (this.store.length === TRAILING_LINES) {
//           this.store.shift(); // Remove the oldest line if the store exceeds TRAILING_LINES
//         }
//         this.store.push(elem); // Add the new log line
//       });

//       watcher.emit("process", this.store); // Emit the updated store
//     });
//   }

//   start() {
//     const watcher = this;

//     // Read the entire file initially and initialize the store
//     fs.readFile(this.watchFile, 'utf8', (err, data) => {
//       if (err) throw err;

//       const logs = data.split("\n").filter(line => line.length > 0); // Remove any empty lines
//       this.store = logs.slice(-TRAILING_LINES); // Store only the last TRAILING_LINES lines
//       this.lastSize = fs.statSync(this.watchFile).size; // Get the initial file size

//       // Watch the file for changes
//       fs.watchFile(this.watchFile, { interval: 1000 }, (curr, prev) => {
//         watcher.watch(curr, prev);
//       });
//     });


class Watcher extends events.EventEmitter {
  constructor(watchFile) {
    super();
    this.watchFile = watchFile;
    this.store = [];
  }
  getLogs()
  {
      return this.store;
  }

  watch(curr,prev) {
    const watcher = this;
    fs.open(this.watchFile,(err,fd) => {
        if(err) throw err;
        let data = '';
        let logs = [];
        fs.read(fd,buffer,0,buffer.length,prev.size,(err,bytesRead) => {
            if(err) throw err;
            if(bytesRead > 0)
            {
                data = buffer.slice(0,bytesRead).toString();
                logs = data.split("\n").slice(1);
                console.log("logs read:"+logs);
                if(logs.length >= TRAILING_LINES)
                {
                    logs.slice(-10).forEach((elem) => this.store.push(elem));
                }
                else{
                    logs.forEach((elem) => {
                        if(this.store.length == TRAILING_LINES)
                        {
                            console.log("queue is full");
                            this.store.shift();
                        }
                        this.store.push(elem);
                    });
                }
                watcher.emit("process",logs);
            }
        });
    });
   
    }

    

  start() {
    var watcher = this;
    fs.open(this.watchFile,(err,fd) => {
        if(err) throw err;
        let data = '';
        let logs = [];
        fs.read(fd,buffer,0,buffer.length,0,(err,bytesRead) => {
            if(err) throw err;
            if(bytesRead > 0)
            {   
                data = buffer.slice(0,bytesRead).toString();
                logs = data.split("\n");
                this.store = [];
                logs.slice(-10).forEach((elem) => this.store.push(elem));
            }
            fs.close(fd);
            });
    fs.watchFile(this.watchFile,{"interval":1000}, function(curr,prev) {
        watcher.watch(curr,prev);
    });
  });
}
}
  
module.exports = Watcher;

