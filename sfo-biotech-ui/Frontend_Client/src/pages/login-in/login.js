import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useHistory} from "react-router";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core";
import Axios from 'axios';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import Amplify, { Auth } from 'aws-amplify';
import UserPool from '../../Userpool'; 
import g_button from "../../assets/images/G-Button.png";


Amplify.configure({
  Auth: {

      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: 'us-west-2:78b4cb52-8279-4231-b21d-d74dc17bfde',

      // REQUIRED - Amazon Cognito Region
      region: 'us-west-2',

      // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
      // Required only if it's different from Amazon Cognito Region
      identityPoolRegion: 'us-west-2',

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: 'us-west-2_sYDErn7SE',

      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolWebClientId: '3rfiqbq2nb1lcaorgnekd47hae',

      oauth: {
        domain: 'sfo-biotech.auth.us-west-2.amazoncognito.com',
        redirectSignIn: 'http://0.0.0.0:3000/',
        redirectSignOut: 'http://0.0.0.0:3000/',
        responseType: 'token' // or 'token', note that REFRESH token will only be generated when the responseType is code
    }
  }
});


const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),

    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "300px",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(2),
    },
  },
}));



const LoginIn = ({ handleClose }) => {
  const classes = useStyles();
  const history = useHistory();
  // create state variables for each input

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessgae, setErrorMessgae] = useState("");

  Axios.defaults.withCredentials= true;

  // const g_signup = (e) => {
  //   console.log("HI")
  //   console.log(email)
  //   console.log(password)
  //   const name = '';
  //   Auth.signUp({
  //     name: email,
  //     username: email,
  //     password,
  //     attributes: {
  //       name,
  //       email,          // optional
  //       // other custom attributes 
  //     }
  //   })
  //     .then(data => alert("data"))
  //     .catch(err => console.log(err));
  // };



  const handleLogin = (e) => {
    e.preventDefault();
    const user = new CognitoUser({
      Username: email,
      Pool: UserPool
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    user.authenticateUser(authDetails, {
      onSuccess: data =>{
        console.log('onSuccess:', data);
        history.push({
          pathname:  "/dashboard",
          state: {
            response: data 
          } 
       });
      },
      onFailure: err =>{
        console.log('onFailure:', err);
      },
      newPasswordRequired: data =>{
        console.log('newPasswordRequired:', data);
      }

    });

    // Axios.post("http://localhost:3000/login", {email:email, password:password}).then((response) =>{
    //   console.log(response.data);
    //   if(response.data.message){
    //     setErrorMessgae(response.data.message);
    //   }else{
    //     setErrorMessgae("");
    //     history.push({
    //       pathname:  "/dashboard",
    //       state: {
    //         response: response.data 
    //       } 
    //    });
    //   }
    // });
    //handleClose();
  };

  useEffect(() => {
    console.log("HI");
    Axios.get("http://localhost:3000/login").then((response) => {
    console.log(response);
    })
  },[]);
  return (
    <form className={classes.root} onSubmit={handleLogin}>

      <TextField
        label="Email"
        variant="filled"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        variant="filled"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div>
        <Button type="submit" variant="contained" onClick={handleClose} color="primary">
          Log In
        </Button>
        <Button variant="contained" component={Link} to="/signup">
          Sign In
        </Button>
      </div>
      <div style={{fontFamily: 'arial'}}>
        OR
      </div>
      <div>
        <Button onClick={() =>{
          Auth.federatedSignIn({provider: 'Google'})
        }}>
          <img src={g_button} />
        </Button>
      </div>
      <h1>{errorMessgae}</h1>
    </form>
  );
};

export default LoginIn;
