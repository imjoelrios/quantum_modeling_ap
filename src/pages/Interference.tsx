import { useState, useEffect, useRef } from "react";
// === UI Components ===
import {
  Grid,
  Box,
  Button,
  Stack,
  SelectChangeEvent,
  Alert,
  Snackbar,
  InputLabel,
  FormControl,
  Slider,
  Card,
  CardContent
} from "@mui/material";
import CircularProgress from '@mui/joy/CircularProgress';
import { Layout } from "antd";
import "antd/dist/antd.min.css";
import host from "../setup/host";

// === Custom Components ===
import {
  Dashboard,
  CustomTitle,
  CustomPageHeader,
  CustomDescriptionBox,
} from "../components";

const horizontal_center = {
  display: "flex",
  // alignItems: "center",  # vertical center
  justifyContent: "center",
};

// === sub component imports ===
const { Sider, Content } = Layout;

// ========================================================
const Interference = () => {
  // ========= states =========
  const [loading, setLoading] = useState(false);
  const [momentum, setMomentum] = useState<number>(1);
  const [spacing, setSpacing] = useState<number>(0.6);
  const [slit_separation, setSlitSeparation] = useState<number>(0.6);
  const [animationJsHtml, setAnimationJsHtml] = useState('');
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const [spacingSliderMoved, setSpacingSliderMoved] = useState(false);
  const [slitSepSliderMoved, setSlitSepSliderMoved] = useState(false);
  const [waveSliderMoved, setWaveSliderMoved] = useState(false);
  const [success_msg, set_Success_Msg] = useState(
    "Interference model generated with spacing = " + spacing.toString() + ", slitSep = " + slit_separation.toString() + ", and wave = " + momentum.toString() + "!"
  );
  const [open, setOpenSnackbar] = useState(false);

  // ========= handle functions =========
  async function getGifFromServer(request_url: string) {
    try {
      const response = await fetch(request_url, {method: 'GET'});
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      // console.log("responseData: ", responseData);
      setAnimationJsHtml(responseData.GifRes); // Adjust based on your API response structure
      return response.ok;
    } catch (error) {
      console.error("Error fetching animation from server:", error);
      throw error;
    }
  }
  useEffect(() => {
    const loadDefaultHtml = async () => {
      try {
        console.log("triggered")
        fetch('/interference/probs_1_0.6_0.6_3D.html')
        .then((response) => response.text())
        .then((text) => {
          setAnimationJsHtml(text);
        console.log(text)
        });
      } catch (error) {
        console.error('Failed to load default HTML content:', error);
      }
    };

    loadDefaultHtml();
  }, []);
  useEffect(() => {
    if (animationJsHtml && animationContainerRef.current) {
      const container = animationContainerRef.current;
      container.innerHTML = animationJsHtml; // Now TypeScript knows container is a div element

      // Ensure TypeScript treats each script as an HTMLScriptElement
      const scripts = Array.from(container.querySelectorAll('script'));
      scripts.forEach((scriptElement) => {
        const script = scriptElement as HTMLScriptElement; // Type assertion
        const newScript = document.createElement('script');
        newScript.text = script.text;
        container.appendChild(newScript);
        script.parentNode?.removeChild(script);
      });
    }
  }, [animationJsHtml]);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // function to close the snackbar
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSpacing = (event: Event, spacingValue: number | number[]) => {
    setSpacing(spacingValue as number);
    setSpacingSliderMoved(true);
  };

  const handleSlitSep = (event: Event, slitSepValue: number | number[]) => {
    setSlitSeparation(slitSepValue as number);
    setSlitSepSliderMoved(true);
  };

  const handleWave = (event: Event, waveValue: number | number[]) => {
    setMomentum(waveValue as number);
    setWaveSliderMoved(true);
  };

  async function handleSubmit(event: any) {
    event.preventDefault();
    let spacing_str = spacing.toString();
    let slit_separation_str = slit_separation.toString();
    let wave_str = momentum.toString();
    console.log("spacing:", spacing_str);
    console.log("slit_separation:", slit_separation_str);
    console.log("wave:", wave_str);

    let base_url = host + "/receive_data/interference";
    let final_url =
    base_url + "/" + spacing_str +
    "/" + slit_separation +
    "/" + wave_str;

    if (spacingSliderMoved || waveSliderMoved || slitSepSliderMoved) {
      setLoading(true);
      const gifData = await getGifFromServer(final_url);
      if (gifData) {
        set_Success_Msg(
          "Interference model generated with barrier = " +
            spacing_str +
            ", thickness = " +
            slit_separation_str +
            ", and wave = " +
            wave_str +
            "!"
        );
        setLoading(false);
        setSpacingSliderMoved(false);
        setSlitSepSliderMoved(false);
        setWaveSliderMoved(false);
      }
    }
    setOpenSnackbar(true); // open snackbar
  }

return (
    <Layout 
        style={{ 
            minHeight: "100vh", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center" }}>

        <Content 
            className="site-layout" 
            style={{
                margin: "5%", 
                maxWidth: "70%", 
                minWidth: "1000px",
                border: "1px solid #063970" }}>

            {/* Title for the page */}
            <CustomPageHeader text="Interference" size="h3"/> 

            {/* Content for the page imported from data.json */}
            <CustomDescriptionBox pageTitle="Interference"/>

            <Card
                style={{
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "2%",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2%",
                    border: "1px solid #063970" }}>

                <CardContent 
                    style={{ 
                    flex: 1, 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: "1px solid red" }}>
                    
                    <Box
                        component="form"
                        sx={{
                            "& > :not(style)": { width: "200px" },
                            border: "1px solid ",
                        }}
                        noValidate
                        autoComplete="off"
                        display="flex"
                        flexDirection="column" >
                    
                        <Stack spacing={5}>

                            <CustomTitle pageName="Interference"/>

                            <FormControl fullWidth>
                                <InputLabel 
                                    id="spacing-label" 
                                    style={{ marginTop: "5%" }}>
                                    Spacing
                                </InputLabel>
                                <Slider
                                    aria-label="spacing"
                                    defaultValue={0.6}
                                    valueLabelDisplay="auto"
                                    step={0.1}
                                    min={0.1}
                                    max={1}
                                    onChange={handleSpacing}
                                    sx={{ color: "#063970" }}/>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel 
                                    id="slitSep-label" 
                                    style={{ marginTop: "5%" }}>
                                    Slit Separation
                                </InputLabel>
                                <Slider
                                    aria-label="slitSep"
                                    defaultValue={0.6}
                                    valueLabelDisplay="auto"
                                    step={0.1}
                                    min={0.1}
                                    max={1}
                                    onChange={handleSlitSep}
                                    sx={{ color: "#063970" }}/>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel 
                                    id="wave-label" 
                                    style={{ marginTop: "5%" }}>
                                    Wave
                                </InputLabel>
                                <Slider
                                    aria-label="wave"
                                    defaultValue={1}
                                    valueLabelDisplay="auto"
                                    step={1}
                                    min={1}
                                    max={5}
                                    onChange={handleWave}
                                    sx={{ color: "#063970" }}/>
                            </FormControl>

                            {loading ? (
                            <CircularProgress />
                            ) : (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                type="submit"
                                color="success">
                                Generate Model
                            </Button>
                            )}
                        </Stack>
                    </Box>
                </CardContent>

                <CardContent
                    style={{
                    flex: 5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: "1px solid #063970",
                    }}>
                    <div ref={animationContainerRef}></div>
                </CardContent>
            </Card>
        </Content>
    </Layout>
  );
};

export default Interference;