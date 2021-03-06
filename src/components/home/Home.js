import "./home.css";
import "../../styles.css";
import "../header/header.css";
import {
  ThemeProvider,
  AppBar,
  Zoom,
  Typography,
  Button,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@material-ui/core/";
import { EmbeddedEmailInput } from "../inputs/Inputs.js";
import Process from "../process/Process.js";
import { primaryTheme, fadeDefault } from "../../utils/constants.js";
import { Mixpanel } from "./../../mixpanel.js";
import { findUserByEmail } from "../../firebase";
import { useHistory, useLocation } from "react-router-dom";
import Header from "../header/Header";
import React, { useRef, useState, useEffect, forwardRef } from "react";
import { PageView, initGA, Event } from "../tracking/Tracking";

import ben from "./../../images/home/ben.png";
const trackingId = "UA-189058741-1";
const {
  REACT_APP_API_BASE_URL,
  REACT_APP_WAITLIST_URL,
  REACT_APP_CALCULATOR_URL,
} = process.env;

function Home(props) {
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const axios = require("axios");
  const emailInput = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const handleClickOpen = (old_user) => {
    setUser(old_user);
    setOpen(true);
  };

  const handleClose = (choice) => {
    if (choice == "no") {
      if (user) {
        Mixpanel.identify(user.referToId);
      }
      Mixpanel.track("visit_onboard", { source: "home" });
      history.push({
        pathname: "/onboard",
        state: {
          email: user.email,
          referToId: user.referToId,
          referById: user.referById,
        },
      });
    } else {
      if (user) {
        Mixpanel.identify(user.referToId);
      }
      Mixpanel.track("visit_sign_in", { source: "home" });
      history.push({
        pathname: "/signin",
      });
    }
    setOpen(false);
  };

  let referById = "";

  const keyDown = (e, val) => {
    var code = e.keyCode || e.which;

    if (code === 13 || code === 32 || code === 39) {
      if (!val) {
        invalidClick();
      } else {
        navTo();
      }
    }
  };
  const signUp = () => {
    if (email.includes("@") && email.length > 6) {
      navTo();
    } else {
      invalidClick();
    }
  };
  useEffect(() => {
    initGA(trackingId);
    Mixpanel.track("visit_home");
    PageView();
  }, []);

  const navTo = () => {
    Event("SIGNUP", "User Signed Up", "LANDING_PAGE");
    setLoading(true);
    addEmail(email);
  };

  const invalidClick = () => {
    setInvalid(true);
  };

  const searchParams =
    location.search.split("?").length == 1
      ? []
      : location.search.split("?")[1].split("&");
  let i;
  for (i = 0; i < searchParams.length; i++) {
    const paramName = searchParams[i].split("=")[0];
    if (paramName == "referId") {
      referById = searchParams[i].split("=")[1];
    }
  }

  const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  function AlertDialog(props) {
    return (
      <div>
        <Dialog
          open={props.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={props.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">Account Found</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              That email is already associated with an account, would you like
              to sign in?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => props.handleClose("no")} color="secondary">
              No Thanks
            </Button>
            <Button onClick={() => props.handleClose("yes")} color="secondary">
              Sign In
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  const addEmail = async (email) => {
    const old_user = await findUserByEmail(email);
    if (old_user == null) {
      history.push({
        pathname: "/onboard",
        state: { email: email, referById: referById },
      });
      axios
        .post(REACT_APP_API_BASE_URL + REACT_APP_WAITLIST_URL, {
          email: email,
        })
        .then(function (response) {
          const referToId = response.data.referId;
          props.setReferTo(referToId);
          Mixpanel.identify(referToId);
          Mixpanel.people.set({ $email: email });
          Mixpanel.track("waitlist_joined");
          Mixpanel.people.set_once({ sign_up_date: new Date() });
          setLoading(false);
        })
        .catch(function (error) {});
    } else {
      Mixpanel.identify(old_user.referToId);
      Mixpanel.track("waitlist_rejoined", { time: new Date() });
      handleClickOpen(old_user);
    }
  };

  return (
    <ThemeProvider theme={primaryTheme}>
      <div className="page-root row-container">
        <Header signUp={signUp} page={"Home"} />
        <Fade in {...fadeDefault}>
          <div className="home-c0 column-container">
            <div className="home-c1 row-container">
              <Typography
                variant="caption"
                color="secondary"
                className="home-label"
              >
                <strong>FOR STUDENTS </strong>
              </Typography>
              <Typography variant="h2" color="secondary" className="home-title">
                The average student leaves{" "}
                <span className="teal-highlight">$1,363</span> on the table
                during tax season
              </Typography>
              <Typography
                variant="body1"
                color="secondary"
                className="home-subtitle-lower"
              >
                We qualify students for unclaimed tax credits. Don't pay until
                you get paid, and if we can't get you a bigger refund we waive
                the $25 fee.
              </Typography>
              <EmbeddedEmailInput
                className="home-input"
                emailValue={email}
                setEmail={setEmail}
                invalid={invalid}
                onKeyPress={(e, val) => keyDown(e, val)}
                navTo={navTo}
                invalidClick={invalidClick}
                loading={loading}
              />

              <Typography
                variant="caption"
                color="secondary"
                className="qualifier-label"
              >
                <strong>EVEN IF YOU </strong>
              </Typography>
              <Typography
                variant="body1"
                color="secondary"
                className="qualifier-text"
              >
                ✅ Had no income <br />
                ✅ Your parents file for you
                <br />
                ✅ Are a dependent
                <br />
                ✅ Are an international student
                <br />
                ✅ Are on scholarship or grant
                <br />
                ✅ Were a student in the last 3 years
                <br />
              </Typography>
            </div>
            <img src={ben} className="home-ben"></img>
            <AlertDialog open={open} handleClose={handleClose} />
          </div>
          
        </Fade>
        {/* <div className="row-container process-container">
          <Process/>
        </div> */}
      </div>
      
    </ThemeProvider>
  );
}
export default Home;
