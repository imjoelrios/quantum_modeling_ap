import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, List, ListItem } from "@mui/material";
import ReactMarkdown from "react-markdown";
import data from '../data/content.json';

const cardStyle = {
  backgroundColor: "#FFFFFF",
  marginTop: "2%",
  marginBottom: "2%",
  padding: "2%",
  boxShadow: "0 0 5px -1px rgba(0,0,0,0.2)",
  borderRadius: "10px",
};

interface SectionData {
  title: string;
  msg: string;
  imageUrl?: string;
  imagePath?: string;
}

interface PageData {
    [key: string]: SectionData[];
}

const CustomDescriptionBox = ({ pageTitle }: { pageTitle: string }) => {
    const sections: SectionData[] = (data as PageData)[pageTitle.toLowerCase()] || [];

  return (
    <div>
      {sections.map((section, index) => (
        <Card key={index} style={cardStyle}>
          <CardContent>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Box display="flex" flexDirection="column">
                <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ fontWeight: "bold", marginBottom: 2 }}>
                  {section.title}
                </Typography>
                <Typography 
                    component="div" 
                    whiteSpace="pre-line" 
                    sx={{ textAlign: "left", flex: 1, fontSize: 18}}>
                  <ReactMarkdown>{section.msg}</ReactMarkdown>
                </Typography>
              </Box>
              {(section.imageUrl || section.imagePath) && (
                <Box
                  component="img"
                  src={section.imageUrl || (section.imagePath ? `${process.env.PUBLIC_URL}${section.imagePath}` : '')}
                  alt="Description related image"
                  sx={{
                    maxWidth: '30%',
                    maxHeight: '100%',
                    marginLeft: 15,
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomDescriptionBox;
