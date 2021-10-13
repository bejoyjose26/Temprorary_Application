import React, { useState } from "react";
import { useHistory} from "react-router";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core";
import Axios from 'axios';
import UserPool from '../../Userpool'; 

Axios.defaults.withCredentials= true;
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

const poolData = {
  UserPoolId: 'eu-west-1_i5LwEW1fk',
  ClientId: '490d9kmdpf1vkbfs3hpiu0v3gc'
};

//const UserPool = new CognitoUserPool(poolData);

const SignInForm = ({ handleClose }) => {
  const classes = useStyles();
  const history = useHistory();
  // create state variables for each input
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("HII");
    UserPool.signUp(email, password, [], null, (err, data) => {
      if (err) console.error(err);
      console.log(data);
    })
      
    history.push({
      pathname:  "/",
      state: {
        messgae: "registered successfully"
      }
    });
   


    // Axios.post("http://localhost:3000/register", {firstName:firstName, lastName:lastName, email:email, password:password}).then((response) =>{
    //   console.log(response);
    
    //   history.push({
    //     pathname:  "/",
    //     state: {
    //       response: response.data,
    //       messgae: "registered successfully"
    //     } 
    //  });
    // });
    //handleClose();
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <TextField
        label="First Name"
        variant="filled"
        required
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <TextField
        label="Last Name"
        variant="filled"
        required
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
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
        <Button variant="contained" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Signup
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;
