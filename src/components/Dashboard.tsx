import * as React from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function Dashboard() {
  const card_style = {
    backgroundColor: "rgba(52, 52, 52, 0)",
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30%" }}>
      <Card>
        <Button
          id="fade-button"
          aria-controls={open ? "fade-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
          style={{
            color: "black",
            fontWeight: "bolder",
            textTransform: "none",
            fontSize: 20,
            paddingTop: "2%",
            paddingBottom: "5%",
            margin: 0,
          }}
        >
          Dashboard
        </Button>
      </Card>
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem component={Link} to="/">
          {" "}
          Home{" "}
        </MenuItem>
        <MenuItem component={Link} to="/Tunneling">
          {" "}
          Tunneling{" "}
        </MenuItem>
        <MenuItem component={Link} to="/interference">
          {" "}
          Interference{" "}
        </MenuItem>
        <MenuItem component={Link} to="/spintraceevo">
          {" "}
          Spin Trace Evolution{" "}
        </MenuItem>
      </Menu>
    </div>
  );
}
