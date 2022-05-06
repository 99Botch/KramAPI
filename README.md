# KramAPI
Kram API is the application responsible to communicate with the client Kram and it's database. Follow the instructions bellow to play with the code in your IDE:

- run `npm ci` to install the dependencies
- copy the `example.env` file and rename it as `.env`
- Modify DB_CONNECTION to the name of your mongo cluster's URI
- Generate a `SECRET_KEY`
- Create a cloudinary account and get the API key, cloud name and seret key that you will then put in the `.env` file
- Finally run `npm start`

Run `npm build` to complie you code

If you want to modify the source code, I would advise you to modify switch the start sript in the package.json as such: `"start": "nodemon src/app.js"` and revert back to `"start": "nodemon build/index.js"` for production.

___

The API was made by myself for my professionnal project at IADT, Y4 Creative Computing. <br />
Have a look at the repo for the application itself
