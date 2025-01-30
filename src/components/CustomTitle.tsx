import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@mui/material";

const card_style = {
  backgroundColor: "#063970",
  border: "1px solid #FFFFFF",
  margin: "2%",
  boxShadow: "0 0 5px -1px rgba(0,0,0,0.2)",
  padding: "2%",
};
// ==========================================
// ==============  CustomTitle ==============
// ==========================================
const CustomTitle = ({pageName = "Quantum"}) => {
  return (
    <div>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Card style={card_style}>
          <p style={{ textAlign: "center" }}>
            <h2
              style={{
                color: "#FFFFFF",
                fontWeight: "bolder",
                paddingTop: "5%",
                margin: 0,
              }}
            >
              {pageName} Model Generator
            </h2>
          </p>
        </Card>
      </Link>
      <h4
        style={{
          color: "#000000",
          textAlign: "center",
          paddingTop: "3%",
          margin: 0,
          fontSize: 16,
        }}
      >
        Select the values for the model and click Generate Model when you're ready!
      </h4>
    </div>
  );
};

export default CustomTitle;
