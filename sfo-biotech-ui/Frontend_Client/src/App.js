import React, { useState,useEffect } from 'react';
import { Link, Route, Switch, BrowserRouter as Router } from "react-router-dom";
import { Logo } from "./components/logo";
import './assets/css/App.css';
import './assets/css/style.css';
import SignInForm from "./pages/sign-in/sign-in";
import LoginIn from "./pages/login-in/login";
//Header
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import MenuIcon from "@material-ui/icons/Menu";
import Box from '@material-ui/core/Box';
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import clsx from "clsx";

//Drawer
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import LinkedCameraIcon from "@material-ui/icons/LinkedCamera";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import ArrowLeftSharpIcon from '@material-ui/icons/ArrowLeftSharp';


//Route Pages
import Dashboard from "./pages/Dashboard/dashboard1";
import DashboardKenWeb from "./pages/Dashboard/dashboardKenWeb";
import {
  ThemeProvider,
  makeStyles,
  createMuiTheme,
} from "@material-ui/core/styles";


const drawerWidth = 190;
const useStyles = makeStyles((theme) => ({
  root: {
    background: "inherit",
    border: 0,
    borderRadius: 15,
    color: "white",
    padding: "0 30px",
  },

  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    background: '#2E3B55'
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    item: {
      padding: 0
    }
  },
 
}));



function App(){
  const [renderedResponse, setRenderedResponse] = useState('');
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  const getResponse = async() => {
    const response = await fetch('/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  }

  const getStream =() => {
    alert("Hi");
    const response =  fetch('/api/hello');
    const body =  response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  }

  const theme = createMuiTheme({
    typography: {
      h2: {
        fontSize: 24,
      },
    },
    palette: {
      // primary: { main: green[800] },
    },
  });

  useEffect(() => {
    getResponse()
      .then(res => {
        const someData = res;
        setRenderedResponse(someData);
        //this.setState({ renderedResponse: someData });
      })
  },[]);
  
    //const { renderedResponse } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <Router>
          <div className="App">
            <h2>Call out to API!</h2>
            <header>
                <AppBar
                  position="fixed"
                  className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                  },'appbar-grad')}
                  //style={{ background: '#2E3B55' }}
                >
                  <Toolbar>
                    <Grid container justify="space-between">
                      <Grid item xs={2} md={1}>
                        {/* <Logo/>  */}
                        <IconButton
                          color="inherit"
                          aria-label="open drawer"
                          onClick={handleDrawerOpen}
                          edge="start"
                          className={clsx(classes.menuButton, open && classes.hide)}
                        >
                          <MenuIcon/>  
                        </IconButton>
                      </Grid>
                      <Grid item xs={9} md={10}>
                        
                          <Typography variant="h6" noWrap>
                            AERYNITE
                          </Typography>

                      </Grid>

                      <Grid item xs={2} md={1}>
                        <div>
                          <Logo />
                        </div>  
                      </Grid>
                    </Grid>
                  </Toolbar>
                </AppBar>
              </header>
              <Divider />
              <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{
                  paper: classes.drawerPaper,
                }}
              > 
                <div className={clsx(classes.drawerHeader,'appbar-grad','appbar-height')}>
                
                  <IconButton onClick={handleDrawerClose}>
                    {theme.direction === "ltr" ? (
                      <ChevronLeftIcon />
                    ) : (
                      <ChevronRightIcon />
                    )}
                  </IconButton>
                </div>
                
                <List disablePadding>
                  {[
                    { title: "Dashboard", route: "/dashboard"},
                    { title: "Upload Faces", route: "/upload-faces" },
                  ].map((item, index) => (
                    <Link to={item.route}>
                      <ListItem button key={item.title} classes={{ root: classes.item }} style={{backgroundColor: '#b09fad'}}>
                        <ListItemIcon>
                          {index % 2 === 0 ? (
                            <LinkedCameraIcon />
                          ) : (
                            <CloudUploadIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={item.title} />
                      </ListItem>
                      <Divider />
                    </Link>
                  ))}
                </List>
              </Drawer>
              <div className={classes.container}>
              <Switch>
                <Route
                  exact
                  path="/"
                  render={(props) => <div><LoginIn></LoginIn></div> }
                />
                 <Route
                  exact
                  path="/signup"
                  render={(props) => <div><SignInForm></SignInForm></div> }
                />   
                <Route
                  exact
                  path="/dashboard"
                  render={(props) => (
                    <div>
                      {/* <Dashboard {...props} setSelectedMode={setSelectedMode} /> */}
                      <Dashboard {...props}/>
                      {/* <WebcamComponent {...props} selectedMode={selectedMode} /> */}
                    </div>
                  )}
                />
                
                {/* KENESIS VIDEO STREAM */}
                <Route
                  exact
                  path="/dashboardKenWeb"
                  render={(props) => (
                    <div>
                      {/* <Dashboard {...props} setSelectedMode={setSelectedMode} /> */}
                      <DashboardKenWeb {...props}/>
                      {/* <WebcamComponent {...props} selectedMode={selectedMode} /> */}
                    </div>
                  )}
                />

                <Route
                  exact
                  path="/upload-faces"
                  render={(props) => (
                    {/* <UploadFaces {...props} selectedMode={selectedMode} /> */}
                  )}
                />
                {/* <WebcamComponent selectedMode={selectedMode}></WebcamComponent> */}
              </Switch>
            </div>
            {/* <p>{renderedResponse.express}</p> */}  
          </div>
        </Router>  
      </ThemeProvider>
    );
}

export default App;
