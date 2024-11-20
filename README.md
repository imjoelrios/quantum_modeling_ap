# Quantum Modeling App

Computational Nano Lab, UFL

## Architecture Overview
![image](https://github.com/user-attachments/assets/36da6434-28a5-4bd1-9704-8288bce7b5be)


## Getting Started

### Prerequsites 
* Node 👉 install [here](https://nodejs.org/en/download/package-manager)
* Miniconda3 👉 install [here](https://docs.anaconda.com/miniconda/miniconda-install/)

### Installation - Part 1

1. Clone the repository
    ```
    git clone https://github.com/uf-quantum-computing/quantum_modeling_app.git
    ```
2. Install NPM packages
    ``` 
    cd src
    npm install
    ```
3. Start the frontend development server
    ```
    npm start
    ```

### Installation - Part 2 

1. Create a conda enviornment for the project
    ```
    conda create --name my_env_name python=3.12
    ```
2. Activate conda enviornment
    ```
    conda activate my_env_name
    ``` 
    At this point you should see that conda is activated to the my_env_name and you should verify that the proper python version is being used. You can check this with the below command which should be python 3.12.
    ```
    python --version
    ```
3. Install dependencies 
    ```
    cd quantum_app_backend
    pip install -r requirements.txt 
    ```
4. Run backend locally
    ```
    python app.py
    ```
5. Run backend in Docker container
    ```
    docker build -t flask-backend .
    docker run -p 3001:3001 flask-backend
    ```

### Running Locally 

1. Take the port that the backend is running on and replace it in `/src/setup/host.ts`.

For example, I run the backend and I get "Running on http://127.0.0.1:3001". Take this `http://127.0.0.1:3001` address and assign to the host variable (leave out the last `/`). Note: This file is not tracked by Git.

2. Utilize 2 terminals in parallel to run the back and the frontend.

3. If you're cloning the project for the first time and changes to `/src/setup` are being tracked, run:
```
git update-index --assume-unchanged src/setup/
```

## File Structure
- `/src/` - Contains the source code for the React website.
  - `/src/App.tsx` - The main entry point for the website. This is where the React Router is set up to route to the different pages.
  - `/src/pages` - Where each sub-page files are located
- `/backend_functions/` - Contains the backend code for handling requests and generating model gifs
  -  `/backend_functions/model_generators` - Contains the python code used to generate each model, ie `interference.py` or `tunneling.py`
-  `/src/data/content.json` - Contains the data for each text block on a page.
   -  If you are generating a new page you may use the component `<CustomDescriptionBox pageTitle=<name>/>`. This will make a box for each item in the pages content. The message will be rendered in markdown style for a better visual experience.
   -  It can handle image urls with the `imageUrl` parameter or a file in the public folder with `imagePath`
   -  For example `"imagePath": "/Single_V4.png"`
   -  For example `"imageUrl": "https://quantumawareness.net/wp-content/uploads/2019/01/doubleslottest-1400x793-71-2.jpg"`

## Tech Stack
### React

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

`npm start` Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

**Learn More**
* You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
* To learn React, check out the [React documentation](https://reactjs.org/).

### Sonar Cloud

Sonar Cloud is integrated with GitHub Actions to statically analyze code through the `.github/workflows/build.yml` and `sonar-project.properties` files.

You can learn more through [Getting Started with SonarCloud](https://docs.sonarcloud.io/getting-started/overview/)
