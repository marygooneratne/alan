import "./home.css";
import "../../styles.css";
import "./header.css";
import {
  ThemeProvider,
  AppBar,
  Zoom,
  Typography,
  Button,
  Fade,
} from "@material-ui/core/";
import { EmbeddedEmailInput } from "../inputs/Inputs.js";
import { primaryTheme, fadeDefault } from "../../utils/constants.js";

import { useHistory, useLocation } from "react-router-dom";
import Header from "./Header";
import React, { useRef, useState, useEffect } from "react";
import { PageView, initGA, Event } from "../tracking/Tracking";
import ben from "./../../images/home/ben.png";
const trackingId = "UA-189058741-1";
const {
  REACT_APP_API_BASE_URL,
  REACT_APP_WAITLIST_URL,
  REACT_APP_CALCULATOR_URL,
} = process.env;

function Home() {
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const axios = require("axios");
  const emailInput = useRef(null);
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

  useEffect(() => {
    initGA(trackingId);
    PageView();
  });

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
    console.log(paramName);
    if (paramName == "referId") {
      referById = searchParams[i].split("=")[1];
    }
  }

  function addEmail(email) {
    axios
      .post(REACT_APP_API_BASE_URL + REACT_APP_WAITLIST_URL, {
        email: email,
      })
      .then(function (response) {
        const referToId = response.data.referId;
        history.push({
          pathname: "/onboard",
          state: { email: email, referToId: referToId, referById: referById },
        });
        console.log(response);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <ThemeProvider theme={primaryTheme}>
      <div className="page-root row-container">
        <Header />

        <Fade in {...fadeDefault}>
          <div className="home-c0 column-container">
            <div className="home-c1 row-container">
              <Typography
                variant="h2"
                color="textPrimary"
                className="home-title"
              >
                Get up to a <span className="purple-highlight">$5,000</span> tax
                refund in <span className="purple-highlight">10 minutes</span>.
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
                variant="body2"
                color="textPrimary"
                className="home-subtitle"
              >
                The government owes students money. Alan will find you the
                credits you qualify for, maximize your refund, explain why. All
                in under 10 minutes.
              </Typography>
            </div>

            <img src={ben} className="home-ben"></img>
          </div>
        </Fade>
      </div>
    </ThemeProvider>
  );
}
export default Home;
