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

// === styles ===
import { sidebar_style } from "../global_styles";
// const select_style = { backgroundColor: "#FFFFFF" };
const img_style = {
  borderRadius: "10px",
  boxShadow: "0 0 5px -1px rgba(0,0,0,0.2)",
  width: "100%",
};
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
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        // collapsible
        // collapsed={collapsed}
        // onCollapse={(value) => setCollapsed(value)}
        style={sidebar_style}
        width={230}
      >
        <CustomTitle/>
        <Box
            component="form"
            sx={{
              "& > :not(style)": { m: 0.5, width: "25ch" },
            }}
            noValidate
            autoComplete="off"
            style={horizontal_center}
        >

          <Stack spacing={3}>
            
            {/* ====== Select Inputs ====== */}
            {/* Momentum Slider*/}
            <FormControl variant="filled">
              <InputLabel 
                id="momentum-select"
                style={{color: "white", marginTop: "10px",  marginBottom: "10px",textAlign: "center"}}
                >  
                Momentum
                </InputLabel>
              <Slider
                sx={{ color: "#FFFFFF" }}
                aria-label="momentum-select"
                value={momentum}
                onChange={handleWave}
                min={1}
                max={10}
                defaultValue={1}
                valueLabelDisplay="auto"
                step={1}
              />
            </FormControl>

            {/* Spacing slider */}
            <FormControl variant="filled">
              <InputLabel 
                id="spacing-select"
                style={{color: "white", marginTop: "10px", marginBottom: "10px",textAlign: "center"}}
                >  
                Spacing
                </InputLabel>
              <Slider
                sx={{ color: "#FFFFFF" }}
                aria-label="spacing-select"
                value={spacing}
                onChange={handleSpacing}
                min={0.1}
                max={5}
                defaultValue={0.6}
                valueLabelDisplay="auto"
                step={0.1}
              />
            </FormControl>

            {/* Slit Seperation slider */}
            <FormControl variant="filled">
              <InputLabel 
                id="slit-select"
                style={{color: "white", marginTop: "10px", marginBottom: "10px", textAlign: "center"}}
                >  
                Slit Separation
                </InputLabel>
              <Slider
                sx={{ color: "#FFFFFF" }}
                aria-label="slit-separation-select"
                value={slit_separation}
                onChange={handleSlitSep}
                min={0.2}
                max={5}
                defaultValue={0.6}
                valueLabelDisplay="auto"
                step={0.1}
              />
            </FormControl>

            {/* ====== Submit Button ====== */}
            {loading ? (
              <CircularProgress />
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                type="submit"
                color="success"
              >
                Generate Model
              </Button>
            )}

            {/* ====== Dashboard ====== */}
            <Dashboard />

            {/* ====== Snackbar ====== */}
            <Snackbar
              open={open}
              autoHideDuration={6000}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                onClose={handleClose}
                severity="success"
                sx={{ width: "100%" }}
              >
                {success_msg}
              </Alert>
            </Snackbar>
          </Stack>
        </Box>
      </Sider>
      <Content className="site-layout" style={{margin: "5%"}}>
        <CustomPageHeader text="Interference" size="h3"/>
        {/*<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}*/}
        {/*     ref={animationContainerRef}></div>*/}
        <div style={{display: 'flex', justifyContent: 'center'}} ref={animationContainerRef}></div>
        {/*<div ref={animationContainerRef}/>*/}
        <CustomDescriptionBox
            msg={`Quantum interference states that elementary particles can not only be in more than one place at any given time (through superposition), but that an individual particle, such as a photon (light particles) can cross its own trajectory and interfere with the direction of its path.
          
          Particles in quantum mechanics behave very differently from those that we observe day-to-day in the realm of classical physics. Each particle behaves both as a solid object with a calculable energy and momentum and a wave with a calculable frequency and wavelength. This is only possible at incredibly low scale due to a phenomenon known as the “Wave-Particle Duality” as described by the DeBroglie Wavelength which dictates that all entities have a known frequency relative to the Planck’s Constant (6.63 * 10^-23) and its momentum.
          
          F = p/h
          
          Note that the frequency increases very quickly with momentum and thus the wavelength quickly becomes incalculably small unless the momentum is also suitably small, like for example, an electron or a photon as shown in this example.
          
          Shown is a classic demonstration of the Wave-Particle Duality by showing photons interfering with each other. Normally, when a light is shown at an object, the resulting shadow would simply be the negative of that object. However, in this example, where a beam of light is shown at a pair of slits, two slits do not form as a negative on the resulting side, but rather a periodic spectrum of dashes of diminishing intensity. If the photons were only particles, they should have been able to pass through theslits and carried on as there should have been no interfering obstacle but they not only appear to splash outwards from the slits, thus hinting at their wave-like nature, but the resulting waves interfere with each other thus suggesting contact interactions among the particles of each resultant waves. Shown is a top-down view of the experiment and a representation of reflection from the barrier to demonstrate that no interference is resultant from tunneling but only from the two resultant waves intersecting at regular angular intervals. Try altering the spacing and width of the slits and kinetic energy of the wave. How does the wavelengthof the incoming wave appear to change the size and frequency of the dashes on the wall? Does increasing or decreasing the kinetic energy of the wave affect the interference pattern? Why or why not?
          `}
        />
      </Content>
    </Layout>
  );
};

export default Interference;
