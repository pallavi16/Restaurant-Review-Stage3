

# Restaurant-Review-Stage3
## Part 3: Additional functionality after connecting the fully responsive, mobile-ready Restaurant review application in part 2 from part 1 to an external server

## Overview:
In Stage Three of Restaurant-Review Application, we utilize the fully-responsive, mobile-ready application from Stage 1 and also the connected application to external server from Stage 2 into a fully functional application with a lot more features. 
Some of these features include:
1. Adding a form that allows the users to create their own restaurant reviews
2. When run offline, the form will defer updating to remote DB till the connection is established.
3. Optimizing the site to meet stricter performance criterias than applied in Stage Two.
4. Testing using Lighthouse to achieve performance > 90 (a goal measure) in  different characteristics.


## Installing and running the development server (Same as used in Stage Two)
Download the server from https://github.com/udacity/mws-restaurant-stage-2. You can either use command line to clone the repo using 'git clone URL' or you can download the zip folder given in the server repo. To run the server, make sure that you have node, npm , sails installed on your machine. Now, start the server by running node server from root folder. By default, the port is set to 1337 and can be run on http://localhost:1337. However, the port can be changed if needed.

## Running the application
To run the application, first of all, clone this repo.

Using Terminal enter into project directory
In the terminal, check the version of node, npm to ensure that these are installed.
Then run -
* npm i 
* npm install -g gulp (To install gulp globally)

After installing these dependencies, 
### Start the server using: 
* gulp build (Builds the application)
* gulp (Deploy and run it on localhost) 

By default, the server is running on http://localhost:3000
To debug/test the code, Chrome DevTools serve the purpose in the Browser Inspector. You will also see a message in the console "Service worked registered" to show that the app is running successfully
