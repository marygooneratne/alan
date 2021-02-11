import {
  Card,
  CardContent,
  Typography,
  Button,
  ThemeProvider,
  Dialog,
  DialogTitle,
  CircularProgress
} from "@material-ui/core";
import { primaryTheme } from "../../utils/constants.js";
import "./../../styles.css";
import "./refund.css";
import RefundBreakdown from "./RefundBreakdown.js";
import { AuthContext } from "../../providers/AuthProvider";
import { useState, useContext, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { getUserDoc } from "../../firebase";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
function numberWithCommas(x) {
  if(x==null){
    return "";
  }
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function Refund(props) {
  let location = useLocation();
  const history = useHistory();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [email, setEmail] = useState(null);
  const [referToId, setReferToId] = useState(null);
  const [referById, setReferById] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const user = useContext(AuthContext);
  const redirect = (path, state) => {
    history.push({ pathname: path, state: state });
  };
  const loadFromState = () => {
    let em = null;
  let rtid = null;
  let rbid = null;
  let bd = null;
    try {
      em = location.state["email"];
    } catch {
      em = null;
    }
    try {
      rtid = location.state["referToId"];
    } catch {
      rtid = null;
    }
    try {
      rbid = location.state["referById"];
    } catch {
      rbid = null;
    }
    try {
      bd = location.state["breakdown"];
    } catch {
      bd = null;
    }
    return [em, rtid, rbid, bd];
  }
  const loadFromUser = async () => {
  let em = null;
  let rtid = null;
  let rbid = null;
  let bd = null;
    if(user.user) {
      const userData = await getUserDoc(user);
      em = userData['email'];
      rtid = userData['referToId'];
      rbid = userData['referById'];
      bd = userData['refundBreakdown'];
    }
    return {email: em, referToId: rtid, referById: rbid, breakdown: bd};
  }
  let em, rtid, rbid, bd;
  useEffect(() => setTimeout(() => {
    console.log(loadAttempts);
    console.log("efffectt");
    if(!user.user && !dataLoaded && loadAttempts > 2) {
      console.log("no user");
      if(location.state == null) {
        console.log('no state');
        redirect('/',null);
      }
      [em, rtid, rbid, bd] = loadFromState();
      console.log('loaded state', em, bd)
      if(bd==null) {
        console.log('no breakdown');
        redirect('/',null)
      }
      console.log('calculator good')
      setEmail(em);
      setReferToId(rtid);
      setReferById(rbid);
      setBreakdown(bd);
      setDataLoaded(true);
    } else if(user.user && !dataLoaded) {
      console.log('user logged in')
      loadFromUser().then((res) => {
        console.log(res)
        em = res.email;
        rtid = res.referToId;
        rbid = res.referById;
        bd = res.breakdown;
        if(em == null) {
          //users not logged in, some bug earlier
          console.log('bug in log in, email not found')
          redirect('/',null)
        } else if(bd == null) {
          // user hasn't taken calculator, send them to the start of the calculator
          console.log('no breakdown for user, need to retake quiz')
          redirect('/onboard', {email: em, referToId: rtid, referById: rbid});
        }
        //otherwise they're gtg
        console.log(bd, 'user ready')
        setEmail(em);
        setReferToId(rtid);
        setReferById(rbid);
        setBreakdown(bd);
        setDataLoaded(true);
      })
    } else if(!dataLoaded) {
      setLoadAttempts(loadAttempts + 1);
    }
  }, 500));
  
  
  const navTo = () => {
    if (user.user) {
      history.push({
        pathname: "/account",
      });
    } else {
      history.push({
        pathname: "/join",
        state: {
          email: email,
          referToId: referToId,
          referById: referById,
          breakdown: breakdown,
        },
      });
    }
  };

  return (
    <ThemeProvider theme={primaryTheme}>
      <div className="onboard-complete-c0-top row-container">
        {/* <div className="header" /> */}
        {/* <div className="onboard-complete-help-button-container">
          <div
            className="onboard-complete-help-button row-container "
            onClick={navTo}
          >
            <Typography variant="h6" className="onboard-complete-help-text">
              Help me file
            </Typography>
            <img src={whiteArrow} className="onboard-complete-help-arrow"></img>
          </div>
        </div> */}
        <div className="onboard-complete-c1 column-container">
          <div className="onboard-complete-c1-content column-container">
          
          {dataLoaded ? <div className="onboard-complete-c1-breakdown">
            <Card className="onboard-complete-card-mobile">
                <CardContent
                  onClick={navTo}
                  className="onboard-complete-card-1-content"
                  style={{cursor: "pointer"}}
                >
                  <Typography
                    className="refund-card-button-text"
                    variant="h4"
                    color="primary"
                  >
                    Help me file my taxes  
                  </Typography>
                </CardContent>
              </Card>
              <Typography className="onboard-complete-title" variant="h6">
                Your estimated refund amount
              </Typography>
              <Typography
                className="refund-amount "
                variant="h1"
                color="secondary"
              >
                ${numberWithCommas(breakdown.netRefund)}
              </Typography>
              <RefundBreakdown breakdown={breakdown}></RefundBreakdown>
              <Card className="onboard-complete-card-mobile">
                <CardContent className="onboard-complete-card-2-content">
                  <div className="refund-card-text">
                    {" "}
                    <Typography
                      color="textSecondary"
                      variant="h5"
                      className="refund-card-title"
                    >
                      $XXX
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="caption"
                      className="refund-card-caption"
                    >
                      That's how much you lose fucker.
                    </Typography>
                  </div>
                </CardContent>
              </Card>
              <Card className="onboard-complete-card-mobile">
                <CardContent className="onboard-complete-card-3-content">
                  {" "}
                  <div className="refund-card-text row-container">
                    <Typography
                      color="textSecondary"
                      variant="h5"
                      className="refund-card-title"
                    >
                      $XXX
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="caption"
                      className="refund-card-caption"
                    >
                      That's how much you lose fucker.
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </div>: <CircularProgress/>}
            
            <div className="row-container onboard-complete-card-container">
              <Card className="onboard-complete-card">
                <CardContent
                  onClick={navTo}
                  className="onboard-complete-card-1-content"
                  style={{cursor: "pointer"}}
                >
                  <Typography
                    className="refund-card-button-text"
                    variant="h4"
                    color="primary"
                  >
                    Help me file my taxes <ArrowForwardIosRoundedIcon />
                  </Typography>
                </CardContent>
              </Card>
              <Card className="onboard-complete-card">
                <CardContent className="onboard-complete-card-2-content">
                  <div className="refund-card-text">
                    {" "}
                    <Typography
                      color="textSecondary"
                      variant="h5"
                      className="refund-card-title"
                    >
                      $XXX
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="caption"
                      className="refund-card-caption"
                    >
                      That's how much you lose fucker.
                    </Typography>
                  </div>
                </CardContent>
              </Card>
              <Card className="onboard-complete-card">
                <CardContent className="onboard-complete-card-3-content">
                  {" "}
                  <div className="refund-card-text row-container">
                    <Typography
                      color="textSecondary"
                      variant="h5"
                      className="refund-card-title"
                    >
                      $XXX
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="caption"
                      className="refund-card-caption"
                    >
                      That's how much you lose fucker.
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="onboard-complete-footer">
          <Button
            variant="contained"
            className="onboard-complete-apply-button"
            onClick={navTo}
          >
            {user ? "Save This Refund Data" : "Ready to file? Apply now"}
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
}
export default Refund;
